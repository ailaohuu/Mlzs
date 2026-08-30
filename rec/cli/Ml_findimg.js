/**
 * 找图，找图点击模块
 * @module findimage
 */
var findimage = {};
const find_log = require('./update_log')
/**
 * @description 找图
 * @param {string} 使用人名称
 * @param {string} 图片路径
 * @returns 
 */
findimage.find = function (username, patch) {
  let targetImage = images.read(patch);
  let screenshot = captureScreen(); // 截取当前屏幕
  let pos = images.findImage(screenshot, targetImage); // 查找目标图像
  if (pos) {
    find_log.up(username, '找到目标图像，位置：' + pos);
    targetImage.recycle(); // 成功后释放资源
    return true; // 返回true表示找到
  } else {
    screenshot.recycle()
    targetImage.recycle()
    return false
  }
}

/**
 * @description 找图点击
 * @param {string} 使用人名称
 * @param {string} 图片路径
 * @returns
 */
findimage.click = function (username, patch) {
  let targetImage = images.read(patch);
  let screenshot = captureScreen(); // 截取当前屏幕
  let pos = images.findImage(screenshot, targetImage); // 查找目标图像
  if (pos) {
    click(pos.x + targetImage.width / 2, pos.y + targetImage.height / 2);
    find_log.up(username, '找到目标图像，位置：' + pos);
    targetImage.recycle(); // 成功后释放资源
    return true; // 返回true表示找到
  } else {
    screenshot.recycle()
    targetImage.recycle();
    return false; // 10次都未找到，返回false
  }
  function click(x, y) {
    // 模拟点击
    press(x, y, 50);
  }
}


module.exports = findimage;