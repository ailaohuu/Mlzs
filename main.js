"ui";

//==========================定义区=============================
ui.statusBarColor('#000000');
let Ml_appversion,Ml_BH,Ml_wu,Ml_not,Ml_time,Ml_chat,Ml_click,Kqfind,Ml_log,Ml_Sio,colormode,status,Ml_config,Ml_killapp,Ml_hasset,Ml_unlock,Ml_getset,Ml_brightScreen,value_config;
let Toolbar, drawer, input_name, input_UID, input_Key, input_Corpid;
let button_start, button_stop, button_set, Net_status, Net_color;
let Not_status, Not_color, Wza, Screen, not, use, set, Wait, switch_Back;
let Group, Radio_wechat, Radio_serverpro;

//=====================导入区====================================
importClass(android.view.View);
importClass(android.graphics.Color);
importClass(android.os.PowerManager);
importClass(android.provider.Settings);
Ml_appversion = app.versionName
Ml_BH = require('./rec/cli/Ml_BH')
Ml_wu = require('./rec/cli/Ml_wu')
Ml_not = require('./rec/cli/Ml_not')
Ml_time = require('./rec/cli/Ml_time')
Ml_chat = require('./rec/cli/Ml_chat')
Ml_click = require('./rec/cli/Ml_click')
Kqfind = require('./rec/cli/Ml_findimg')
Ml_log = require('./rec/cli/update_log')
Ml_Sio = require('./rec/cli/Ml_Socketio')
colormode = require('./rec/cli/Color_moe')
status = require('./rec/config/Kq_status')
Ml_config = require('./rec/cli/Ml_storages')
Ml_killapp = require('./rec/cli/Ml_killapp')
Ml_hasset = require('./rec/cli/Ml_hasPermit')
Ml_unlock = require('./rec/cli/unlockScreen')
Ml_getset = require('./rec/cli/Ml_getPermit')
Ml_brightScreen = require('./rec/cli/brightScreen')
value_config = require('./rec/config/Constant_config')

//==========================参数区=============================

http.__okhttp__.setTimeout(5000);  //全局http超时5s
java.lang.Thread.setDefaultUncaughtExceptionHandler(new java.lang.Thread.UncaughtExceptionHandler({
    uncaughtException: function (thread, ex) {
        globalExceptionHandler(thread, ex);
    }
}));

//==========================定义区=============================
$debug.setMemoryLeakDetectionEnabled(true);  //debug 模式

// ===================== 主界面状态 =====================

let doC = null;
let oT = null;
let chanServer = null;
let notStatus = false;
let isObservingNotification = false;
let startStatus = false;

//==========================启动区=============================
readToken()
//==========================UI区=============================
/**
 * 登录界面
 */

function showLoginUI () {
    ui.layoutFile("./rec/layout/login.xml")
    inputStatus()
    ui.login.on("click", () => {
        let u = ui.name.text()
        let p = ui.password.text()
        if(u === ''){
            toast('请填写用户名!!')
            return
        }else if (p === '') {
            toast('请填写密码!!')
            return
        }
        login(u,p)
    });

    ui.setService.on('click',() =>{
      let inText = '192.168.1.1'
      let inIp = Ml_config.has('Mlip','ipconfig')
      if (inIp) {
       inText =  Ml_config.read('Mlip','ipconfig').split(':')[0]
      }
        dialogs.build({
            title: "修改服务器ip",
            inputPrefill: inText
        }).on("input", (ipconfig)=>{
            if(isIpValid(ipconfig)){
                Ml_config.write('Mlip','ipconfig',ipconfig + ':7011')
                toast("设置服务器ip成功,请正常登录!")
                ui.name.setEnabled(true)
                ui.password.setEnabled(true)
                ui.login.setEnabled(true)
            }else{
                toast("请输入正确的ip地址!")
            }
        }).show();
    })

        /**
     * @function 登录界面判断函数
     */

    function inputStatus() {
        if (!Ml_config.has('Mlip','ipconfig')) {
            ui.name.setEnabled(false)
            ui.password.setEnabled(false)
            ui.login.setEnabled(false);
            toast('首次启动请先配置服务器ip！！')
        }
    }
}

