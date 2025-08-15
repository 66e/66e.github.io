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

// 1. 封装一个通用的动态加载函数
const loadResource = (url) => {
    return new Promise((resolve, reject) => {
        const fileExtension = url.match(/\.[^/.]+$/)?.[0];
        if (!fileExtension) {
            reject(new Error('Invalid URL: No file extension found.'));
            return;
        }

        let tag;
        switch (fileExtension) {
            case '.css':
                tag = document.createElement('link');
                tag.rel = 'stylesheet';
                tag.href = url;
                break;
            case '.js':
            case '.md': // Assuming .md is for script as per original code
                tag = document.createElement('script');
                tag.src = url;
                break;
            default:
                reject(new Error(`Unsupported file extension: ${fileExtension}`));
                return;
        }

        tag.onload = () => resolve(tag);
        tag.onerror = () => reject(new Error(`Failed to load resource: ${url}`));
        
        document.body.appendChild(tag);
    });
};

// 2. 封装 jsPanel 的创建和加载逻辑
const initJsPanel = async (elem, param) => {
    // 检查 jsPanel 是否已存在
    if (window.jsPanel) {
        createWindow(elem, param);
        return;
    }

    try {
        // 使用 Promise.all 并行加载 CSS 和 JS，并等待它们全部完成
        const resources = [
            "https://jspanel.de/jspanel/dist/jspanel.min.css",
            "https://jspanel.de/jspanel/dist/jspanel.min.js",
        ];
        await Promise.all(resources.map(url => loadResource(url)));

        // 确保 jsPanel 对象已存在后再创建窗口
        if (window.jsPanel) {
            createWindow(elem, param);
        } else {
            console.error('jsPanel was not found after loading scripts.');
        }

    } catch (error) {
        console.error('Failed to load jsPanel resources:', error);
    }
};

// 3. 修改 createWindow 函数，使其更简洁
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
};

// 4. 调用方式
initJsPanel(0, "outLet");
// 或者 initJsPanel(someElement, "dashBoard");

    // Your code here...
})();

/*
```
*/