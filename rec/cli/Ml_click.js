
/**
 * @description 点击按钮
 * @param {string} 使用人名称
 * @param {string} 点击的使用方式
 */

function clickButton(username,StrC) {
  for(var i = 0; i < 3; i++){
    //点击位置(500, 1000), 每次用时1毫秒
    press(device.width / 2, device.height * 0.560,100)
  }
  sleep(1500)
  Ml_log.up(username,`点击 ` + StrC + ` 按钮坐标`)
  sleep(3000)
  home()
}

module.exports = {
    clickButton
}