/**
 * 主界面
 */
function mainStart() {
  ui.layoutFile("./rec/layout/ui.xml")
  Toolbar = ui.toolbar;
  drawer = ui.drawer;
  input_name = ui.username;
  input_UID = ui.Uid;
  input_Key = ui.Sendkey;
  input_Corpid = ui.CorpId;
  button_start = ui.Start;
  button_stop = ui.Stop;
  button_set = ui.Writeconfig;
  Net_status = ui.netstatus;
  Net_color = ui.netlight;
  Not_status = ui.notstatus;
  Not_color = ui.notlight;
  activity.setSupportActionBar(ui.toolbar);
  Toolbar.setupWithDrawer(drawer);
  Group = ui.chan_group              //推送组
  Radio_wechat = ui.radio_Wechatchan  //企业微信
  Radio_serverpro = ui.radio_Serverchan  //server酱
  //权限定义
  Wza = ui.wza;
  Screen = ui.screen;
  not = ui.not;
  use = ui.use;
  set = ui.set;
  Wait = ui.Wait;
  switch_Back = ui.Back;
  Group = ui.chan_group;
  Radio_wechat = ui.radio_Wechatchan;
  Radio_serverpro = ui.radio_Serverchan;


  //=========================数据同步========================
  //数据框信息同步
  ui.post(() => {
    if (!Ml_config.has('Mlzs','Mlconfig')) {
        button_start.setEnabled(false)
        getConfig()
    }else{
        let c = Ml_config.read('Mlzs','Mlconfig')
        let ipSocket = Ml_config.read('Mlip','ipconfig')
        input_name.setText(c.username)
        input_UID.setText(c.UID)
        input_Key.setText(c.Key)
        input_Corpid.setText(c.Corpid)
        button_set.setVisibility(View.GONE)   //隐藏导入按钮
        button_start.setEnabled(true)
        permit()
        socket_start(ipSocket)   //创建 Socketio
        Ml_BH.start()           //保活悬浮窗
    }
  })
  //=========================按钮逻辑========================
  //开始按钮
  button_start.on("click", function() {
    let In = input_name.getText().toString();
    let Iu = input_UID.getText().toString();
    let Ik = input_Key.getText().toString();
    let Ic = input_Corpid.getText().toString();
    let ipSocket = Ml_config.read('Mlip','ipconfig')
    var MLconfig_data = {
        username:In,
        Key:Ik,
        UID:Iu,
        Corpid:Ic
    }
   //程序开始运行之前最后一次检查
    if (auto.service == null) {
        toast("请先开启无障碍服务！");
        return;
    }else if(images.getScreenCaptureOptions() == null){
        toast("请先开启截图权限！")
        return;
    } else if (!Ml_hasset.Set()) {
      toast('请开启修改系统权限!')
      return;
    }else if (!Ml_hasset.use()) {
      toast('请开启通知使用情况权限!')
      return;
    }else if (!Ml_hasset.not()) {
      toast('请开启读取通知权限!')
      return;
    }else if (Group.getCheckedRadioButtonId() == "-1") {
      toast("请选择推送方式！");
      return;
    }else {
      if(Ml_config.Contrast('Mlzs','Mlconfig','Mlzstmp',MLconfig_data)){
        Ml_Sio.disconnect()
        socket_start(ipSocket)
      }
      events.removeAllListeners("notification") //首先关闭一次监听，避免重复出现
      threads.shutDownAll()  // 重置所有线程
      Contrast_config()
      Main()
    }
 });
  //停止按钮
  button_stop.on("click", function() {
      if(startStatus){
        let In = input_name.getText().toString();
        threads.shutDownAll()
        device.setBrightnessMode(1)
        device.cancelKeepingAwake()
        events.removeAllListeners()
        isObservingNotification = false  // 重置通知观察状态
        notStatus = false
        Not_color.cardBackgroundColor = Color.GRAY
        Not_status.setText("已停止监听!")
        button_start.setEnabled(true)
        Ml_Sio.setListening(false)  //上报监听状态：未监听
        toast("已停止监听!")
        Ml_log.up(In,"已停止监听!");
      }

  });
  //导入配置按钮
  button_set.click(function() {
    let In = input_name.getText().toString();
    let Iu = input_UID.getText().toString();
    let Ik = input_Key.getText().toString();
    let Ic = input_Corpid.getText().toString();
    let ipSocket = Ml_config.read('Mlip','ipconfig')
    var MLconfig_data = {
        username:In,
        Key:Ik,
        UID:Iu,
        Corpid:Ic
    }
    Ml_config.write('Mlzs','Mlconfig',MLconfig_data)
    button_set.setVisibility(View.GONE)   //隐藏导入按钮
    button_start.setEnabled(true)
    permit()
    socket_start(ipSocket)   //创建 Socketio
    Ml_BH.start()           //保活悬浮窗
  })
  //侧边栏退出按钮
  switch_Back.click(function() {
    let In = input_name.getText().toString();
    Ml_Sio.disconnect()
    Ml_log.up(In,'退出软件')
    exit(); 
  })

//=========================侧边栏开关========================
  //无障碍开关
 Wza.on("check", function(checked) {
    // 用户勾选无障碍服务的选项时，跳转到页面让用户去开启
    if (checked && auto.service == null) {
        app.startActivity({
            action: "android.settings.ACCESSIBILITY_SETTINGS"
        });
    }
    if (!checked && auto.service != null) {
        auto.service.disableSelf();
    }
 });
  //截图申请开关
 Screen.on("check", function(checked) {
    if (checked && images.getScreenCaptureOptions() == null) { 
        requestScreenCaptureAsync();
      } 
    if(!checked && images.getScreenCaptureOptions() != null){
        images.stopScreenCapture()
    }
 });
  //读取通知权限开关
  not.on("check",function(checked){
    if(checked && !Ml_hasset.not()){
      Ml_getset.not()
    }
    if (!checked && Ml_hasset.not()) {
      Ml_getset.not()
    }
  })
  //使用统计权限开关
  use.on("check",function(checked){
    if(checked && !Ml_hasset.use()){
      Ml_getset.use()
    }
    if (!checked && Ml_hasset.use()) {
      Ml_getset.use()
    }
  })
  //修改系统权限开关
  set.on("check",function(checked){
    if(checked && !Ml_hasset.Set()){
      Ml_getset.Set()
    }
    if (!checked && Ml_hasset.Set()) {
      Ml_getset.Set()
    }
  })
  //推送选择
  Group.setOnCheckedChangeListener((group, checkedId) => {
    // 根据整数id获取勾选的radio控件
    let checkedRadio = Group.findViewById(checkedId);
    switch (checkedRadio) {
        case Radio_wechat:
            chanServer =  'wechat'
            break;
        case Radio_serverpro:
            chanServer =  'server'
            break;
    }
  });
  //创建选项菜单(右上角)
  ui.emitter.on("create_options_menu", menu => {
      menu.add("设置")
      menu.add('日志')
      menu.add("关于")
  });
  //监听选项菜单点击
  ui.emitter.on("options_item_selected", (e, item) => {
      switch (item.getTitle()) {
          case "设置":
              app.startActivity('settings')
              break;
          case "日志":
              app.startActivity('console')
              break;
          case "关于":
              alert("当前版本："+Ml_appversion);
              break;
      }
      e.consumed = true;
  });
//  ui生命周期（返回主界面）
 ui.emitter.on("resume", function() {
    Wza.checked = Ml_hasset.wza()   //无障碍
    Screen.checked = Ml_hasset.screen()  //截图
    not.checked = Ml_hasset.not()   //通知
    set.checked = Ml_hasset.Set()   //修改系统
    use.checked = Ml_hasset.use()   //使用情况
 });
}


