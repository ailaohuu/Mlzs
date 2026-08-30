/**
 * 系统显示模式判断(深色、浅色)
 * @module color_mode
 */
var color_mode = {};
/**
 * @description 显示模式
 * @returns true 代表浅色模式  false 代表深色模式
 */
color_mode.attend = function(){
     let resources = context.getResources();
    // 获取系统配置
    let config = resources.getConfiguration();
    
    //17代表浅色模式，33代表深色模式
    if (config.uiMode === 17) {
        console.log('当前系统属于浅色模式')
        return true;
    }else {
        console.log('当前系统属于深色模式')
        return false;
    }
}
module.exports = color_mode;