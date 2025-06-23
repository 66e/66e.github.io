/*
```js
*/

// ==UserScript==
// @name         adaptSituatS_011
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// ==/UserScript==

(() => {
    'use strict';

const emergeElem = (elem) => {
    elem.style.display = "block";
}

const hideElem = (elem) => {
    elem.style.display = "none";
}

const createMould = ({

    localName, body,
    addEventListener,
    backgroundColor,
    border,
    bottom,
    className,
    display,
    height,
    href,
    id,
    left,
    position,
    right,
    src,
    textContent,
    top,
    width,
    
}) => {
    const tag = document.createElement(localName);
    switch ( true ) {
        case className !== undefined:
            tag.className = className;
        case href !== undefined:
            tag.href = href;
        case id !== undefined:
            tag.id = id;
        case textContent !== undefined:
            tag.textContent = textContent;
        case src !== undefined:
            tag.src = src;
        case backgroundColor !== undefined:
            tag.style.backgroundColor = backgroundColor;
        case border !== undefined:
            tag.style.border = border;
        case bottom !== undefined:
            tag.style.bottom = bottom;
        case display !== undefined:
            tag.style.display = display;
        case height !== undefined:
            tag.style.height = height;
        case left !== undefined:
            tag.style.left = left;
        case position !== undefined:
            tag.style.position = position;
        case right !== undefined:
            tag.style.right = right;
        case top !== undefined:
            tag.style.top = top;
        case width !== undefined:
            tag.style.width = width;
    }
    if ( body ) {
        document.body.appendChild(tag);
    }
        return tag;
}

const arrSpliter = ( txtIn, chrSplt ) => {
    const arrOutput = txtIn.trim().split(chrSplt);
    return arrOutput;
}

const resolveTxt = (txtIn) => {
    const paraS_a = arrSpliter(txtIn, ">　　　　　　　　");
    const nArrParaS = new Array();
    paraS_a.forEach((para) => {
        const arrLines = arrSpliter(para, "\n");
        const nArrStrS = new Array();
        arrLines.forEach((line) => {
            const aStrS = arrSpliter(line, "|");
            nArrStrS.push(aStrS);
        });
        nArrParaS.push(nArrStrS);
    });
    return nArrParaS;
}

const fetchCors = async ( url, targetElm ) => {
    const respons = await fetch(url);
    const docData = await respons.text();
    const parsed = resolveTxt(docData);
    console.log(parsed);
}

const preprocessPrecast = () => {
    const url = "https://6cc.github.io/r4/2024/hexagram.md";
    fetchCors(url);

    const trggrFld = createMould({
        localName : "div", body : "body",
        addEventListener : "mouseover",
        id : "triggerField",
        position : "fixed",
        border : "1px dashed #ff00ff",
        bottom : "0px",
        right : "0px",
        width : "24px",
        height : "24px",
    });
    trggrFld.addEventListener("mouseover", () => {
        emergeElem(menuButt);
    });

    const menuField = createMould({
        localName : "div", 
        addEventListener : "click",
        className : "nav-field",
        id : "menu-field",
        display : "none",
        position : "fixed",
        border : "1px dashed #ff00ff",
        bottom : "24px",
        right : "24px",
        width : "240px",
        height : "400px",
    });
    menuField.addEventListener("mouseleave", () => {
      emergeElem(menuField);
    });

    const menuButt = createMould({
        localName : "div", 
        addEventListener : "mouseover",
        className : "nav-button",
        id : "menu-button",
        display : "none",
        position : "fixed",
        border : "1px dashed #ff00ff",
        bottom : "24px",
        right : "24px",
        width : "240px",
        height : "24px",
    });
    menuButt.addEventListener("mouseover", () => {
        emergeElem(menuField);
    });
    menuButt.addEventListener("mouseleave", () => {
        hideElem(menuButt);
    });
    menuButt.appendChild(menuField);
    trggrFld.appendChild(menuButt);

    const item = [];
    for (let i = 0; i < 16; i++) {
      item[i] = createMould({
        localName : "div",
        textContent : "textContent " + i,
      });
    menuField.appendChild(item[i]);
    }
}

const adaptSituatS = (container) => {
    const uniqueLauncher = () => {
        const trgrEntity = document.querySelector("div#triggerField");
        if ( !trgrEntity ) {
            preprocessPrecast();
        } else {
            console.log("already entity");
        }
    }

    if ( container ) {
        uniqueLauncher();
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            uniqueLauncher();
        });
    }
}

adaptSituatS(document.body);

    // Your code here...
})();

/*
```
*/