// ==UserScript==
// @name         hexagraMenu
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.8.213
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// ==/UserScript==

(() => {
    'use strict';

const precastProcess = () => {
    const strUrl = 'https://6cc.github.io/r4/2024/hexagram.md';
    createTrigger();
    createNavBar();
    const ul_navMenu = document.querySelector('ul.nav-menu');
    getFileToFragment(strUrl, ul_navMenu);

    const menuCss = 'https://6cc.github.io/r4/2024/menu.css';
    appendRefer(menuCss);
}

const getFileToFragment = async (fileURL, targetElem) => {
    const response = await fetch(fileURL);
    const docData = await response.text();
    const menuSuit = decomposTxtConstrucMenu(docData);
    targetElem.appendChild(menuSuit);
}

const decomposTxtConstrucMenu = (docRaw) => {
    const paraSFromDoc = arrSpliter(docRaw, '>　　　　　　　　');
    const fragment = new DocumentFragment();
    const genericTermCharS = {};
    for (const element of paraSFromDoc) {
        const lineSFromPara = arrSpliter(element, '\n');
        const navButtonS = arrSpliter(lineSFromPara[0], '|');
        genericTermCharS[navButtonS[0]] = navButtonS[4];
    }

    for (let i = 1; i < paraSFromDoc.length; i++) {
        const lineSFromPara = arrSpliter(paraSFromDoc[i], '\n');
        const navButtonS = arrSpliter(lineSFromPara[0], '|');
        const navMenu = assembMenuUnit(navButtonS[3], navButtonS[1]);
        const ulTag = document.createElement('ul');
        navMenu.appendChild(ulTag);
        fragment.appendChild(navMenu);

        for (let j = 1; j < lineSFromPara.length; j++) {
            const strSFromline = arrSpliter(lineSFromPara[j], '|');
            const duoBinary = swapBinary(strSFromline[0]);
            const gTermSymb = genericTermCharS[duoBinary[0]];
            const gTermChar = genericTermCharS[duoBinary[1]];
            const gTermStr = strSFromline[3];
            const genericTerm = '　' + gTermSymb + gTermChar + gTermStr;
            const menuSub_1 = assembMenuUnit(strSFromline[1], genericTerm);
            ulTag.appendChild(menuSub_1);
            const ulSub_1 = document.createElement('ul');
            menuSub_1.appendChild(ulSub_1);

            for (let k = 6; k > 0; k--) {
                const menuSub_2 = assembMenuUnit(k);
                ulSub_1.appendChild(menuSub_2);
            }
        }
    }
    return fragment;
}

const arrSpliter = (textInput, charSpliter) => {
    const arrOutput = textInput.trim().split(charSpliter);
    return arrOutput;
}

const appendRefer = (urlFile) => {
    const fileExtension = urlFile.match(/\.[^/.]+$/);
    const referElem = createByExtens(urlFile, fileExtension[0]);
    const fileName = urlFile.match(/[^\/=\b]+(?=\.[^\/.]*$)/)[0];
    referElem.id = fileName.replace(/\./g,'_')
    + fileExtension[0].replace(/\./g,'_');
    document.documentElement.appendChild(referElem);
}

const createByExtens = (urlFile, fileExtens) => {
    switch (fileExtens) {
        case '.js':
            const scriptRefer = document.createElement('script');
            scriptRefer.src = urlFile;
            return scriptRefer;
            break;
        case '.css':
            const linkRefer = document.createElement('link');
            linkRefer.href = urlFile;
            linkRefer.setAttribute('rel', 'stylesheet');
            return linkRefer;
            break;
        default:
            console.log(fileExtens);
            break;
    }
}

const swapBinary = (str) => {
    const upperNew = [...str].slice(-3).join('');
    const lowerNew = [...str].slice(0, 3).join('');
    return [upperNew, lowerNew];
}

const assembMenuUnit = (symbol, characterS) => {
    const liTag = document.createElement('li');
    const aTag = document.createElement('a');
    const spanSymb = document.createElement('span');
    spanSymb.textContent = symbol;
    spanSymb.addEventListener('mouseover', () => {
        articuExpress(aTag.textContent);
    });
    const spanCharS = document.createElement('span');
    spanCharS.textContent = characterS;
    aTag.href = '#';
    aTag.appendChild(spanSymb);
    aTag.appendChild(spanCharS);
    liTag.appendChild(aTag);
    return liTag;
}

const createTrigger = () => {
    const triggerField = document.createElement('div');
    triggerField.id = 'triggerField';
    triggerField.style.position = 'fixed';
    triggerField.style.bottom = '0px';
    triggerField.style.right = '0px';
    triggerField.style.width = '40px';
    triggerField.style.height = '40px';
    triggerField.style.backgroundColor = '#333';
    document.body.appendChild(triggerField);
}

const createNavBar = () => {
    const navBar = document.createElement('ul');
    navBar.className = 'nav-menu';
    navBar.id = 'navBar';
    navBar.style.position = 'fixed';
    navBar.style.bottom = '40px';
    navBar.style.right = '0px';
    navBar.style.width = '50%';
    navBar.style.height = '40px';
    navBar.style.backgroundColor = '#555';
    navBar.style.display = 'none';

    const triggerField = document.querySelector('div#triggerField');
    document.body.insertBefore(navBar, triggerField);

    triggerField.addEventListener('mouseover', () => {
        navBar.style.display = 'block';
    });

    navBar.addEventListener('mouseleave', () => {
        navBar.style.display = 'none';
    });
}

const articuExpress = (text, vol) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.volume = vol || 1;
    window.speechSynthesis.speak(msg);
}

precastProcess();

    // Your code here...
})();