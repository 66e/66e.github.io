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

const createMould = ({

    localName,
    backgroundColor,
    border,
    bottom,
    className,
    click,
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
    body,
    
}) => {
    const tag = document.createElement(localName);
    switch ( true ) {
        case className !== undefined:
            tag.className = className;
        case click !== undefined:
            tag.addEventListener(click || "click", () => {
                console.log(0);
            });
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
    } else {
        return tag;
    }
}

const preprocessPrecast = () => {
    createMould({
        localName : "div",
        id : "triggerField",
        position : "fixed",
        border : "1px dashed #ff00ff",
        bottom : "0px",
        right : "0px",
        width : "24px",
        height : "24px",
        body : "body",
    });
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