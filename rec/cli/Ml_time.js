/**
 * @module 获取当前时间，并格式化为 
 * @returns {string} 格式化后的当前时间"[YYYY.MM.DD-HH.mm.ss]" 的字符串
 */
function getFormattedTime() {
    const now = new Date();
    
    // 获取各时间单位，并确保两位数格式
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回 0-11
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // 拼接成目标格式
    return `[${year}.${month}.${day}-${hours}.${minutes}.${seconds}]`;
}

/**
 * 获取当前日期，并格式化为 "YYYY.MM.DD" 的字符串
 * @returns {string} 格式化后的当前日期字符串
 */
function getFormattedDate() {
    const now = new Date();
    
    // 获取各日期单位，并确保两位数格式
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回 0-11
    const day = now.getDate().toString().padStart(2, '0');
    
    // 拼接成目标格式
    return `${year}.${month}.${day}`;
}

function getFormattedHour() {
    const now = new Date();
    
    
    const hours = now.getHours().toString().padStart(2, '0');

    
    // 拼接成目标格式
    return `${hours}`;
}
// 导出多个函数
module.exports = {
    getFormattedTime,
    getFormattedDate,
    getFormattedHour
};