// ==UserScript==
// @name         articulateWin_082-4
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.8.2
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// ==/UserScript==

(() => {
  'use strict';

const createFragSuit = () => {
  const fragment = document.createDocumentFragment();
  const utterText = document.createElement('textarea');
  utterText.id = 'utterText';
  fragment.appendChild(utterText);

  const urlInput = document.createElement('input');
  urlInput.type = 'url';
  urlInput.size = '60';
  urlInput.value = 'https://6cc.github.io/r4/2024/04-hero-adventure.md';
  fragment.appendChild(urlInput);

  const btnFetch = document.createElement('button');
  btnFetch.textContent = 'fetch';
  btnFetch.addEventListener('mouseup', function() {
      getFile(urlInput.value, utterText);
  });
  fragment.appendChild(btnFetch);

  utterText.addEventListener('input', () => {
      const newLineS = /\n\n|\n/;
      const puncS = /[，。？！]/;
      const lineS = utterText.value;
      const paraSFromDoc = arrSpliter(lineS, newLineS);
      const srcArr = [];
      for (const elem of paraSFromDoc) {
          const strSFromPara = arrSpliter(elem, puncS);
          srcArr.push(strSFromPara);
      }
      artIculate(srcArr, 152);
      console.log(srcArr);
      btnFetch.title = srcArr;
  });
  
  const bUtter_1 = document.createElement('button');
bUtter_1.textContent = 'bUtter_1';
bUtter_1.addEventListener('mouseup', () => {
    artIculate(utterText.value);
});
fragment.appendChild(bUtter_1);

const bUtter_2 = document.createElement('button');
bUtter_2.textContent = 'bUtter_2';
bUtter_2.addEventListener('mouseup', () => {
    artIculate(utterText.value, 152);
});
fragment.appendChild(bUtter_2);

const synth = window.speechSynthesis;
const cancel = document.createElement('button');
cancel.textContent = 'cancel';
cancel.addEventListener('mouseup', () => {
    synth.cancel();
});
fragment.appendChild(cancel);

const pause = document.createElement('button');
pause.textContent = 'pause';
pause.addEventListener('mouseup', () => {
    synth.pause();
});
fragment.appendChild(pause);

return fragment;
}

const stackWindow = (idString, wLeft, wTop, wWidth, wHeight) => {
const floatLayer = document.createElement('float-window');
floatLayer.id = idString === '' ? 'usurpFrame' : idString;
floatLayer.style.opacity = .9;
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
const content = createFragSuit();
floatLayer.appendChild(content);
document.body.appendChild(floatLayer);
}

const getFile = async (fileURL, targetElem) => {
const response = await fetch(fileURL);//Error gets thrown here, because the asset does not exist in the current code state.
const docData = await response.text();
targetElem.value = docData;
}

const arrSpliter = (textInput, charSpliter) => {
const arrOutput = textInput.trim().split(charSpliter);
return arrOutput;
}

const getVoices = () => {
return new Promise(resolve => {
    let voices = speechSynthesis.getVoices();
    if (voices.length) {
        resolve(voices);
        return;
    }
    const voiceschanged = () => {
        voices = speechSynthesis.getVoices();
        resolve(voices);
    }
    speechSynthesis.addEventListener('voiceschanged', () => {
        voiceschanged();
    });
})
}

const artIculate = async (text, voiceIndex, vol) => {
const ttsVoices = await getVoices();
const utterance = new SpeechSynthesisUtterance(text);
utterance.voice = ttsVoices[voiceIndex || 139];
const currentOur = new Date().getHours();
const decentVol = currentOur > 10 ? 1 : .2;
utterance.volume = vol || decentVol;
speechSynthesis.speak(utterance);
}
//appreciate koldobika https://stackoverflow.com/questions/66951019/async-await-promise-does-not-work-promiseresult-is-undefined
//appreciate docta_faustus https://stackoverflow.com/questions/61016951/changing-the-speechsynthesis-voice-not-working  

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

createFloat();

  // Your code here...
})();