/**
 * 长效存储模块，包含了写入、删除、读取
 * @module color_mode
 */
var storage_data = {}
/**
* @description 写入
* @param {string} Sheetname 数据表名称
* @param {string} Dataname 数据名称
* @param {Array} data  传入的数组信息
*/
storage_data.write = function (Sheetname,Dataname,data) {
    var storage = storages.create(Sheetname);
    storage.put(Dataname, data);
    if (storage.contains(Dataname)) {
        console.log('数据存储成功');
    }else{'数据存储失败'}
}
/**
* @description 读取
* @param {string} Sheetname 数据表名称
* @param {string} Dataname 数据名称
*/
storage_data.read = function(Sheetname,Dataname){
    var storage = storages.create(Sheetname);
    var z = storage.get(Dataname)
     return z
}
/**
* @description 移除
* @param {string} Sheetname 数据表名称
* @param {string} Dataname 数据名称
*/
storage_data.remove = function(Sheetname,Dataname){
    var storage = storages.create(Sheetname);
    storage.remove(Dataname);
}
/**
* @description 判断
* @param {string} Sheetname 数据表名称
* @param {string} Dataname 数据名称
*/
storage_data.has = function (Sheetname,Dataname) {
    var storage = storages.create(Sheetname);
    let y = storage.contains(Dataname)
    return y
}

/**
* @description 判断
* @param {string} Sheetname 数据表名称
* @param {string} Dataname 数据名称
* @param {string} tmp 临时数据名称
* @param {string} data  对比数据
*/
storage_data.Contrast = function (Sheetname,Dataname,tmp,data) {
    let storage = storages.create(Sheetname);
    if(storage.contains(Dataname)){
        let z = storage.get(Dataname)
        let storagetmp = storages.create(Sheetname);
        storagetmp.put(tmp, data);
        let x = storage.get(tmp)
        let q = z.username === x.username && z.UID === x.UID && z.Key === x.Key && z.Corpid === x.Corpid
        if(!q){
            storage.put(Dataname,data)
            return true
        }
    }
}

module.exports = storage_data