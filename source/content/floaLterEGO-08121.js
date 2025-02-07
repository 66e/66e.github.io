// ==UserScript==
// @name         floaLterEGO-0.8121
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.8.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// ==/UserScript==

(function() {
    'use strict';

// Launch CORE feature whatever DOMContentLoaded or not.
const uniqueLauncher = () => {
    const triggerExist = document.querySelector('div#triggerField');
    triggerExist === null ? console.log('trigger not exist') : console.log(
        'already entity');
};

if (document.body) {
    uniqueLauncher();
    console.log('body exist');
} else {
    document.addEventListener("DOMContentLoaded", () => {
        uniqueLauncher();
    });
    console.log('DOMContentLoaded');
}

const matchHref = () => {
    const msnCn = /\bhttps?:\/\/www\.msn\.cn\/zh-cn\/\w+\/\w+\/[%-\w]+\/[-\w]+/i;
    switch (true) {
        case msnCn.test(window.location.href):
        return 'msnCn';
        default:
        return '';
    }
};

const titleUrlSelecTime = (elemContent) => {
    const resultCombine = `
>　　　　　　　　6//?r=⭐　&d=${new Date().toLocaleString()}　&b=${(Date.now()).toString(36)}
## ${document.title}
${window.location.href}

${window.getSelection().toString()}
${elemContent}
`;
    return resultCombine;
};

const articuExpress = (text, vol) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.volume = vol || 1;
    window.speechSynthesis.speak(msg);
}

let hoverElem = '';
let elementContent = '';
let cpImageSource = '';

document.addEventListener('mouseover', (event) => {
    hoverElem = event.target;
    elementContent = hoverElem.innerText || hoverElem.href
    || hoverElem.src || hoverElem.value;

    if ( matchHref() === 'msnCn') {
        cpImageSource = 'msnCn';
    }
});

document.addEventListener('keydown', (event) => {
    switch (event.altKey && event.key) {
        case '[':
        console.log(NaN);
        break;
        case ']':
        console.log(null);
        break;
        case '\\':
        console.log(NaN);
        break;
        case ';':
        console.log(undefined);
        break;
        case "'":
        elemSAsHoveredRoute();
        break;
        case ',':
        if ( matchHref() === 'msnCn') {
            elementContent = cpImageSource;
        }
        const currentOur = new Date().getHours();
        const decentVol = currentOur > 10 ? NaN : .2;
        navigator.clipboard.writeText(titleUrlSelecTime (elementContent));
        articuExpress(document.title.slice(0, 10) + '共' + 0 + '张屠', decentVol);
        break;
        case '.':
        console.log(NaN);
        break;
        case '/':
        const msnImgS = new articleMsn().retrieveMsn();
        let msnTxt = '';
        for (const element of msnImgS) {
            msnTxt += element + '\n';
        }
        navigator.clipboard.writeText(msnTxt);
        break;
        case '0':
        stackWindow('fiddle', 400, 500, 640, 480);
        break;
        case '1':
        stackWindow('#' + event.key + ' charCodeAt:'
         + event.key.charCodeAt(), 40, 40, 200, 250);
        break;
        case '2':
        stackWindow('#' + event.key + ' charCodeAt:'
         + event.key.charCodeAt(), 400, 400, 200, 250);
        break;
        case '3':
        stackWindow('floatTree', 200, 200, 320, 240);
        createTree('treeContainer');
        break;
        case '4':
        stackWindow('', 40, 200, 640, 480);
        break;
    }
});

    // Your code here...
})();