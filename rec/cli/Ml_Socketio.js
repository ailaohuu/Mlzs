/**
 * 核心模块，与服务器通信Socket.IO模块多个函数回调
 * @module SocketIO_autodd
 */
const Sio_log = require('./update_log')
let dexPath = './rec/dex/classes.dex';
runtime.loadDex(dexPath);
var SocketIO_autodd = (function () {
    var eventEmitter = {
        listeners: {},

        /**
         * 注册事件监听器
         * @param {string} eventName - 事件名称
         * @param {function} callback - 回调函数
         */
        on: function (eventName, callback) {
            if (typeof callback !== 'function') {
                console.error('事件回调必须是一个函数');
                return;
            }
            if (!this.listeners[eventName]) {
                this.listeners[eventName] = [];
            }
            this.listeners[eventName].push(callback);
        },

        /**
         * 清空指定/所有事件监听（新增：用于内部自动清理）
         * @param {string} [eventName] - 可选，不传则清空所有
         */
        clearListeners: function (eventName) {
            if (eventName) {
                this.listeners[eventName] = [];
            } else {
                this.listeners = {}; // 清空所有监听
            }
        },

        /**
         * 触发事件
         * @param {string} eventName - 事件名称
         * @param {...*} args - 传递给回调函数的参数
         */
        emit: function (eventName) {
            var args = Array.prototype.slice.call(arguments, 1);
            var callbacks = this.listeners[eventName];
            if (callbacks && callbacks.length > 0) {
                for (var i = 0; i < callbacks.length; i++) {
                    try {
                        callbacks[i].apply(this, args);
                    } catch (e) {
                        console.error('事件 \'' + eventName + '\' 的回调执行失败:', e);
                    }
                }
            }
        }
    };

    // 导入所需类
    importClass(Packages.androidx.appcompat.app.AppCompatActivity);
    importClass(android.os.Bundle);
    importClass(android.util.Log);
    importClass(org.json.JSONException);
    importClass(org.json.JSONObject);
    importClass(java.net.URISyntaxException);
    importClass(java.net.URI);
    importClass(Packages.io.socket.client.IO);
    importClass(Packages.io.socket.client.Socket);
    importClass(Packages.io.socket.emitter.Emitter);
    importClass(Packages.io.socket.engineio.client.transports.Polling);
    importClass(Packages.io.socket.engineio.client.transports.WebSocket);
    
    let io = null;
    let Io_status = false;     // socketio 状态
    let id = device.getAndroidId();    // 设备id
    let appVersion = app.versionName;  // 打包版本
    let batteryThread = null;   // 电量上报线程句柄（全局唯一）
    let batteryThreadRunning = false; // 电量上报线程运行标志
    let batteryInterval = 60000; // 电量上报周期，单位毫秒（60s，按需调整）
    let listeningState = false; // 当前监听状态（是否正在监听通知）
    let listeningThread = null;  // 监听状态上报线程句柄（全局唯一）
    let listeningThreadRunning = false; // 监听状态上报线程运行标志
    let listeningInterval = 60000; // 监听状态上报周期，单位毫秒（60s）
    let serverReconnectTimer = null; // 服务器主动断开后的手动重连定时器
    let serverReconnectInterval = 5000; // 手动重连间隔，单位毫秒（5s）

    /**
     * 采集并上报一次电量/充电状态
     * 用 org.json.JSONObject 封装，避免 JS 对象序列化异常
     */
    function reportBattery() {
        if (!Io_status || io === null) return;  // 未连接不发
        try {
            let battery = device.getBattery();
            let charging = device.isCharging();
            let jsonObj = new JSONObject();
            jsonObj.put("battery", battery);
            jsonObj.put("charging", charging);
            io.emit("battery", jsonObj);
        } catch (e) {
            console.error('电量上报失败:', e);
        }
    }

    /**
     * 启动电量定时上报（保证全局唯一，先清后建）
     */
    function startBatteryReport() {
        stopBatteryReport();          // 先清旧的，避免叠加
        reportBattery();              // 连接成功立即上报一次
        batteryThreadRunning = true;
        batteryThread = threads.start(function() {
            while (batteryThreadRunning) {
                try {
                    sleep(batteryInterval);
                    if (batteryThreadRunning) {
                        reportBattery();
                    }
                } catch (e) {
                    console.error('电量上报线程异常:', e);
                }
            }
        });
    }

    /**
     * 停止电量定时上报
     */
    function stopBatteryReport() {
        batteryThreadRunning = false;
        if (batteryThread !== null) {
            try {
                batteryThread.interrupt();
            } catch (e) {
                console.error('停止电量上报线程异常:', e);
            }
            batteryThread = null;
        }
    }

    /**
     * 上报一次监听状态
     * 用 org.json.JSONObject 封装，避免 JS 对象序列化异常
     */
    function reportListening() {
        if (!Io_status || io === null) return;  // 未连接不发
        try {
            let jsonObj = new JSONObject();
            jsonObj.put("listening", listeningState);
            io.emit("listening", jsonObj);
        } catch (e) {
            console.error('监听状态上报失败:', e);
        }
    }

    /**
     * 启动监听状态定时上报（保证全局唯一，先清后建）
     */
    function startListeningReport() {
        stopListeningReport();         // 先清旧的，避免叠加
        reportListening();             // 连接成功立即上报一次
        listeningThreadRunning = true;
        listeningThread = threads.start(function() {
            while (listeningThreadRunning) {
                try {
                    sleep(listeningInterval);
                    if (listeningThreadRunning) {
                        reportListening();
                    }
                } catch (e) {
                    console.error('监听状态上报线程异常:', e);
                }
            }
        });
    }

    /**
     * 停止监听状态定时上报
     */
    function stopListeningReport() {
        listeningThreadRunning = false;
        if (listeningThread !== null) {
            try {
                listeningThread.interrupt();
            } catch (e) {
                console.error('停止监听状态上报线程异常:', e);
            }
            listeningThread = null;
        }
    }

    /**
     * 启动“服务器主动断开”后的手动重连循环
     * Socket.IO 对 io server disconnect 不会自动重连，这里手动定时 io.connect() 直到连上
     */
    function startServerReconnect() {
        if (serverReconnectTimer !== null) return; // 已在重连中，避免叠加
        serverReconnectTimer = setInterval(() => {
            if (Io_status || io === null) {        // 已连上或实例已销毁则停止
                stopServerReconnect();
                return;
            }
            try {
                io.connect(); // 复用同一 socket 实例重新拨号
            } catch (e) {
                console.error('手动重连失败:', e);
            }
        }, serverReconnectInterval);
    }

    /**
     * 停止手动重连循环
     */
    function stopServerReconnect() {
        if (serverReconnectTimer !== null) {
            clearInterval(serverReconnectTimer);
            serverReconnectTimer = null;
        }
    }

    /**
     * 初始化并建立 Socket.IO 连接
     * @param {string} user - 用户名
     * @param {string} url - 服务器地址 (不包含 http:// 和端口)
     */
    eventEmitter.connect = function (username, serverUrl) {
        let z = JSON.stringify(Object.values({ id, username, appVersion }));  // 长连接认证信息
        
        function createSocket() {
            try {    
                // 第一步：关闭旧连接（带监听清理）
                if (Io_status && io !== null) {
                    eventEmitter.disconnect(username); // 调用自身disconnect，自动清监听+断连接
                }

                // 第二步：重建连接
                io = IO.socket("http://" + serverUrl);
                console.log(serverUrl);
                
                // 连接成功
                io.on("connect", () => {
                    eventEmitter.emit('connect');
                    io.emit("Mlzs", z);
                    Io_status = true; // ✅ 正确标记连接状态
                    stopServerReconnect(); // ✅ 连上后停止手动重连循环
                });

                // 服务端认证成功回执：此时才启动定时上报，保证上报不早于认证
                io.on("register_success", () => {
                    startBatteryReport(); // ✅ 认证完成后启动电量定时上报
                    startListeningReport(); // ✅ 认证完成后启动监听状态定时上报，重连也会补报当前状态
                });

                // 服务器临时索取时，立即回传一次（不再自管定时器）
                io.on("battery", () => {
                    reportBattery();
                });

                // 服务器临时索取监听状态时，立即回传一次
                io.on("listening", () => {
                    reportListening();
                });

                // 断开连接（修复：状态置为false）
                io.on("disconnect", (reason) => {
                    eventEmitter.emit('disconnect', reason);
                    Io_status = false; // ✅ 断开后标记为false
                    stopBatteryReport(); // ✅ 断开即停上报
                    stopListeningReport(); // ✅ 断开即停监听状态上报
                    // 服务器主动断开（如优雅重启）时 Socket.IO 不会自动重连，这里手动重连
                    if (reason && reason[0] === 'io server disconnect') {
                        Sio_log.up(username, "服务器主动断开，开始自动重连...");
                        startServerReconnect();
                    }
                });

                // 错误事件（修复：日志调用错误 Sio.up → Sio_log.up）
                io.on("error", (error) => {
                    Sio_log.up(username, error);
                    eventEmitter.emit('error', error);
                });

                // 传输层关闭
                io.on('transport close', () => {
                    eventEmitter.emit('transportClose');
                    Io_status = false; // ✅ 断开后标记为false
                    stopBatteryReport(); // ✅ 断开即停上报
                    stopListeningReport(); // ✅ 断开即停监听状态上报
                });

                // 接收消息
                io.on("message", (Msg) => {
                    eventEmitter.emit('message', Msg);
                });

                // 第三步：建立连接
                io.connect();

            } catch (e) {
                console.error('创建Socket连接失败:', e);
                eventEmitter.emit('createError', e);
            }
        }

        createSocket();
    };

    /**
     * 手动关闭 Socket.IO 连接（核心：自动清理所有监听）
     */
    eventEmitter.disconnect = function (username) {
        stopServerReconnect(); // 无论当前是否连接，先停掉手动重连循环，避免退出后仍在后台重连
        if (Io_status && io !== null) { // ✅ 增加io非空判断，避免空指针
            try {
                Sio_log.up(username, "正在断开与服务器连接并清理监听");

                // 0. 停止电量定时上报，避免定时器泄漏
                stopBatteryReport();
                stopListeningReport(); // 停止监听状态定时上报
                // 1. 清理Socket.IO原生底层监听
                io.off(); // 等价于io.removeAllListeners()
                // 2. 断开物理连接
                io.disconnect();
                // 3. 清理模块层的业务监听（关键：避免重复回调）
                eventEmitter.clearListeners();
                // 4. 销毁io实例，避免残留
                io = null;
                // 5. 标记状态为断开
                Io_status = false;
                
                eventEmitter.emit('manualDisconnect');
                Sio_log.up(username, "与服务器连接已断开，监听已清理");
            } catch (e) {
                console.error('断开连接出错:', e);
                Sio_log.up(username, "断开连接失败：" + e.message);
            }
        } else {
            Sio_log.up(username, "无连接，无需断开");
            eventEmitter.emit('noConnection');
        }
    };

    /**
     * 检查连接状态
     * @returns {boolean} 是否连接
     */
    eventEmitter.isConnected = function () {
        return Io_status;
    };

    /**
     * 设置并即时上报监听状态（供应用层在开启/停止监听时调用）
     * @param {boolean} state - 是否正在监听
     */
    eventEmitter.setListening = function (state) {
        listeningState = !!state;
        reportListening();
    };

    /**
     * 向服务器发送 Socket.IO 事件
     * @param {string} eventName - 服务端监听的事件名称
     * @param {*} data - 要发送的数据
     * @returns {boolean} 是否成功调用发送
     */
    eventEmitter.send = function (eventName, data) {
        if (!Io_status || io === null) {
            console.error('Socket.IO 未连接，无法发送事件：' + eventName);
            return false;
        }

        if (typeof eventName !== 'string' || eventName.length === 0) {
            console.error('发送失败：事件名称不能为空');
            return false;
        }

        try {
            io.emit(eventName, data);
            return true;
        } catch (e) {
            console.error('Socket.IO 发送失败：', e);
            return false;
        }
    };

    return eventEmitter;
})();

// 导出模块
module.exports = SocketIO_autodd;