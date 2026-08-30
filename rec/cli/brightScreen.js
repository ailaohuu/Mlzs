/**
 * 唤醒模块
 * @module brightScreen
 */
var brightScreen = {}
const wakelog = require('./update_log')

/**
 * @description 唤醒设备
 * @param {string} username 用户名
 * @param {string} number 亮度
 */
brightScreen.wake = function Wack(username,number) {
    if (arguments.length < 2) {
        console.log('参数不完整');
        return; 
  }
    wakelog.up(username,'开始唤醒设备',true)
    device.setBrightnessMode(0)
    wakelog.up(username,"设置屏幕亮度模式"+device.getBrightnessMode(),true)
    device.setBrightness(number)
    wakelog.up(username,'设置屏幕亮度为'+device.getBrightness(),true)
    device.wakeUp()//唤醒cpu
    device.wakeUpIfNeeded(); // 唤醒设备
    sleep(1500)
    brightScreen.Judgment(number,username)
}
/**
 * @description 判断唤醒
 * @param {number} 亮度值
 * @param {string} 用户名
 */
brightScreen.Judgment = function (number,username) {
    if (!device.isScreenOn()) {
        device.wakeUpIfNeeded()
        brightScreen.wake(number,username)
    }else{
        wakelog.up(username,'设备已唤醒',true)
        return true
    }
}

module.exports = brightScreen