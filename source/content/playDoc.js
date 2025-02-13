// ==UserScript==
// @name         template
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// ==/UserScript==

(() => {
    'use strict';

const createContainer = () => {
  // 在页面上生成一个id为"container"的div元素
const container = document.createElement('div');
container.id = 'container';
document.body.appendChild(container);

const utterText = document.createElement('textarea');
    utterText.id = 'utterText';
    utterText.addEventListener('input', () => {
        const doc = utterText.value;
        const parsedElem = parsePhrase(doc);
        container.appendChild(parsedElem);
        playSequence();
    });
    document.body.appendChild(utterText);
}

const createHtml = () => {
  // 创建按钮
const button = document.createElement('button');
button.textContent = '开始播放';
button.addEventListener('click', playSequence);
document.body.appendChild(button);
}

const mapSequence = () => {
  const container = document.querySelector('div#container');
  // 遍历"container"元素，生成一个播放序列
  const elements = container.querySelectorAll('p');
  const sequence = Array.from(elements).map(element => element.textContent);
  return sequence;
}

const playSequence = () => {
  const sequence = mapSequence();
  if (i < sequence.length) {
    const text = sequence[i];
    const utterance = new SpeechSynthesisUtterance(text);
    const voice1 = voices[139];
    const voice2 = voices[140];
    utterance.voice = currentVoice === 0 ? voice1 : voice2;
    utterance.volume = 1;
    currentVoice = 1 - currentVoice;

    // 获取当前 <p> 元素
    const target = document.querySelectorAll('#container > * > p')[i];
    target.style.borderWidth = '1px';
    target.style.borderStyle = 'dashed';
    target.style.borderColor = '#1E90FF';

    // 添加 boundary 事件监听器
    utterance.addEventListener('boundary', ({ charIndex, charLength }) => {
      const fragment = document.createDocumentFragment();
    
      const beforeWord = document.createTextNode(text.slice(0, charIndex));
      const word = document.createElement('mark');
      word.textContent = text.slice(charIndex, charIndex + charLength);
      const afterWord = document.createTextNode(text.slice(charIndex + charLength, text.length));
    
      fragment.appendChild(beforeWord);
      fragment.appendChild(word);
      fragment.appendChild(afterWord);
    
      target.innerHTML = ''; // 清空 target 的内容
      target.appendChild(fragment);
    });

    utterance.onend = () => {
      // 恢复原始文本
      target.textContent = text;
      i++;
      playSequence();
    };

    window.speechSynthesis.speak(utterance);
  }
}

const parsePhrase = (txtIn) => {
  const regPara = /\n\n/;
  const paraS = arrSpliter(txtIn, regPara);
  const fragment = document.createDocumentFragment();
  for (const elemCard of paraS) {
      const paraCard = document.createElement('div');
      paraCard.style.borderWidth = '1px';
      paraCard.style.borderStyle = 'dashed';
      paraCard.style.borderColor = '#1E90FF';
      const str = elemCard.split(/(?<=[\n，。？！])/);
      for (const elem of str) {
          const pTag = document.createElement('p');
          pTag.textContent = elem;
          paraCard.appendChild(pTag);
      }
      fragment.appendChild(paraCard);
  }
  return fragment;
}

const arrSpliter = (textInput, charSpliter) => {
  const arrOutput = textInput.trim().split(charSpliter);
  return arrOutput;
}

createContainer();
createHtml();

// 朗读播放序列
let voices = []; // 初始化voices为空数组
let currentVoice = 0;
let i = 0;

// voiceschanged事件监听器
window.speechSynthesis.addEventListener('voiceschanged', () => {
  voices = window.speechSynthesis.getVoices();
});

  // Your code here...
})();