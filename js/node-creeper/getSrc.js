const Creeper = require('./Creeper');
const fs = require('fs');
const Cheerio = require('cheerio');
const Base64 = require('./Base64.js');
const open = require('open');
const path = require('path');

const options = {
	host: 'www.dytt8.net',
	path: '',
	encoding : null, 		 // 让body 直接是buffer
	code: 'gb2312',			 // 网站编码(注释后为'utf-8')
}
const text = 'dytt8.html';

let writeStream = fs.createWriteStream(text);

console.log('准备爬取...');
/**
 * 获取电影天堂首页html
 */
Creeper.getHtml(options).then(html => {
	let hrefList = {};
	let $ = Cheerio.load(html, {decodeEntities: false});	// 关闭转换实体编码
	let anchors = $('.bd3rl').find('.co_area2').first().find('tr .inddline').children(':nth-child(even)');
	for (let i = 0; i < anchors.length; i++) {
		// 以链接作为对象键，值作为信息对象(包含名称和下载链接)
		hrefList[anchors[i].attribs.href] = {
			name: anchors[i].children[0].data.match(/《\S+》/)[0],
			downloadHref: '',
		}
	}

	// 将电影信息存储在hrefList对象中
	setMovieInfo(hrefList).then(() => {
		// 遍历对象，将电影信息写入html
		let movieText = `<html><head><meta charset='utf-8'></head><body><ol>`;
		for (let i in hrefList) {
			movieText += `<li><a style='font-size: 1.25rem;text-decoration: none;line-height:2;'
				href='${hrefList[i].downloadHref}'>${hrefList[i].name}</a></li>`;
		}
		writeStream.write(`${movieText}</ol></body></html>`);	// 写入文件
		console.log(`完成!\n文件储存在：${path.join(__dirname, text)}`);
		open(path.join(__dirname, text), 'chrome');
	});
})
.catch(e => {
	console.log(`请求 ${options.host} 失败\n错误信息：`, e.message);
})
/**
 * 遍历path，获取电影名称及下载链接，存储在list中
 * @param {*} list 电影对象，键值为path
 */
function setMovieInfo (list) {
	let hrefPromise = [];
	for (let hash in list) {
		let promise = Creeper.getHtml({
			host: 'www.dytt8.net',
			path: hash,
			encoding : null,
			code: 'gb2312',	
		});
		console.log(`开始爬取 ${list[hash].name}`);
		promise.then(html => {
			let anchorsText = getDownloadHref(html);	// 超链接文字内容
			console.log(`成功爬取 ${list[hash].name}`);
			list[hash].downloadHref = Base64.ThunderEncode(anchorsText);	// 迅雷下载地址为超链接文字内容通过ThunderEncode转码后的字符串
		})
		.catch(e => {
			console.log(`请求 ${hash} 失败\n错误信息：`, e.message);
		});

		hrefPromise.push(promise);
	}
	return Promise.all(hrefPromise);
}

/**
 * 获取超链接文字内容
 * @param {*详情页面} html 页面
 */
function getDownloadHref (html) {
	let $ = Cheerio.load(html, {decodeEntities: false});
	return $('#Zoom').find('td a').text();
}