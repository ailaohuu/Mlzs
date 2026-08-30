/**
 * 查
 * @module getPermit
 */
importClass(android.provider.Settings);
var getPermit = {}

/**
* @description 跳转申请修改系统权限
*/
getPermit.Set = function(){
    var I = app.intent({
        action: Settings.ACTION_MANAGE_WRITE_SETTINGS,
        data: android.net.Uri.parse("package:" + context.getPackageName())
    })
    app.startActivity(I)
}

/**
 * @description  跳转通知申请界面
 * @returns 
 */
getPermit.not = function () {
    let intent = new android.content.Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
    intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
    context.startActivity(intent);
}

/**
* @description 跳转申请使用统计权限
* @returns   
*/
getPermit.use = function () {
    let intent = new android.content.Intent(android.provider.Settings.ACTION_USAGE_ACCESS_SETTINGS);
    intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
    context.startActivity(intent);
}

/**
* @description 读取无障碍权限
* @returns   
*/
getPermit.wza = function () {
    app.startActivity({
        action: "android.settings.ACCESSIBILITY_SETTINGS"
    });
}

module.exports = getPermit;
