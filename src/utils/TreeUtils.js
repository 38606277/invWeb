
/**
 * 
 * @param {*} list  需要遍历的数组
 * @param {*} value 查询的值
 * @param {*} key 查询的属性名
 */
const getObjById = (list, value, key) => {
    //判断list是否是数组
    if (list instanceof Array) {
        //遍历数组
        for (let i in list) {
            let item = list[i]
            if (item[key] === value) {
                return item
            } else {
                //查不到继续遍历
                if (item.children) {
                    let node = getObjById(item.children, key, value)
                    //查询到直接返回
                    if (node) {
                        return node;
                    }
                }
            }
        }
    } else {
        return null;
    }
}


















