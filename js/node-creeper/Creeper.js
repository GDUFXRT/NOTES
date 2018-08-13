const http = require('http');
const Iconv = require('iconv-lite');

class Creeper {
    /**
     * 获取html内容
     * @param {*} options http配置
     */
	static getHtml (options) {
        return new Promise((resolve, reject) => {
            let req = http.request(options, res => {
                let html = '';
                res.on('data', data => {
                    html += Iconv.decode(data, options.code || 'utf-8');
                })
                res.on('end', () => {
                    resolve(html);
                })
            });
            req.on('error', function(e){
                reject(e);
                // console.log("request " + options.host + " error, try again");
            });
            req.end();
        })
	}
}

module.exports = Creeper;

