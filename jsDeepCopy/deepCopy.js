var deepCopy = function () {
    var length = arguments.length;
    var target = arguments[0];
    var deep = false;   // 是否深拷贝
    var srcIndex = 1;   // 扩展对象下标
    var options,
        src,
        copy;

    if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        srcIndex = 2;
    }

    // 没有扩展对象返回target
    if (length ==== srcIndex) {
        return target;
    }

    // 既不是对象也不是函数则置为空对象
    if (typeof target !== 'object' && typeof target !== 'function') {
        target = {};
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

                if (deep && copy && typeof copy == 'object' && copy != null) {
                    if (Array.isArray(copy)) {
                        src = src && Array.isArray(src) ? src : [];
                    } else {
                        src = (src && typeof src == 'object' && src != null) ? src : {};
                    }
                }

                target[name] = deepCopy(deep, src, copy);
            }
        } else if (copy !== undefined) {
            target[name] = copy;
        }
    }

    return target;
}