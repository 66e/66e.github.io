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
    const ooWin = new Object();
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
    oM.jsPanel.scheduled = "Object";
    oM.jsPanel.referS = [
        "https://jspanel.de/jspanel/dist/jspanel.min.css",
        "https://jspanel.de/jspanel/dist/jspanel.min.js",
    ];
    oM.jsPanel.method = ( elem, param ) => {
        createWindow ( elem, param );
    };
    return oM.branch;
}

const initializeVoiceSC = () => {
    const synth = window.speechSynthesis;
    synth.addEventListener("voiceschanged", () => {
        const voices = synth.getVoices();
        const select = document.createElement("select");
        document.body.appendChild( select );
        for (const voice of voices) {
            const option = document.createElement("option");
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute("data-lang", voice.lang);
            option.setAttribute("data-name", voice.name);
            select.appendChild(option);
        }
    });

}

const processWorkflow = () => {
    initializeVoiceSC ();
}

processWorkflow ();

    // Your code here...
})();

/*
```
*/