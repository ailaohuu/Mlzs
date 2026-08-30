// 1. 导入Android原生通知类（用于创建通知实例）
importClass(android.app.Notification);

// 2. 初始化核心服务和全局配置参数
// 获取系统通知管理器（必须通过context获取，用于发送/取消通知）
const NotificationManager = context.getSystemService(context.NOTIFICATION_SERVICE);
/**
 * 创建通知并发送
 * @module color_mode
 */
var App_Notification = {};

/**
* @param {string} A - 必须输入字符串
* @param {number} NOTIFICATION_ID - 必须输入数字
* @param {string} CHANNEL_ID   软件包名
*/
App_Notification.start = function (A,NOTIFICATION_ID,CHANNEL_ID) {
        const channel = new android.app.NotificationChannel(
        CHANNEL_ID,                // 渠道ID（需与通知构建器一致）
        "马喽助手",         // 渠道名称（用户在系统设置中看到的名称）
        android.app.NotificationManager.IMPORTANCE_DEFAULT
    );
    NotificationManager.createNotificationChannel(channel);

    // 5. 构建通知实例（适配高低版本）
    let builder = new android.app.Notification.Builder(context, CHANNEL_ID) // 8.0+带渠道构造器

    // 配置通知核心属性（链式调用设置）
    builder
        .setContentTitle("打卡通知")                // 通知标题（通知栏顶部显示）
        .setContentText(A)  // 通知内容（标题下方的描述文本）
        .setSmallIcon(android.R.drawable.ic_notification_overlay)      
        .setAutoCancel(true);                      // 点击通知后自动取消（默认false，需手动清除）

    // 6. 发送通知到系统通知栏
    NotificationManager.notify(NOTIFICATION_ID, builder.build()); 
    // 7. 定时任务：3秒后自动取消通知
    setTimeout(() => {
        NotificationManager.cancel(NOTIFICATION_ID); // 根据通知ID取消指定通知
        toast("通知已取消"); // 脚本内提示取消结果
    }, 3000); // 延迟时间：3000毫秒=3秒

}

module.exports = App_Notification;
