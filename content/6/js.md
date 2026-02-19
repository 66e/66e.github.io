/*
## #jsMeccano
```js
*/

const lego = 42;
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/const

let x = 1;
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/let

console.assert(0)
// https://mdn.org.cn/en-US/docs/Web/API/console/info_static

  if (lego > 0) {
    x = undefined;
  } else {
    x = null;
  }
  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/if...else

const func2 = (x, y) => {
  console.debug(document.readyState);
  return x + y;
};
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions

if (document.readyState === "loading") {
  // 此时加载尚未完成
  document.addEventListener("DOMContentLoaded", func2);
} else {
  // `DOMContentLoaded` 已经被触发
  console.info(document.readyState);
  func2();
}
// https://developer.mozilla.org/zh-CN/docs/Web/API/Document/DOMContentLoaded_event

  if (document.readyState === "complete") {
    console.count(document.readyState);
    func2();
  }
// https://developer.mozilla.org/zh-CN/docs/Web/API/Document/readyState

/*
```
*/