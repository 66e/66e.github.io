/*
```js
*/

// ==UserScript==
// @name        New script 
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       none
// @version     1.0
// @author      -
// @description 2025/6/30 13:45:42
// ==/UserScript==

(() => {
    'use strict';

const createByExtens = ( urlFile, fileExtens ) => {
    switch (fileExtens) {
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

const appendRefer = ( urlFile ) => {
    const fileExtension = urlFile.match(/\.[^/.]+$/);
    const referElem = createByExtens(urlFile, fileExtension[0]);
    const fileName = urlFile.match(/[^\/=\b]+(?=\.[^\/.]*$)/)[0];
    referElem.id = fileName.replace(/\./g,'_')
    + fileExtension[0].replace(/\./g,'_');
    return referElem;
}

const createInput = () => {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.bottom = "24px";
    div.style.right = "24px";
    const input = document.createElement("input");

        input.addEventListener("dblclick", () => {
            input.value = '';
        });
        input.addEventListener("paste", (e) => {
            setTimeout(() => {
                const tag = appendRefer ( input.value );
                tag.addEventListener("load", () => {
                    console.log( input.value );
                });
                document.body.appendChild( tag );
            }, 1);
        });
        input.id = "input";
        input.size = 40;
        const docUrl = "https://66e.github.io/9/poorHub-LFP-Amadeus_JS.md";
        input.value = docUrl;
    div.appendChild( input );
    document.body.appendChild( div );
}

const createTrigger = () => {
    const div = document.createElement("div");
    div.id = "triggerField";
    div.addEventListener("click", () => {
        const trgrEntity = document.querySelector("nav.slide-menu");
        trgrEntity._slideMenu.toggle();
    });
    div.style = "border: 1px dashed rgb(255, 0, 255); bottom: 0px; height: 24px; position: fixed; right: 0px; width: 24px;";
    document.body.appendChild(div);
}

const preprocessPrecast = () => {
    createTrigger ();
    createInput ();
}

const adaptSituatS = ( container ) => {
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

adaptSituatS( document.body );

    // Your code here...
})();

/*
```
*/