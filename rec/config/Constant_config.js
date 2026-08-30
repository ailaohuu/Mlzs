
//===========================常量区===========================
const Vlaue_time = require('../cli/Ml_time')
exports.PACKAGE_ID_DD = "com.alibaba.android.rimet"; // 钉钉
exports.PACKAGE_ID_WORK = "com.tencent.wework"; //企业微信
exports.PACKAGE_Id_MLzs = 'org.example.mlzs'
// exports.PACKAGE_ID_NOT = 'org.autojs.autojspro'
exports.LOWER_BOUND = 1 * 60 * 1000; // 最小等待时间：1min
exports.UPPER_BOUND = 5 * 60 * 1000; // 最大等待时间：5min
exports.PUSH_METHOD = { wechat: 1, ServerChan: 2};
exports.DEFAULT_MESSAGE_DELIVER = ''
// 执行时的屏幕亮度（0-255）, 需要"修改系统设置"权限
exports.SCREEN_BRIGHTNESS = 20;
// 是否过滤通知
exports.NOTIFICATIONS_FILTER = true;
// PackageId白名单
exports.PACKAGE_ID_WHITE_LIST = [
  exports.PACKAGE_ID_DD,
  exports.PACKAGE_ID_WORK,
  exports.PACKAGE_Id_MLzs,
  // PACKAGE_ID_NOT
];
//配置文件路径
exports.configFilePath = "/sdcard/DD/config/config.json";
//服务器地址
// 指定服务器url地址
exports.serverUrl = '113.14.158.122:7011'
//指定前置url
exports.url_scheme = "dingtalk://dingtalkclient/page/link?url=https://attend.dingtalk.com/attend/index.html"
//日志文件路径
exports.LogFilePath = "/sdcard/DD/log/"+Vlaue_time.getFormattedDate()+'.log';
//悬浮窗
exports.wakelock = ''
//图片路径

exports.Wkqfw = './rec/images/Kqwork.jpg'   //明亮进入范围
exports.Bkqfw = './rec/images/Hqkwork.jpg'   //黑暗进入范围
exports.Buw = './rec/images/HUpdatawork.jpg'   //黑暗更新
exports.Wuw = './rec/images/Updatawork.jpg'   //明亮更新
exports.Wsb = './rec/images/Gowork.jpg'   //上班
exports.Axb = './rec/images/Backwork.jpg'  //下班
exports.Anw = './rec/images/Nowork.jpg'   //无法打卡
exports.Awq = './rec/images/Fieldwork.jpg'  //外勤





















