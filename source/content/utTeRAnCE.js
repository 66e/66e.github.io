// ==UserScript==
// @name         utTeRAnCE_0213
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.2.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// ==/UserScript==

(() => {
    'use strict';

const matchHref = () => {
    const ghPage = /\bhttps?:\/\/\S+\.github\.io/i;
    const msnCn = /\bhttps?:\/\/www\.msn\.cn\/zh-cn\/\w+\/\w+\/[%-\w]+\/[-\w]+/i;

    switch (true) {
        case ghPage.test(window.location.href):
            return 'ghPage';
        case msnCn.test(window.location.href):
            return 'msnCn';
    }
}

const createContainer = () => {
    const fragment = new DocumentFragment();
    // 在页面上生成一个id为"container"的div元素
    const container = document.createElement('div');
    container.id = 'container';
    fragment.appendChild(container);
    return fragment;
}

const createHtml = () => {
  const fragment = new DocumentFragment();
  // 创建按钮
  const button = document.createElement('button');
  button.textContent = '开始播放';
  button.addEventListener('click', console.log(typeof true));

  const cancel = document.createElement('button');
  cancel.textContent = 'cancel';
  cancel.addEventListener('mouseup', () => {
      synth.cancel();
  });
  fragment.appendChild(button);
  fragment.appendChild(cancel);
  const container = document.querySelector('div#container');
  const utterText = document.createElement('textarea');
    utterText.id = 'utterText';
    utterText.addEventListener('input', () => {
        const doc = utterText.value;
        const parsedElem = parsePhrase(doc);
        container.innerHTML = '';
        container.appendChild(parsedElem);
        const sentence_1st = document.querySelector('div#container > div > p');
        artIculate(sentence_1st);
    });
    fragment.appendChild(utterText);
  return fragment;
}

const artIculate = (target) => {
    const targeTxt = target.textContent;
    const utterance = new SpeechSynthesisUtterance(targeTxt);
    utterance.voice = currentVoice === voices[139] ? voices[152] : voices[139];
    synth.speak(utterance);
    currentVoice = utterance.voice;

    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    target.style.backgroundColor = '#4a235a';

    // 添加 boundary 事件监听器
    utterance.addEventListener('boundary', ({ charIndex, charLength }) => {
      const fragment = document.createDocumentFragment();
    
      const beforeWord = document.createTextNode(targeTxt.slice(0, charIndex));
      const word = document.createElement('mark');
      word.textContent = targeTxt.slice(charIndex, charIndex + charLength);
      const afterWord = document.createTextNode(targeTxt.slice(charIndex + charLength, targeTxt.length));
    
      fragment.appendChild(beforeWord);
      fragment.appendChild(word);
      fragment.appendChild(afterWord);
    
      target.innerHTML = ''; // 清空 target 的内容
      target.appendChild(fragment);
    });

    utterance.addEventListener('end', () => {
        target.textContent = targeTxt;
        contAdapter(target);
    });
}

const contAdapter = (elem) => {
    const nextNode = elem.nextElementSibling;
    if ( nextNode ) {
        artIculate(nextNode);
    } else {
        const parentSibling = elem.parentElement.nextElementSibling;
        if ( parentSibling ) {
            const childNode = parentSibling.firstChild;
            if ( childNode ) {
                artIculate(childNode);
            }
        }
    }
}

const parsePhrase = (txtIn) => {
  const regPara = /\n\n/;
  const paraS = arrSpliter(txtIn, regPara);
  const fragment = document.createDocumentFragment();
  for (const elemCard of paraS) {
      const paraCard = document.createElement('div');
      paraCard.style.borderWidth = '1px';
      paraCard.style.borderStyle = 'solid';
      paraCard.style.color = '#FFFFFF';
      paraCard.style.backgroundColor = '#1b2631';
      paraCard.style.borderColor = '#1E90FF';
      const str = elemCard.split(/(?<=[\n,.。？！])/);
      for (const elem of str) {
          const pTag = document.createElement('p');
          pTag.textContent = elem;
          pTag.style.fontSize = 'x-large';
          pTag.style.backgroundColor = '#17202a';
          pTag.addEventListener('mouseup', () => {
            synth.cancel();
            artIculate(pTag);
          });
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

const stackWindow = (idString, wLeft, wTop, wWidth, wHeight) => {
  const floatLayer = document.createElement('float-window');
  floatLayer.id = idString === '' ? 'usurpFrame' : idString;
  floatLayer.style.opacity = 1.0;
  floatLayer.window.style.overflow = 'auto';
  floatLayer.window.style.left = wLeft + 'px';
  floatLayer.window.style.top = wTop + 'px';
  floatLayer.window.style.width = wWidth + 'px';
  floatLayer.window.style.height = wHeight + 'px';
  floatLayer.style.backgroundColor = 'rgba(34,34,34,.9)';

  const headerSlot = document.createElement('span');
  headerSlot.setAttribute('slot', 'header');
  headerSlot.textContent = idString;
  floatLayer.appendChild(headerSlot);
  floatLayer.open();
  return floatLayer;
}

const createFloat = () => {
  customElements.define('float-window', FloatWindow);
  const floatLayer = stackWindow('fiddle', 400, 500, 640, 480);
  const content = createContainer();
  floatLayer.appendChild(content);
  document.body.appendChild(floatLayer);

  const floatCmd = stackWindow('command', 200, 200, 320, 240);
  const contentCmd = createHtml();
  floatCmd.appendChild(contentCmd);
  document.body.appendChild(floatCmd);
}

class FloatWindow extends HTMLElement {
  constructor() {
      super()
      this.attachShadow({mode: 'open'})
      this.shadowRoot.innerHTML = `
    <style>
      .window {
        position: absolute;
        background-color: white;
        border: 1px solid gray;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        display: none;
      }

      .titleBar {
        background-color: lightgray;
        padding: 4px;
        cursor: move;
      }

      .closeBtn {
        float: right;
        cursor: pointer;
      }

    </style>
    <div class="window">
      <div class="titleBar">
        <span class="title"><slot name="header"></slot></span>
        <span class="closeBtn">×</span>
      </div>
      <div class="content">
        <slot></slot>
      </div>
      <br>
      <p class="coordinate"></p>
      <p class="measure"></p>
    </div>
  `

    this.window = this.shadowRoot.querySelector('.window')
    this.window.style.width = this.getAttribute("width")
    this.window.style.height = this.getAttribute("height")
    this.titleBar = this.shadowRoot.querySelector('.titleBar')
    this.closeBtn = this.shadowRoot.querySelector('.closeBtn')
    this.content = this.shadowRoot.querySelector('.content')
    this.coordinate = this.shadowRoot.querySelector('.coordinate');
    this.measure = this.shadowRoot.querySelector('.measure');

    this.mouseDownX = 0
    this.mouseDownY = 0
    this.translateX = 0
    this.translateY = 0

    // for resize use
    this._width = 0
    this._height = 0

    this.titleBar.addEventListener('mousedown', this.dragStart.bind(this))
    this.closeBtn.addEventListener('click', this.close.bind(this))

    this.window.addEventListener('mousemove', this.updateCursor.bind(this))

    // resize
    this.window.addEventListener('mousedown', (e)=>{
      if (this.window.style.cursor.includes("resize")) {
        this.mouseDownX = e.clientX
        this.mouseDownY = e.clientY
        this._width = this.window.offsetWidth
        this._height = this.window.offsetHeight
        const handler = this.resizeHandler.bind(this)
        document.addEventListener('mousemove', handler)
        document.addEventListener('mouseup', () => {
          document.removeEventListener("mousemove", handler)
        }, {once: true})
      }
    })
  }

  open() {
    this.window.style.display = 'block'
  }

  close() {
    this.window.style.display = 'none'
  }

  toggle() {
    const display = this.window.style.display
    display === '' || display === 'none' ? this.open() : this.close()
  }

  dragStart(e) {
    const m = this.window.style.transform.match(/translate\((-?\d*\.?\d+)px, (-?\d*\.?\d+)px\)/)
    if (m) {
      this.translateX = Number(m[1])
      this.translateY = Number(m[2])
    }
    this.translateX = e.clientX - this.translateX
    this.translateY = e.clientY - this.translateY
    const handler = this.drag.bind(this)
    document.addEventListener('mousemove', handler)
    document.addEventListener('mouseup',
      () => document.removeEventListener("mousemove", handler),
      {once: true}
    )
  }

  drag(e) {
    const x = e.clientX - this.translateX
    const y = e.clientY - this.translateY
    this.window.style.transform = `translate(${x}px, ${y}px)`
    this.coordinate.textContent = 'xLeft:' + x + ' yTop' + y;
  }

  updateCursor(e) {
    const threshold = 10
    const isNearBottom = (this.window.offsetHeight - e.offsetY) < threshold
    const isNearLeft = e.offsetX < threshold
    const isNearRight = (this.window.offsetWidth - e.offsetX) < threshold
    if (isNearBottom && isNearLeft) {
      this.window.style.cursor = "ne-resize"
    } else if (isNearBottom && isNearRight) {
      this.window.style.cursor = "nw-resize"
    } else if (isNearLeft || isNearRight) {
      this.window.style.cursor = 'col-resize'
    } else if (isNearBottom) {
      this.window.style.cursor = 'row-resize'
    } else {
      this.window.style.cursor = 'initial'
    }
  }

  resizeHandler(e) {
    let [dx, dy] = [0, 0]
    switch (this.window.style.cursor) {
      case 'row-resize':
        dy = e.clientY - this.mouseDownY
        break
      case 'col-resize':
        dx = e.clientX - this.mouseDownX
        break
      default:
        dy = e.clientY - this.mouseDownY
        dx = e.clientX - this.mouseDownX
    }

    this.window.style.width = `${this._width + dx}px`
    this.window.style.height = `${this._height + dy}px`
    this.measure.textContent = 'Height:'
     + this.window.style.height + ' Width:' + this.window.style.width;
  }
}
//appreciate Carson https://stackoverflow.com/questions/380244/dynamic-floating-window-by-javascript

const synth = window.speechSynthesis;
if ( matchHref() === 'ghPage' ) {
    createFloat();
    createContainer();

    // voiceschanged事件监听器
    synth.addEventListener('voiceschanged', () => {
      voices = synth.getVoices();
    });
}

// 朗读播放序列
let voices = []; // 初始化voices为空数组
let currentVoice = 0;

    // Your code here...
})();