//===========================代码区===========================

/**
* @description 启动脚本
*/
function Main(){
 // 监听本机通知
    let In = input_name.getText().toString();
    // 检查是否已经在观察通知，如果没有则开启观察
    if (!isObservingNotification) {
        events.observeNotification();
        isObservingNotification = true;
    }
    events.on("notification", function (n) {
        notificationHandler(n);
      })
    if(util.inspect(events.listeners("notification")) != '[]'){
      Ml_log.up(In,"监听中, 请在日志中查看记录的通知及其内容")
      Not_status.setText(In+'已开启监听!')
      Not_color.cardBackgroundColor = Color.GREEN
      startStatus =true
      notStatus = true
      button_start.setEnabled(false)
      Ml_Sio.setListening(true)  //上报监听状态：监听中
    }else{
      Ml_log.up(In,'开启监听失败!')
    }
}

/**
 * @function 处理通知
 */
function notificationHandler(n) {
  let In = input_name.getText().toString();
  let Iu = input_UID.getText().toString();
  let Ik = input_Key.getText().toString();
  let Ic = input_Corpid.getText().toString();
  let packageId = n.getPackageName(); // 获取通知包名
  let abstract = n.tickerText; // 获取通知摘要
  let text = n.getText(); // 获取通知文本

  //兜底校验
  abstract = abstract || ''
  
  // 过滤 PackageId 白名单之外的应用所发出的通知
  if (!filterNotification(packageId, abstract, text)) {
    return;
  }

  //通知监听
  if (text === null) {
    Ml_log.up(In,"获取的信息不正确!");
    return;
  }else if (text.indexOf(In + "打卡") >= 0) {
    if(doC != null) {doC.interrupt()}   //打卡线程控制
    if(oT != null) {oT.interrupt()}     //加班线程控制
    doC = threads.start(function () {
      doClock(In);
    });
  }else if (text.indexOf(In + "睡觉") >= 0) {
      // 监听包含 "睡觉" 的通知
    if(doC != null) {doC.interrupt()}   //打卡线程控制
    if(oT != null) {oT.interrupt()}     //加班线程控制
    threads.start(function () {
      Ml_log.up(In,'开始准备睡觉')
      Ml_brightScreen.wake(In,value_config.SCREEN_BRIGHTNESS)
      Ml_unlock.ulock(In)
      Ml_unlock.lock(In)
    })
  }else if (text.indexOf(In + "加班") >= 0) {
    // 监听包含 "加班" 的通知
    if(doC != null) {doC.interrupt()}   //打卡线程控制
    if(oT != null) {oT.interrupt()}     //加班线程控制
    Ml_log.up(In,'开始进入加班流程')
    oT = threads.start(function () {
      overTime(In)
    });
  }else if (text.indexOf(In + "查询") >= 0) {
      // 监听文本为 "查询" 的通知
    threads.start(function () {
      let title =  Ml_time.getFormattedDate()+"考勤结果"
      let message = Ml_config.read("dingding", "clockResult")
      Ml_log.up(In,`上次考勤结果为${message}`)
      Ml_chat.server(title,message,Iu,Ik,In,chanServer)
    })
    // 监听钉钉返回的考勤结果
  }else if (packageId == value_config.PACKAGE_ID_DD && text.indexOf("考勤打卡") >= 0 || abstract.indexOf("考勤打卡") >= 0) {
    Ml_log.up(In,`打卡完成即将开始进行推送!!`)
    Ml_config.write("dingding","clockResult",text)
    if(doC != null) {doC.interrupt()}   //打卡线程控制
    if(oT != null) {oT.interrupt()}     //加班线程控制
    threads.start(function () {
      Ml_chat.server('考勤结果',text,Iu,Ik,In,chanServer)
    });
  }else{
    Ml_log.up(In,`正常信息 ${text}`)
    return
  }
}

