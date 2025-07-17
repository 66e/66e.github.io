/*
```js
*/

// ==UserScript==
// @name         referHub
// @namespace    Violentmonkey Scripts
// @match        *://*/*
// @grant       none
// @version      0.1.0
// @author       You
// @description  2025/6/30 13:45:42
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

const filterObj = ( obj ) => {
    const exeCuTable = /(_JS\.md|\.js)$/i;
    const result = obj.filter(( unit ) =>
        exeCuTable.test( unit.name ));
    return result;
}

const createSelect = ( obj ) => {
    const select = document.createElement("select");
    obj.forEach(( unit ) => {
        const option = document.createElement("option");
        option.textContent = unit.name;
        select.appendChild( option );
    });
    return select;
}

const fetchCors = async ( url ) => {
    const respons = await fetch(url);
    const docData = await respons.json();
    const jsObjS = filterObj ( docData );
    const optionSel = createSelect ( jsObjS );
    const el = document.querySelector("div#interFace");
    el.appendChild( optionSel );
}

const createTrigger = () => {
    const div = document.createElement("div");
    div.id = "triggeRH";
    div.addEventListener("click", () => {
        const trgrEntity = document.querySelector("nav.slide-menu");
        trgrEntity._slideMenu.toggle();
    });
    div.style = "border: 1px dashed rgb(255, 0, 255); bottom: 0px; height: 24px; position: fixed; right: 0px; width: 24px;";
    document.body.appendChild(div);
}

const visualizeInterface = () => {
    const input = document.createElement("input");
    input.addEventListener("dblclick", () => {
        input.value = '';
    });
    input.addEventListener("paste", () => {
        setTimeout(() => {
            const tag = appendRefer ( input.value );
            document.body.appendChild( tag );
        }, 1);
    });
    input.id = "input";
    input.size = 40;
    const docUrl = "https://66e.github.io/9/2025-06-08-y.md";
    input.value = docUrl;
    const div = document.createElement("div");
    div.id = "interFace";
    div.style.position = "fixed";
    div.style.bottom = "24px";
    div.style.right = "24px";
    div.appendChild( input );
    document.body.appendChild( div );
}

const preprocessPrecast = () => {
    const url = "https://66e.github.io/9/apiReposContents9_JSON.md";
    fetchCors ( url );
    createTrigger ();
    visualizeInterface ();
}

const adaptSituatS = ( container ) => {
    const uniqueLauncher = () => {
        const trgrEntity = document.querySelector("div#triggeRH");
        if ( !trgrEntity ) {
            preprocessPrecast ();
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

adaptSituatS ( document.body );

    // Your code here...
})();

/*
```
*/