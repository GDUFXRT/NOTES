## array

### 应用

```
arr.filter(Boolean); // 过滤falsy值
```

### 方法

#### 改变原数组

1. `copyWithin` 返回浅复制后的数组。
2. `fill` 返回填充后的数组。
3. `pop` 返回弹出的元素或者undefined。
4. `shift` 返回弹出的元素或者undefined。
5. `push` 返回改变后的数组。
6. `unshift` 返回改变后的数组。
7. `reverse` 返回翻转后的数组。
8. `sort` 返回排序后的数组。
9. `splice` 返回包含已删除元素的数组。

#### 不改变原数组

1. `filter` 返回过滤后的数组或空数组。空值不执行函数。
2. `every` 返回Boolean。对于置于空数组上的任何条件，此方法返回true。空值不执行函数。
3. `reduce` 返回缩减后的结果。
4. `reduceRight` 返回缩减后的结果。从右至左遍历数组。
5. `some` 返回Boolean。
6. `forEach` 返回undefined。
7. `map` 返回映射后的新数组。
8. `find` 返回第一个通过测试函数的值的value或者undefined。
9. `findIndex` 返回第一个通过测试函数的值的index或者-1。
10. `includes` 返回Boolean。
11. `indexOf` 返回第一个与查找值匹配的值的index或者-1。
12. `lastIndexOf` 返回最后一个与查找值匹配的值的index或者-1。
13. `entries` 返回数组的iterator。key/value。
14. `keys` 返回数组的iterator。key。
15. `values` 返回数组的iterator。value。
16. `join` 返回连接后的string。
17. `concat` 返回合并后的数组。
18. `slice` 返回数组的一部分。([begin[, end]])。
19. `toString` 返回一个表示数组元素的字符串。
20. `toLocaleString` 返回一个表示数组元素的字符串。