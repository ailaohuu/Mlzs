/**
 * 查
 * @module hasPermit
 */
importClass(android.provider.Settings);
const permit_config = require('../config/Constant_config')
var hasPermit = {}

/**
* @description 修改系统权限检查
* @returns   返回是否具有修改系统权限
*/
hasPermit.Set = function(){
    var S = android.provider.Settings.System.canWrite(context);
    return S
}

/**
 * @description  通知权限检查
 * @returns 
 */
hasPermit.not = function () {
    let data = android.provider.Settings.Secure.getString(context.getContentResolver(),"enabled_notification_listeners");
    return data != null && data.indexOf(context.getPackageName()) !== -1;
}

/**
* @description 读取使用统计权限
* @returns   
*/
hasPermit.use = function () {
    let usageManager = context.getSystemService("usagestats")
    let stats = usageManager.queryUsageStats(
        4, // INTERVAL_BEST 简写值（无需写完整枚举）
        Date.now() - 1000 * 60 * 10, 
        Date.now()
    );
    return stats != null && stats.size() > 0
}

/**
* @description 读取无障碍权限
* @returns   
*/
hasPermit.wza = function () {
    if(auto.service === null){
        return false
    }else{
        return true
    }
}

/**
* @description 读取截图权限
* @returns   
*/
hasPermit.screen = function () {
    if(images.getScreenCaptureOptions() === null){
        return false
    }else{
        return true
    }
}

module.exports = hasPermit;