/**
 * @function 打卡主流程
 */
function doClock(userName) {
  Ml_log.up(userName,"本地时间: " + Ml_time.getFormattedTime());
  Ml_log.up(userName,"开始打卡流程!");
  Ml_brightScreen.wake(userName,value_config.SCREEN_BRIGHTNESS)
  Ml_unlock.ulock(userName)
  Ml_wu.start(userName)       //开启悬浮窗常亮
  Ml_killapp.app(userName,'钉钉')          
  holdOn(userName)
  signIn(userName)
  pandKaoqin(userName)
}; 

/**
 * @description 加班流程
 */
function overTime(userName) {
  Ml_log.up(userName,"本地时间: " +Ml_time.getFormattedTime());
  Ml_log.up(userName,"开始加班流程!");
  Ml_brightScreen.wake(userName,value_config.SCREEN_BRIGHTNESS,)
  Ml_unlock.ulock(userName)
  Ml_wu.start(userName)
  Ml_killapp.app(userName,'钉钉')
  holdOn(userName)
  signIn(userName)
  clockOver(userName) //加班流程
}

/**
 * @description 随机等待
 */
function holdOn(username){
 
  if (Wait.isChecked() === false) {
      return;
  }else{
    let randomTime = random(value_config.LOWER_BOUND, value_config.UPPER_BOUND)
    Ml_log.up(username,Math.floor(randomTime / 1000).toFixed(1) + "秒后启动" + app.getAppName(value_config.PACKAGE_ID_DD) + "...")
    sleep(randomTime)
  }
}

