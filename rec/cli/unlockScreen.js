/**
 * 锁屏，解锁模块与常亮悬浮窗联动
 * @module lockScreen
 */
var lockScreen = {}
const locklog = require('./update_log')
const WU = require('./Ml_wu')
/**
 * @description 解锁模块
 * @param {string} 用户名
 * @param {string} 读取UI界面锁屏开关
 */

lockScreen.ulock = function (username) {
    if(!lockScreen.Judgment()){
        locklog.up(username,'无需解锁')
        setVolume(0)
    }else{
        locklog.up(username,'屏幕正在解锁')
        gesture(150,[device.width  * 0.5,device.height * 0.75],[device.width / 1.5,device.height * 0.3])
        setTimeout(() => {}, 3000);
        if (lockScreen.Judgment()) {
            locklog.up(username,'屏幕已解锁')
            setVolume(0)
        }else{
            locklog.up(username,'屏幕未解锁正在重新解锁')
            lockScreen.ulock(username)
        }
    }
}
/**
 * @description 锁定判断模块
 */
lockScreen.Judgment = function () {
    importClass(android.app.KeyguardManager)
    importClass(android.content.Context)
    var km = context.getSystemService(Context.KEYGUARD_SERVICE)
    return km.isKeyguardLocked()
}

/**
 * @description 锁屏模块
 * @param {string} 用户名
 */

lockScreen.lock = function (username) {
    if (WU.stop(username) === true) {
        sleep(1500)
        if(lockScreen.Judgment() === false){
          device.setBrightnessMode(1) // 自动亮度模式
          locklog.up(username,"设置屏幕亮度模式"+device.getBrightnessMode())
          home()//返回桌面
          sleep(1500)
          var success = runtime.accessibilityBridge.getService().performGlobalAction(android.accessibilityservice.AccessibilityService.GLOBAL_ACTION_LOCK_SCREEN)
          if (success === true) {locklog.up(username,'屏幕已锁定')}
        }else{locklog.up(username,`屏幕未开启!!`);}
    }else{
        locklog.up(username,'软件出现错误请联系开发者')
    }
}
function setVolume(volume) {
  device.setMusicVolume(volume)
  device.setNotificationVolume(volume)
  console.verbose("媒体音量:" + device.getMusicVolume())
  console.verbose("通知音量:" + device.getNotificationVolume())
}
module.exports = lockScreen
