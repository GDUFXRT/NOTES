//extend( [deep ], target, object1 [, objectN ] )
var extend = function () {
    var length = arguments.length;
    var target = arguments[0] || {};
    var deep = false;   // 是否深拷贝
    var srcIndex = 1;   // 扩展对象下标
    var options, src, copy, copyIsArray;

    if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        srcIndex = 2;
    }

    // 既不是对象也不是函数则置为空对象
    if (typeof target !== 'object' && typeof target !== 'function') {
        target = {};
    }

    // 没有扩展对象返回target
    if (length === srcIndex) {
        return target;
    }

    for (; srcIndex < length; srcIndex++) {
        // 扩展对象不为null
        if ((options = arguments[srcIndex]) != null) {
            for (name in options) {
                // 被扩展对象值
                src = target[name];
                // 扩展对象值
                copy = options[name];

                // 避免出现环
                if (target === copy) {
                    continue;
                }

                // 需要深拷贝且扩展对象值为对象或数组
                if (deep && copy && (typeof copy == 'object' || (copyIsArray = Array.isArray(copy))) && copy != null) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        src = src && copyIsArray ? src : [];
                    } else {
                        src = (src && typeof src == 'object' && src != null) ? src : {};
                    }
                    target[name] = extend(deep, src, copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;
}