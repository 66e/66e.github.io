/*
```js
*/

// ==UserScript==
// @name        utTeRAnCE_0729
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
    const oWin = new Object();
    oWin.callback = (panel) => panel.content.appendChild( elem );
    oWin.opacity = .9;
    oWin.theme = "primary";

    switch ( param ) {
        case undefined:
            oWin.contentSize = "400 250";
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
}

const matrixRetrieve = ( branch ) => {
    const oM = new Object();
    oM.jsPanel = new Object();
    oM.jsPanel.existing = typeof jsPanel;
    oM.jsPanel.scheduled = "object";
    oM.jsPanel.referS = [
        "https://jspanel.de/jspanel/dist/jspanel.min.css",
        "https://jspanel.de/jspanel/dist/jspanel.min.js",
    ];
    oM.jsPanel.method = ( elem, param ) => {
        createWindow ( elem, param );
    };
    return oM[branch];
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
    if ( referObj.exist === referObj.scheduled ) {
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

const initializeVoiceSC = () => {
    const synth = window.speechSynthesis;
    const mLingual_r = /Multilingual /i;
    const rLang = /zh-/i;
    synth.addEventListener("voiceschanged", () => {
        const voices = synth.getVoices();
        const voices_mL = voices.filter(( voice ) => mLingual_r.test(voice.name)
        || rLang.test(voice.lang));
        const select = document.createElement("select");
        document.body.appendChild( select );
        for (const voice of voices_mL) {
            const option = document.createElement("option");
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute("data-lang", voice.lang);
            option.setAttribute("data-name", voice.name);
            select.appendChild(option);
        }
        const container = document.querySelector("div#container");
        container.appendChild( select );
    });
}

const processWorkflow = () => {
    const jsPanel = matrixRetrieve ( "jsPanel" );
    const container = document.createElement("div");
    container.id = "container";
    secuReFerShell ( jsPanel, container, "dashBoard" );
    initializeVoiceSC ();
}

processWorkflow ();

    // Your code here...
})();

/*
```
*/