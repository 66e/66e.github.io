/*
#6/jsAttached
```js
*/

// ==UserScript==
// @name        New script 
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       none
// @version     1.0
// @author      -
// @description 2025/12/3 0:0:0
// ==/UserScript==

(() => {
    'use strict';
    // 1. 修改 loadModule 函数，使其返回模块的引用
function loadModule(url) {
  // 返回 Promise，但不再仅仅是加载脚本
  return import(url);
}

// 2. 在一个异步函数中处理加载逻辑
async function initializeWavesurfer() {
  const wavesurferUrl = 'https://cdnjs.cloudflare.com/ajax/libs/wavesurfer.js/7.10.3/wavesurfer.esm.min.js';

  try {
    // 使用 import() 语法来动态加载模块
    const { default: WaveSurfer } = await loadModule(wavesurferUrl);

    // 模块加载成功后，WaveSurfer 变量就已经定义好了
    const wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#4F4A85',
      progressColor: '#383351',
      url: 'https://res.wx.qq.com/voice/getvoice?mediaid=MzI3NjYzODY0Nl8yMjQ3NDg1NTIz',
    });

    wavesurfer.on('interaction', () => {
      wavesurfer.play();
    });

    console.log('Wavesurfer loaded and initialized successfully!');
  } catch (error) {
    console.error('Failed to load Wavesurfer module:', error);
  }
}

const container = document.createElement("div");
container.id = "waveform";
document.body.appendChild(container);
// 3. 调用初始化函数来启动流程
initializeWavesurfer();

    // Your code here...
})();

/*
```
*/