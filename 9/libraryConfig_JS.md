/*
```js
*/

// ==UserScript==
// @name        New script 
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       none
// @version     1.0
// @author      -
// @description 2025/6/30 13:45:42
// ==/UserScript==

(() => {
    'use strict';

const createWindow = (elem, param) => {
    const div = document.createElement("div");
    // 使用对象字面量
    const oWin = {
        callback: (panel) => panel.content.appendChild(div),
        opacity: .9,
        theme: "primary",
    };

    switch (param) {
        case undefined: // 最好使用一个明确的默认值，而不是 undefined
        case null: // 也可以处理 null
            oWin.contentSize = "400 250";
            const identify = Date.now().toString(36);
            oWin.headerTitle = identify;
            oWin.id = identify;
            oWin.position = "right-top -10 125";
            break;
        case "dashBoard":
            oWin.contentSize = "450 250";
            oWin.headerTitle = param;
            oWin.id = param;
            oWin.position = "right-bottom -10 -10";
            break;
    }
    
    // 如果elem存在，在appendChild之前将它添加到div中
    if (elem) {
      div.appendChild(elem);
    }
    
    window.jsPanel.create(oWin);
}

// 1. 库的配置对象
// 存储所有需要动态加载的库的信息
const libraryConfig = {
  jsPanel: {
    urls: [
      "https://jspanel.de/jspanel/dist/jspanel.min.css",
      "https://jspanel.de/jspanel/dist/jspanel.min.js",
    ],
    globalVar: 'jsPanel', // 库加载后，全局变量的名称
    method: createWindow, // 库加载成功后执行的回调函数
  },
  // 如果你需要加载另一个库，比如 Chart.js
  // chartjs: {
  //   urls: [
  //     "https://cdn.jsdelivr.net/npm/chart.js@3.5.1/dist/chart.min.js",
  //   ],
  //   globalVar: 'Chart',
  //   method: createChart, // 加载成功后执行的函数
  // }
};

// 2. 通用的动态加载函数
const loadResource = (url) => {
    return new Promise((resolve, reject) => {
        const tag = document.createElement(url.endsWith('.css') ? 'link' : 'script');
        if (url.endsWith('.css')) {
            tag.rel = 'stylesheet';
            tag.href = url;
        } else {
            tag.src = url;
        }
        
        tag.onload = () => resolve(tag);
        tag.onerror = () => reject(new Error(`Failed to load resource: ${url}`));
        
        document.body.appendChild(tag);
    });
};

// 3. 通用的库加载和初始化函数
const loadLibrary = async (libraryName, ...args) => {
    const config = libraryConfig[libraryName];
    if (!config) {
        console.error(`Library configuration for '${libraryName}' not found.`);
        return;
    }

    // 检查全局变量是否存在
    if (window[config.globalVar]) {
        config.method(...args);
        return;
    }

    try {
        await Promise.all(config.urls.map(url => loadResource(url)));

        if (window[config.globalVar]) {
            config.method(...args);
        } else {
            console.error(`Global variable '${config.globalVar}' not found after loading scripts.`);
        }

    } catch (error) {
        console.error(`Failed to load library '${libraryName}':`, error);
    }
};

// 4. 调用示例
// 当你需要创建 jsPanel 窗口时，调用此函数
loadLibrary('jsPanel', 0, "outLet");

// 如果有另一个库
// loadLibrary('chartjs', chartData, chartOptions);

    // Your code here...
})();

/*
```
*/