/**
 * @description 启动并钉钉
 * @param {string} 使用人名称
 */
function signIn(username) {
  Ml_log.up(username,"正在启动" + app.getAppName(value_config.PACKAGE_ID_DD));
  for (let i = 0; i < 3; i++) {
    app.launchPackage(value_config.PACKAGE_ID_DD);
    if(id("im_ding_kit_item_txt").className("android.widget.TextView").text("打卡").findOne(3000) != null){
      break
    }
  }
  Ml_log.up(username,'钉钉已经启动!')
}

/**
 * @function 使用 URL进入考勤界面,判断是否正确进入考勤界面
 * @param {*} 使用人名称 
 */
function attendKaoqin(username){
  let Ic = input_Corpid.getText().toString();
  let url_scheme = value_config.url_scheme + "?corpId=" + Ic
  let a = app.intent({action: "VIEW",data: url_scheme});
  app.startActivity(a)
  Ml_log.up(username,"正在进入"+username+"考勤界面...")
  sleep(20000);
  if(colormode.attend()){
      if(Kqfind.find(username,value_config.Wkqfw)){
        Ml_log.up(username,"已进入考勤界面")
        return true
      }else if (Kqfind.find(username,value_config.Awq)) {
        return 'wq'
      }else if(Kqfind.find(username,value_config.Anw)) {
        return 'nw'
      }else{
        return false
      }
    }else{
      if(Kqfind.find(username,value_config.Bkqfw)){
         Ml_log.up(username,"已进入考勤界面")
        return true
      }else if (Kqfind.find(username,value_config.Awq)) {
        return 'wq'
      }else if(Kqfind.find(username,value_config.Anw)) {
        return 'nw'
      }else{
        return false
    }
  }
}

/**
 * @function 考勤判断
 * @param {*} 使用人名称 
 */
function pandKaoqin(username) {
  let title = '当前界面';
  let In = input_name.getText().toString();
  let Iu = input_UID.getText().toString();
  let Ik = input_Key.getText().toString();
  PK:for(let i = 1;i <= 5; i++ ){
    let aK = attendKaoqin(username)
    switch (aK) {
      case 'wq':
        Ml_log.up(username,'当前界面为外勤界面！')
        Ml_chat.server(title,status.Fieldwork,Iu,Ik,In,chanServer)
        break PK;
      case 'nw':
        Ml_log.up(username,'当前界面为无法打卡界面！')
        Ml_chat.server(title,status.Nowork,Iu,Ik,In,chanServer)
        break PK;
      case false:
        Ml_log.up(username,'未进入考勤界面,重试!')
        break;
      case true:
        if (Ml_time.getFormattedHour() <= 10 ) {
          upTime(username)
          break PK;
        }else {
          outTime(username)
          break PK;
        }
    }
    Ml_log.up(username,`未进入考勤界面正在进行第` + i + `次重试!!`)
    sleep(1500)
  }
  Ml_unlock.lock(username);
}

