
/**
 * 强制关闭模块，增加适配全部手机
 * @module killApp
 */
var killApp = {}
const kill_log = require('./update_log')
/**
 * @description 强制关闭模块
 * @param {string} 用户名
 * @param {string} 应用名称
 */
killApp.app = function (username,appName) {
    let forcedStopStr = ["结束运行", "强行停止"];
    let button = ['结束运行','确定','强行停止']
    kill_log.up(username,"正在重启" + appName)
    let appPackageName = app.getPackageName(appName)
    home()
    sleep(1000)
    app.openAppSetting(appPackageName)
    kill_log.up(username,"等待进入" + appName + "设置界面！！")
    sleep(2000)
    if(text(appName).findOnce() == null){
        back();
        killApp.app(username,appName)
  }else{
        kill_log.up(username,"已进入" + appName + "设置界面！！")
        for (var i = 0; i < forcedStopStr.length; i++) {
            if (textContains(forcedStopStr[i]).exists()) {//判定关键字是否存在
                setTimeout(() => {}, 500);
                let forcedStop = textContains(forcedStopStr[i]).findOne();
                if (forcedStop.enabled()) {
                    while (!click(forcedStop.text()));
                    sleep(1500)
                    for (let z = 0; z < button.length; z++) {
                        if (textContains(button[z]).exists()) {
                            let buttonStop = text(button[z]).findOne();
                            sleep(1500)
                            if(!click(buttonStop.text())){
                                text(buttonStop.text()).findOne().click()
                                kill_log.up(username,"已重启" + appName)
                                sleep(500)
                                home();
                            }else{
                                kill_log.up(username,"已停止" + appName)
                                sleep(500)
                                home();
                            }
                        }}

                }else{
                    kill_log.up(username,appName+'已重启')
                    home();
                }
            }
        }
    }
}

module.exports = killApp;