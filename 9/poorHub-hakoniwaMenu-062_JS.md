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

const showElem = (elem) => {
    elem.style.display = "block";
}

const hideElem = (elem) => {
    elem.style.display = "none";
}

const createMould = ({

    localName, body,
    backgroundColor,
    border,
    bottom,
    className,
    display,
    fontSize,
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
        case fontSize !== undefined:
            tag.style.fontSize = fontSize;
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

const arrSpliter = ( txtIn, strIn ) => {
    const arrOutput = txtIn.trim().split(strIn);
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

const concentRate = (arrIn) => {
    const trigramS = new Array();
    arrIn.forEach((trgrm) => {
        const hexagramS = new Array();
        trgrm.forEach((hxgrm) => {
            hexagramS.push([hxgrm[3], ["0", "1", "2", "3", "4", "5"]]);
        });
        hexagramS.pop();
        trigramS.push([trgrm[8][3], hexagramS]);
    });
    return trigramS;
}

const stuffMenu = ( arrIn, menuLv ) => {
    const jointer = createMould({
        localName : 'div',
        className : 'multiSelect',
        id : 'menu-' + menuLv,
    });
    if ( Array.isArray(arrIn) ) {
        arrIn.forEach((elem) => {
        const item = createMould({
            localName : 'div',
            fontSize : '24',
            textContent : elem[0],
        });
        item.addEventListener("click", () => {
            if ( menuLv < 2 ) {
                const nextMenu = stuffMenu(elem[1], menuLv + 1);
                const menuPrev = document.querySelector("div#menu-previous");
                const menuField = document.querySelector("div#menu-field");
                const lastMenu = menuField.lastChild;
                menuPrev.appendChild(lastMenu);
                menuField.appendChild(nextMenu);
            }
            
        });
        jointer.appendChild(item);
    });
    }
    
    return jointer;
}

const fetchCors = async ( url, targetElm ) => {
    const respons = await fetch(url);
    const docData = await respons.text();
    const parsedArr = resolveTxt(docData);
    const menuArr = concentRate(parsedArr);
    const menuField = document.querySelector("div#menu-field");
    const menu_0 = stuffMenu(menuArr, 0);
    menuField.appendChild(menu_0);
}

const preprocessPrecast = () => {
    const url = "https://66e.github.io/9/hexagram.md";
    fetchCors(url);
    
    const trggrFld = createMould({
        localName : "div", body : "body",
        id : "triggerField",
        position : "fixed",
        border : "1px dashed #ff00ff",
        bottom : "0px",
        right : "0px",
        width : "24px",
        height : "24px",
    });
    trggrFld.addEventListener("mouseover", () => {
        showElem(backButton);
        showElem(menuField);
    });

    const menuField = createMould({
        localName : "div", 
        className : 'selectWrapper',
        id : "menu-field",
        display : "none",
        position : "fixed",
        border : "1px dashed #ff00ff",
        bottom : "40px",
        right : "16px",
        width : "240px",
        height : "400px",
    });
    menuField.addEventListener("mouseleave", () => {
      hideElem(menuField);
    });

    const menuPrevious = createMould({
        localName : "div", 
        id : "menu-previous",
        display : "block",
        position : "fixed",
        border : "1px dashed #ff00ff",
        bottom : "40px",
        right : "256px",
        width : "240px",
        height : "400px",
    });

    const backButton = createMould({
        localName : "div", 
        id : "menu-button",
        display : "none",
        position : "fixed",
        border : "1px dashed #ff00ff",
        bottom : "16px",
        right : "40px",
        width : "200px",
        height : "24px",
    });
    backButton.addEventListener("click", () => {
        const menuPrev = document.querySelector("div#menu-previous");
        const lengthSuffice = menuPrev.childElementCount > 0;
        if ( lengthSuffice ) {
            const menuField = document.querySelector("div#menu-field");
            menuField.lastChild.remove();
            menuField.appendChild(menuPrev.lastChild);
        }
    });

    const flexDiv = createMould({ localName : 'div',
        className : 'flexDiv',id : 'id',});
    const sec_btn = createMould({ localName : 'button',
        className : 'sec_btn',id : 'id',});

    document.body.appendChild(flexDiv);
    flexDiv.appendChild(sec_btn);
    flexDiv.appendChild(menuField);

    trggrFld.appendChild(backButton);
    document.body.appendChild(menuPrevious);
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