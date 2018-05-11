import requests
import re
import webbrowser
from urllib.parse import quote
from bs4 import BeautifulSoup

HTML_PATH = 'D:/Project/python/result.html'

def getHtmlSoup (url):
    r = requests.get(url)
    try:
        soup = BeautifulSoup(r.text, "html5lib")
    except:
        raise Exception("解析html出错")
    return soup

# 获取一部电影的所有下载链接
def getMagnetByBtbtdy (url, title):
    moviePage = getHtmlSoup(url)
    movieLink = []
    for ul in moviePage.select('.p_list_02'):
        movieLink.append({
            'title': ul.select('.ico_1')[0].get_text(),
            'link': ul.find_all("a")[1]['href']
        })
    return movieLink

def resultFormat(list,movieName):
    htmlStr = '''<!DOCTYPE html>
        <html lang="en"><head><meta charset="UTF-8"><title>Document</title></head>
        <body>
        <h1>''' + movieName + ' （www.btbtdy.com）搜索结果</h1><ul>'
    for movie in list:
        htmlStr = htmlStr + '<li><h3>' + movie['title'] + '</h3><ol>'
        for movieLink in movie['content']:
            htmlStr = htmlStr + '<li><a href=\"' + movieLink['link'] + '\">' + movieLink['title'] + '</a></li>'
        htmlStr = htmlStr + '</ol></li>'
    htmlStr = htmlStr + '</ul></body></html>'
    return htmlStr


# 存储最终搜索结果
allLink = []

movieName = input("输入电影名称:")
print('开始检索...')
searchSoup = getHtmlSoup('http://www.btbtdy.com/search/' + quote(movieName) + '.html')

dlEle = searchSoup.find_all("dl")
if (len(dlEle) > 0):
    for dl in dlEle:
        mTitle = (dl.find('a')['title'])
        movieId = re.findall(r'\d+', dl.find('a')['href'])[0]
        downloadPagePath = 'http://www.btbtdy.com/vidlist/' + movieId + '.html'
        print(downloadPagePath)
        allLink.append({
            'title': mTitle,
            'content' : getMagnetByBtbtdy(downloadPagePath, dl.find('a')['title'])
        })
    print('正在写入文件...')
    with open(HTML_PATH,'w',encoding='utf-8') as file:
        file.write(resultFormat(allLink,movieName))
        print('正在打开文件')
        webbrowser.open(HTML_PATH)
else:
    print('找不到该电影!!!')