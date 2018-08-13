## 说明 ##

此方法模仿`jQuery.extend()`，但去除扩展对象到jQuery中（毕竟没有）的功能，直接返回原对象。即修改了以下代码：

``` javascript  
- if ( length === i ) {
- 　　target = this;
- 　　--i;
- }

+ if (length === srcIndex) {
+    return target;
+ }


```

## 使用方法 ##

`extend( [deep ], target, object1 [, objectN ] )`