/**
 * @function 上班打卡
 * @param {string} 使用人名称
 */
function upTime(username){

  Ml_log.up(username,`进入上班打卡流程！`)
  if(Kqfind.find(username,value_config.Wsb)){
    Ml_wu.stop(username)
    sleep(2500)
    if(!Kqfind.click(username,value_config.Wsb)){
      Ml_log.up(username,`未点击请重试！！`)
    }
  }else{
    Ml_log.up(username,`未知原因`)
  }
}

/**
 * @function 下班打卡
 * @param {string} 使用人名称
 */
function outTime(username){
  Ml_log.up(username,`进入下班打卡流程！`)
  if(colormode.attend()){
    if (Kqfind.find(username,value_config.Wuw)){
      Ml_log.up(username,`已下班!!`)
    }else if(Kqfind.find(username,value_config.Axb)){
      Ml_wu.stop(username)
      sleep(5000)
      if(!Kqfind.click(username,value_config.Axb)){
        Ml_log.up(username,`未点击请重试！！`)
      }
    }else{
      Ml_log.up(username,`未知原因`)
    }
  }else{
    if (Kqfind.find(username,value_config.Buw)){
      Ml_log.up(username,`已下班!!`)
    }else if(Kqfind.find(username,value_config.Axb)){
      sleep(5000)
      if(!Kqfind.click(username,value_config.Axb)){
        Ml_log.up(username,`未点击请重试！！`)
      }
    }else{
      Ml_log.up(username,`未知原因`)
    }
  }
}

/**
* @function 加班打卡 
* @param {string} 使用人名称
*/
function clockOver(username) {
  for(let i = 1;i <= 3; i++ ){
    if(attendKaoqin(username)){
      Ml_log.up(username,"加班打卡...")
      if(colormode.attend()){
          if(Kqfind.find(username,value_config.Wuw) || Kqfind.find(username,value_config.Axb) || Kqfind.find(username,value_config.Wsb)){
            Ml_wu.stop(username)
            Ml_click.clickButton(username,'加班')
            sleep(3000)
            return
          }else{Ml_log.up(username,'无法打卡,请手动打卡!!')}
          break
      }else{
          if(Kqfind.find(username,value_config.Buw) || Kqfind.find(username,value_config.Axb) || Kqfind.find(username,value_config.Wsb)){
            Ml_wu.stop(username)
            Ml_click.clickButton(username,'加班')
            sleep(3000)
            return
          }else{
            Ml_log.up(username,'无法打卡,请手动打卡!!')
          }
          break
      }
    }
  }
}

// ===================== ↓↓↓ 功能函数 ↓↓↓ =======================

/**
 * @function  通知过滤器
 */ 
function filterNotification(bundleId, abstract, text) {
  var check = value_config.PACKAGE_ID_WHITE_LIST.some(function(item) {return bundleId == item}) 
  if (!value_config.NOTIFICATIONS_FILTER || check) {
      console.verbose(text)
      console.verbose("---------------------------")
      return true
  }
  else {
      return false 
  }
}
/**
 * @function ip判断正则匹配函数
 * @param {*} ip 
 * @returns 
 */
function isIpValid(ip){
    const reg = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    return reg.test(ip);
}
/**
 * @function 销毁权限
 */
function cleanupMainResources() {
  let In = input_name.getText().toString();
  images.stopScreenCapture();
  Ml_BH.stop(In);
  Ml_Sio.disconnect(In);
  log("退出软件");
}

