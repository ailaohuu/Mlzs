
/**
 * 日志上传模块
 * @module update_log
 */
var update_log = {}
const server = require('../config/Constant_config')
const log_time = require('./Ml_time')
const logIp = require('./Ml_storages')

/**
* @description 日志模块
* @param {string} username 使用人姓名
* @param {string} log 日志信息
*/
update_log.up = function (username,log) {
    let ipSocket = logIp.read('Mlip','ipconfig')
    username = username || 'Firsttime'
    if (arguments.length < 2) {
        console.log(`日志参数不完整,日志信息为${log}`);
        return; 
    }
    var now_log = log_time.getFormattedTime() + log +"\n"
    files.createWithDirs(server.LogFilePath)
    console.log(log)
    try {files.append(server.LogFilePath,now_log)} catch (e) {console.log(e);}
    
    threads.start(function(){
        try {
            http.postJson('http://'+ipSocket+'/log',{account:username,logData:log},)
        } catch (e) {
            console.log(e);
        }

    })
}
module.exports = update_log