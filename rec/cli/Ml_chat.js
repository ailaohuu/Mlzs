

/**
 * @module 推送模块包含了server酱和企业微信推送
 */
var Chat = {}
const log_up = require('./update_log')
const Wu = require('./Ml_wu')
const Lock = require('./unlockScreen')
/**
 * @description 推送模块
 * @param {string} title 标题
 * @param {string} message 消息
 * @param {string} serverUID  server酱UID或者手机号
 * @param {string} serverKey  server酱Key或者企业微信Key
 * @param {string} username   使用人姓名
 * @param {string} Method  推送方式
 */
Chat.server = function(title,message,serverUID,serverKey,Username,Method){
    if (arguments.length < 5) {
        console.log('参数不完整');
        return; 
    }
    switch(Method){
        case 'wechat' :
            log_up.up(Username,"发出推送信息");
            let url ="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=" + serverKey;
            let payload = {msgtype: "text",text: {content: message,mentioned_mobile_list: [serverUID],},debug: "1",};
            let wechatRes = http.postJson(url, payload);
            if (wechatRes.statusCode === 200) {
                log_up.up(Username,'已完成推送')
                sleep(1500)
                home()
                sleep(1500)
                Wu.stop(Username)  //关闭悬浮窗
                Lock.lock(Username)  //锁屏
            }else{
                log_up.up(Username,'推送失败')
                log_up.up(Username,'请检查Key与网络是否正常')
                sleep(1500)
                home()
                sleep(1000)
                Wu.stop(Username)  //关闭悬浮窗
                Lock.lock(Username)  //锁屏
            }
            break;
        case 'server' :
            let i = {
                    title:title,
                    desp:message
            }
            let serverUrl ="https://"+serverUID+".push.ft07.com/send/"+serverKey+".send"  
            let serverRes = http.postJson(serverUrl,i)
            if (serverRes.statusCode === 200 ) {
                log_up.up(Username,'已完成推送')
                sleep(1500)
                home()
                sleep(1000)
                Wu.stop(Username)  //关闭悬浮窗
                Lock.lock(Username)  //锁屏
            }else{
                log_up.up(Username,'推送失败')
                sleep(1500)
                home()
                sleep(1000)
                Wu.stop(Username)  //关闭悬浮窗
                Lock.lock(Username)  //锁屏
            }
            break;
    }
}
module.exports = Chat