
/**
 * 保活悬浮窗模块读取配置文件
 * @module floatywindows
 */
var floatywindows = {}   
let Bh_status = false   //保活状态
let Bh = ''            //悬浮窗初始化状态
let Musicstatus = media.isMusicPlaying()          //音乐保活状态
/**
 * @description 开启保活悬浮窗
 * @param {string} 使用人名称
 */
floatywindows.start = function () {
    if(Bh_status && Musicstatus){
        console.log('已存在保活标识！！')
    }else{
        Bh = floaty.rawWindow(
          <horizontal gravity="center_vertical">
              <img id="图标"  src="file://images/ic_app_logo.png" w="40" h="40" alpha="0.8" circle="true" borderWidth="1dp" borderColor="black" />
          </horizontal>
        );
      Bh.setPosition(device.width - 100, device.height / 9)
      media.playMusic('./rec/music/npSound.mp3',1,true)
      $settings.setEnabled('foreground_service', true) //开启前台保活
    }
}
/**
 * @description 关闭保活悬浮窗
 * @param {string} 使用人名称
 */
floatywindows.stop = function () {
  if(!Bh_status && !Musicstatus){
    media.stopMusic()
    Bh.close()
    console.log('关闭悬浮窗')
  }else{
    console.log('无需关闭!')
  }
}
module.exports = floatywindows