/**
 * @param {object|string} path 
 * @param {object|string} data 
 * @param {object} params 
 */
function post (path, data = {}, params = {}) {
    let url = '';
    let config = {};

    // 第一个参数为object则为配置项，其他向后获取
    if (typeof path === 'object') {
        config = path;
        path = data;
        data = params;
        params = arguments[arguments.length - 1];
    }

    url = joint(path, params);
    return this.$http.post(url, data, config);
}

/**
 * @param {object|string} path 
 * @param {object|string} params 
 */
function get (path, params = {}) {
    let url, config = {};

    // 第一个参数为object则为配置项，其他向后获取
    if (typeof path === 'object') {
        config = path;
        path = params;
        params = arguments[arguments.length - 1];
    }

    url = joint(path, params);
    return this.$http.get(url, config);
}

/**
 * 拼装path与params
 * @param {*} path 
 * @param {*} params 
 * @return url
 */
function joint (path, params) {
    let urlParams = '';
    if (typeof path !== 'string' || path === undefined) {
        throw new TypeError('path is not string');
    }
    if (typeof params === 'object' && Object.keys(params).length) {
        for (let key in params) {
            urlParams += `&${key}=${params[key]}`;
        }
        urlParams = urlParams.slice(1);
        path = handleUrl(path);
        return `${path}?${urlParams}`;
    } else {
        return handleUrl(path);
    }
}

/**
 * 生成完整uri(不包含参数)
 * @param {string} path 
 */
function handleUrl(path) {
    // 根据业务拼接代码
}