events.on("exit", cleanupMainResources);

/**
 * @function 登录界面主函数
 */
function readToken() {
  let  ip = Ml_config.has('Mlip','ipconfig')
  let Token = Ml_config.has('Mlzs','Mltoken')
    if (!ip) {
      showLoginUI();
    }else if (Token) {
       login_token();
    }else{
        showLoginUI();
    }
  
}

/**
 * @function 登录，网络子线程，不退出脚本，失败提示服务端连接错误
 * @param {string} userName
 * @param {string} passWord
 */
function login(userName, passWord) {
    let ip = Ml_config.read('Mlip','ipconfig')
    let url = 'http://'+ip + '/client-auth?action=login';

    threads.start(function () {
        let o = 0;
        try {
            let respPing = http.get(ip);
            o = respPing.statusCode;
        } catch (error) {
            toast('服务器配置错误,检查服务器配置或者联系管理员!!')
            return ;
        }
        
        try {
            let res = http.postJson(url, {
                user: userName,
                pwd: passWord
            });
            let bodyStr = res.body.string();
            let html = JSON.parse(bodyStr).success;
            console.log(html);
            if (!html) {
                toast('登录失败,检查用户名和密码!')
                return
            }else{
                let tokenConfig = JSON.parse(bodyStr).token
                log(tokenConfig)
                Ml_config.write('Mlzs','Mltoken',tokenConfig)
                toast('登录成功！')
                ui.run(function(){
                  mainStart()
                })
            }

        } catch (err) {
            log("登录请求异常:" + err);
        }
    });
}
/**
 * @function 登录，网络子线程，不退出脚本，失败提示服务端连接错误
 * @param {string} token
 */
function login_token() {
    let ip = Ml_config.read('Mlip','ipconfig')
    let token = Ml_config.read('Mlzs','Mltoken')
    let url = 'http://'+ip + '/client-auth?action=verify';

    threads.start(function () {
        let o = 0;
        try {
            let respPing = http.get(ip);
            o = respPing.statusCode;
        } catch (error) {
            toast('服务器配置错误,检查服务器配置或者联系管理员!!')
            return;
        }
        
        try {
            let res = http.postJson(url, {
                token: token,
            });
            let bodyStr = res.body.string();
            let html = JSON.parse(bodyStr).success;
            if (!html) {
                toast('登录已失效,请重新登录!')
                console.log('登录已失效,请重新登录!');
                ui.run(function(){
                  showLoginUI()
                })
            }else{
                toast('登录成功！')
                ui.run(function(){
                  mainStart()
                })
            }
        } catch (err) {
            log("登录请求异常:" + err);
            ui.run(function(){showLoginUI();})
        }
    });
}

function socket_start(url) {
  let In = input_name.getText().toString();
  let c = Ml_config.read('Mlzs','Mlconfig')
  let Id = device.getAndroidId()
  let upConfig = {
      master: c.username,      
      device_Id: Id,
      server_Uid: c.UID,
      server_key: c.Key,
      corp_Id: c.Corpid
  }
  //监听模块返回连接成功
  Ml_Sio.on('connect', () => {
    ui.post(() => {
      Net_status.setText("与服务器连接成功")  //设置服务器状态
      Net_color.cardBackgroundColor = Color.GREEN;
      if(!notStatus) {button_start.setEnabled(true)}//设置启动按钮可选
      Ml_Sio.setListening(notStatus)  //重连后按当前监听状态补报一次
      Ml_log.up(In,'服务器已链接')
      Contrast_config()
    })
 
  })


  // 断开连接事件
  Ml_Sio.on('disconnect', (reason) => {
      if (reason[0] === 'io client disconnect') {
          Ml_log.up(In, '与服务器断开连接');
          ui.post(() => {
            Net_status.setText("与服务器断开连接")
            Net_color.cardBackgroundColor = Color.GRAY
          })
      } else {
          Ml_log.up(In, '服务器关闭，请联系管理员');
          ui.post(() => {
            Net_status.setText("与服务器断开连接")
            Net_color.cardBackgroundColor = Color.GRAY
          })
      }
  });

  // 错误事件
  Ml_Sio.on('error', (error) => {
      Ml_log.up(In, error[0])
  });

  //发送配置信息

  // 收到消息事件
  Ml_Sio.on('message', (msg) => {
      Ml_not.start(msg[0],1014,value_config.PACKAGE_Id_MLzs)  //设置发出通知
  });
  Ml_Sio.connect(In,url)
}

