/*
```js
*/

// ==UserScript==
// @name        utTeRAnCE_0803
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       none
// @version     1.0
// @author      -
// @description 2025/6/30 13:45:42
// ==/UserScript==

(() => {
    'use strict';

const createWindow = ( elem, param ) => {
    const div = document.createElement("div");
    div.id = param;
    const oWin = new Object();
    oWin.callback = (panel) => panel.content.appendChild( div );
    oWin.opacity = .9;
    oWin.theme = "primary";

    switch ( param ) {
        case undefined:
            oWin.contentSize = "400 250";
            const identify = Date.now().toString( 36 );
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
    jsPanel.create( oWin );
    if ( elem ) {
        div.appendChild( elem );
    }
}

const matrixRetrieve = ( branch ) => {
    const oM = new Object();
    oM.jsPanel = new Object();
    oM.jsPanel.existing = typeof jsPanel;
    oM.jsPanel.scheduled = "object"; // `jsPanel` in window
    oM.jsPanel.referS = [
        "https://jspanel.de/jspanel/dist/jspanel.min.css",
        "https://jspanel.de/jspanel/dist/jspanel.min.js",
    ];
    oM.jsPanel.method = ( elem, param ) => {
        createWindow ( elem, param );
    };
    return oM [ branch ];
}

const createByExtens = ( urlFile, fileExtens ) => {
    switch ( fileExtens ) {
        case '.css':
            const linkRefer = document.createElement('link');
            linkRefer.href = urlFile;
            linkRefer.setAttribute('rel', 'stylesheet');
            return linkRefer;
        case '.js':
        case '.md':
            const scriptRefer = document.createElement('script');
            scriptRefer.src = urlFile;
            return scriptRefer;
        default:
            console.log(fileExtens);
            break;
    }
}

const appendRefer = ( referUrl ) => {
    const fileExtension = referUrl.match(/\.[^/.]+$/);
    const referElem = createByExtens( referUrl, fileExtension[0] );
    const fileName = referUrl.match(/[^\/=\b]+(?=\.[^\/.]*$)/)[0];
    referElem.id = fileName.replace(/\./g,'_')
    + fileExtension[0].replace(/\./g,'_');
    return referElem;
}

const secuReFerShell = ( referObj, targetElem, param ) => {
    if ( referObj.existing === referObj.scheduled ) {
        referObj.method( targetElem, param );
    } else {
        const urlS = referObj.referS;
        const exeCuTable = /(_JS\.md|\.js)$/i;
        urlS.forEach(( url ) => {
            const tag = appendRefer ( url );
            if ( exeCuTable.test(url) ) {
                tag.addEventListener("load", () => {
                    referObj.method( targetElem, param );
                });
            }
            document.body.appendChild(tag);
        });
    }
}

const initializeVoiceSC = ( elem ) => {
    const mLingual_r = /Multilingual /i;
    const rLang = /zh-/i;
    speechSynthesis.addEventListener("voiceschanged", () => {
        const voices = synthGetVoices ();
        const arrayEmpty = new Array();
        if ( elem.length < 1 ) {
            for (const [i, voice] of voices.entries()) {
                const condition = mLingual_r.test( voice.name )
                || rLang.test( voice.lang );
                if ( condition ) {
                    arrayEmpty.push( voice );
                    const option = document.createElement("option");
                    option.textContent = `[${ i }]【${ voice.lang }】${ voice.name }`;
                    option.value = i;
                    elem.appendChild( option );
                }
            }
        }
    });
}

const visualizeOutlet = ( unitIn ) => {
    const jsPanel = matrixRetrieve ( "jsPanel" );
    const div = document.createElement("div");
    div.appendChild( unitIn );
    secuReFerShell ( jsPanel, div, "outLet" );
}

const parsePassage = ( txtIn ) => {
    const regExp = /(?<=[\n\r!,?。！，？])/i;
    const sentenceS = txtIn.split( regExp );
    return sentenceS;
}

const toggleMount = ( content ) => {
    const elem = document.querySelector("div#outLet");
    if ( elem ) {
        elem.appendChild( content );
    } else {
        visualizeOutlet ( content );
    }
}

const visualizeCluster = ( arr ) => {
    const div = document.createElement("div");
    arr.forEach(( elem ) => {
        const pTag = document.createElement("p");
        pTag.textContent = elem;
        div.appendChild( pTag );
    });
    return div;
}

const visualizeComponentS = () => {
    const textarea = document.createElement("textarea");
    textarea.addEventListener("dblclick", () => {
        textarea.value = "";
    });
    textarea.addEventListener("paste", () => {
        setTimeout(() => {
            artIculate ( textarea.value );
        }, 1);
    });
    textarea.cols = "50";
    textarea.rows = "10";
    textarea.style.overflow = "auto";
    textarea.value = "故大德必得其位，必得其禄。必得其名，必得其寿，故天之生物，必因其材而笃焉。";

    const button = document.createElement("button");
    button.addEventListener("click", () => {
        styleCssInject ();
    });
    button.textContent = "button";

    const newWin = document.createElement("button");
    newWin.addEventListener("click", () => {
        const array = parsePassage ( textarea.value );
        artiCULate ( array );
    });
    newWin.textContent = "newWin";

    const select = document.createElement("select");
    select.id = "voiceSSel";
    select.addEventListener("change", () => {
        artiCULate ( textarea.value, select.value );
    });
    const container = document.createElement("div");
    container.appendChild( textarea );
    container.appendChild( button );
    container.appendChild( newWin );
    container.appendChild( select );
    return container;
}

const renderText = (arr) => {
    // 仅在非 iframe 模式下才清空和重新生成 DOM
    if (!isIframeMode) {
        textContainer.innerHTML = "";
        arr.forEach((sentence, index) => {
            const sentenceElement = document.createElement("span");
            sentenceElement.classList.add("sentence");
            sentenceElement.textContent = sentence;
            sentenceElement.dataset.index = index;
            textContainer.appendChild(sentenceElement);
        });
    } else {
        // 在 iframe 模式下，直接修改页面上的 P 元素
        pTagsInIframe.forEach((elem, index) => {
            elem.dataset.index = index;
            elem.classList.remove('highlight-sentence'); // 清除旧高亮
            elem.textContent = currentArrSchedule[index]; // 恢复为纯文本
        });
    }
};

// 辅助函数：根据模式查找元素
const findElementByIndex = ( index ) => {
    if ( isIframeMode ) {
        return pTagsInIframe [ index ];
    } else {
        const el = document.querySelector( `.sentence[data-index="${index}"]` );
        return el;
    }
}

const utterRecursive = ( index ) => {
    const currentSentenceElement = findElementByIndex(index);

    if (currentSentenceElement) {
        // 确保在朗读开始时才应用句子高亮
        currentSentenceElement.classList.add('highlight-sentence');
    }

  // 关键改动：设置语音
    if (voices.length > 0) {
        // 从 voxIdx 数组中获取当前语音的索引

        const voiceIdx = voxIdx[currentVoiceIndex % voxIdx.length];
        utterance.voice = voices[voiceIdx];

        // 更新语音索引，以便下一次朗读使用不同的语音
        currentVoiceIndex++;
    }

    utterance.text = currentArrSchedule[index];
    window.speechSynthesis.speak( utterance );
};

const artiCULate = ( arrSchedule ) => {
    // 停止之前的朗读
    window.speechSynthesis.cancel();

    // 1. 检查URL，决定是否进入iframe模式
    const iframeSelector = "div.epub-view>iframe";
    if (window.location.href.includes("https://alist-org.github.io/static/epub.js/viewer.html")) {
        try {
            const iframe = document.querySelector(iframeSelector);
            if (iframe && iframe.contentDocument) {
                const pTags = iframe.contentDocument.querySelectorAll("div>h4, p");
                pTagsInIframe = Array.from(pTags); // 将 NodeList 转换为数组

                const array = pTagsInIframe.map(elem => elem.textContent);
                currentArrSchedule = array;
                isIframeMode = true;
            } else {
                throw new Error("Iframe not found or content not accessible.");
            }
        } catch (e) {
            console.error("无法访问iframe内容，可能是跨域或元素不存在。", e);
            currentArrSchedule = Array.isArray(arrSchedule) ? arrSchedule : [arrSchedule];
            isIframeMode = false;
        }
    } else {
        currentArrSchedule = Array.isArray(arrSchedule) ? arrSchedule : [arrSchedule];
        isIframeMode = false;
    }

  // 新增：事件委托逻辑
    const startReadingFromClick = (event) => {
        let clickedElement = event.target;
        // 确保点击的是 h4 或 p 元素
        if (clickedElement.tagName === "H4" || clickedElement.tagName === "P") {
            const index = parseInt(clickedElement.dataset.index, 10);
            if (!isNaN(index)) {
                currentIndex = index;
                window.speechSynthesis.cancel();
                utterRecursive(currentIndex);
            }
        }
    };

    if (isIframeMode) {
        const iframeDoc = document.querySelector("div.epub-view>iframe").contentDocument;
        if (iframeDoc) {
            iframeDoc.body.addEventListener('click', startReadingFromClick);
        }
    } else {
        // 非iframe模式下，监听主容器
        textContainer.addEventListener('click', startReadingFromClick);
    }

    currentIndex = 0;

    // 重新渲染DOM
    renderText(currentArrSchedule);

    // 开始朗读
    utterRecursive(currentIndex);
}

const styleCssInject = () => {
    const style = document.createElement("style");
    style.textContent = `
.highlight-sentence {
  background-color: yellow;
  transition: background-color 0.3s ease;
}

.highlight-word {
  color: red;
  font-weight: bold;
}`;

    const iframe = document.querySelector("div.epub-view>iframe");
    if ( iframe && iframe.contentDocument ) {
        iframe.contentDocument.body.appendChild( style );
    } else {
        document.body.appendChild( style );
    }
}

const processWorkflow = () => {
    const jsPanel = matrixRetrieve ( "jsPanel" );
    const componentS = visualizeComponentS ();
    secuReFerShell ( jsPanel, componentS, "dashBoard" );
    secuReFerShell ( jsPanel, textContainer, "outLet" );
    const targetElem = componentS.querySelector("select#voiceSSel"); // asynchronous processing
    initializeVoiceSC ( targetElem );
    styleCssInject ();
}

const textContainer = document.createElement("div");
textContainer.id = "textContainer";

processWorkflow ();

const utterance = new SpeechSynthesisUtterance();
let currentIndex = 0;
let currentArrSchedule = [];
let isIframeMode = false; // 用于跟踪当前是否处于 iframe 模式
let pTagsInIframe = []; // 新增：用于存储 iframe 中的 p 元素
const synthGetVoices = () => speechSynthesis.getVoices();
let voices = [];
const voxIdx = [139, 61, 152];
let currentVoiceIndex = 0; // 新增：当前语音在 voxIdx 中的索引

window.speechSynthesis.addEventListener("voiceschanged", () => {
    voices = synthGetVoices();
});

// 只添加一次监听器，避免重复
utterance.addEventListener("end", () => {
  // 清除上一个句子的所有高亮
  const prevSentenceElement = findElementByIndex ( currentIndex );
  if (prevSentenceElement) {
    prevSentenceElement.classList.remove('highlight-sentence');
    // 恢复原始文本内容
    prevSentenceElement.textContent = currentArrSchedule[currentIndex];
  }

  currentIndex++;
  if (currentIndex < currentArrSchedule.length) {
    utterRecursive(currentIndex);
  } else {
    // 朗读完毕后重置状态
    currentIndex = 0;
    isIframeMode = false; // 重置模式
  }
});

utterance.addEventListener("boundary", ({ charIndex, charLength }) => {
  const currentSentenceElement = findElementByIndex ( currentIndex );
  if (currentSentenceElement) {
    const text = currentArrSchedule[currentIndex];
    const before = text.substring(0, charIndex);
    const word = text.substring(charIndex, charIndex + charLength);
    const after = text.substring(charIndex + charLength);
    
    const fragment = document.createDocumentFragment();
    if (before) {
      fragment.appendChild(document.createTextNode(before));
    }
    const wordSpan = document.createElement('span');
    wordSpan.classList.add('highlight-word');
    wordSpan.textContent = word;
    fragment.appendChild(wordSpan);
    if (after) {
      fragment.appendChild(document.createTextNode(after));
    }

    currentSentenceElement.innerHTML = '';
    currentSentenceElement.appendChild(fragment);
  }
});

    // Your code here...
})();

/*
```
*/