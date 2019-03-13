/**
 * @name type
 * @param {Object} obj 要判断的数据类型
 * @desc {{description}}{{判断js数据类型}}
 * @createTime 2019年03月07日17:15:06
 */
export const type = obj => Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '').toLowerCase()