function permit() {
    Wza.checked = Ml_hasset.wza()   //无障碍
    Screen.checked = Ml_hasset.screen()  //截图
    not.checked = Ml_hasset.not()   //通知
    set.checked = Ml_hasset.Set()   //修改系统
    use.checked = Ml_hasset.use()   //使用情况
}

/**
 * @function 获取服务端配置信息
 */
function getConfig() {
  Ml_config.read('Mlzs','Mltoken')
  let ip = Ml_config.read('Mlip','ipconfig')
  let token = Ml_config.read('Mlzs','Mltoken')
  let url = 'http://'+ip + '/client-auth?action=getconfig';

  threads.start(function () {
      let o = 0;
      try {
          let respPing = http.get(ip);
          o = respPing.statusCode;
      } catch (error) {
          toast('与服务器连接失败!!')
          return;
      }
      
      try {
          let res = http.postJson(url, {
              token: token,
          });
          let bodyStr = res.body.string();
          let html = JSON.parse(bodyStr).config;
          if (html === null) {
            toast('当前用户首次使用,请填写完毕配置信息后点击写入配置!')
          }else{ 
            var get = confirm("存在可获取配置,是否要继续?");
              if(get){
                  input_name.setText(html.master)
                  input_UID.setText(html.server_Uid)
                  input_Key.setText(html.server_key)
                  input_Corpid.setText(html.corp_Id)
              }
          }
      } catch (err) {
          log("请求异常:" + err);
      }
  });
}

/**
 * @function 本地与服务端核对配置信息
 */
function Contrast_config(){
  Ml_config.read('Mlzs','Mltoken')
  let ip = Ml_config.read('Mlip','ipconfig')
  let token = Ml_config.read('Mlzs','Mltoken')
  let In = input_name.getText().toString();
  let Iu = input_UID.getText().toString();
  let Ik = input_Key.getText().toString();
  let Ic = input_Corpid.getText().toString();

  let url = 'http://'+ip + '/client-auth?action=getconfig';
  threads.start(function () {
      let o = 0;
      try {
          let respPing = http.get(ip);
          o = respPing.statusCode;
      } catch (error) {
          toast('与服务器连接失败!!')
          return;
      }
      
      try {
          let res = http.postJson(url, {
              token: token,
          });
          let bodyStr = res.body.string();
          let html = JSON.parse(bodyStr).config;
          if (html != null) {
            if(html.master !== In ||html.server_Uid !== Iu || html.server_key !== Ik ||  html.corp_Id !== Ic){
              var up = confirm("是否要更新服务器配置!!");
                if(up){
                  Update_config()
                }
            }
          }else{
            Update_config()
          }
      } catch (err) {
          log("请求异常:" + err);
      }
  });
}

/**
 * @function 更新服务端配置
 */
function Update_config() {
    let In = input_name.getText().toString();
    let Iu = input_UID.getText().toString();
    let Ik = input_Key.getText().toString();
    let Ic = input_Corpid.getText().toString();
    let Id = device.getAndroidId()
    let upConfig = {
      master: In,      
      device_Id: Id,
      server_Uid: Iu,
      server_key: Ik,
      corp_Id: Ic
  }
    setTimeout(() => {
    let i= Ml_Sio.send('config',upConfig)
      if (i === true) {
        toast('更新服务端配置成功!!')
      }else{
        toast('更新配置失败!!')
      }
  }, 3000);
}













