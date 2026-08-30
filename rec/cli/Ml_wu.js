/**
 * 常亮悬浮窗模块，与唤醒模块联动，包含了启动和停止
 * @module color_mode
 */
var floatywindows = {}
const fwconfig = require('../config/Constant_config')
const fw_log = require('./update_log')
const br = require('./brightScreen')

/**
 * @description 开启常亮悬浮窗
 * @param {string} 使用人名称
 */
floatywindows.start = function (username) {
    if (br.Judgment(fwconfig.SCREEN_BRIGHTNESS,username) === true) {
        if(fwconfig.wakelock != ''){
            fw_log.up(username,'已设置常亮！！')
        }else{
            fwconfig.wakelock = floaty.rawWindow(
                <frame gravity="center" bg="#D3D3D3FC">
                    <text id="text" textSize="16">保持常亮,防止误触</text>
                </frame>
            );
            fwconfig.wakelock.setSize(-1, -1)  // 设置悬浮窗为全屏
            device.keepScreenOn()
            setInterval(() => {}, 1000) //悬浮窗保持常驻
            device.keepScreenOn()
            fw_log.up(username,'已开启常亮悬浮窗')
        }
    }
}
/**
 * @description 关闭常亮悬浮窗
 * @param {string} 使用人名称
 */
floatywindows.stop = function (username) {
    if (fwconfig.wakelock != '') {
        fwconfig.wakelock.close()
        fwconfig.wakelock = ''
        device.cancelKeepingAwake()
        if (fwconfig.wakelock === '') {
            fw_log.up(username,'悬浮窗已关闭')
        }else{
            fwconfig.wakelock.close()
            fwconfig.wakelock = '' 
        }
        return true
    }else{
         fw_log.up(username,'悬浮窗未开启')
         return true
    }

}
module.exports = floatywindows