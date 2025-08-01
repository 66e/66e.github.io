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
        artiCULate ( textarea.value );
    });
    button.textContent = "button";

    const newWin = document.createElement("button");
    newWin.addEventListener("click", () => {
        const array = parsePassage ( textarea.value );
        const unit = visualizeCluster ( array );
        artiCULate ( array );
        toggleMount ( unit );
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

const synthGetVoices = () => {
    const voices = speechSynthesis.getVoices();
    return voices;
}

const artiCULate = ( arrSchedule, voxIdx, vol ) => {
    const utterance = new SpeechSynthesisUtterance();
    const voices = synthGetVoices ( );
    const voiceSelect = document.querySelector("select#voiceSSel");
    utterance.voice = voices[ voxIdx || voiceSelect.value ];
    const utter = ( currentIndex ) => {
        utterance.text = arrSchedule [ currentIndex ] || arrSchedule;
        speechSynthesis.speak( utterance );
    }

    switch ( true ) {
        case typeof arrSchedule === "string" :
            utter ();
            break;
        case Array.isArray( arrSchedule ) :
            let currentIndex = 0;
            utterance.addEventListener("end", () => {
                currentIndex++
                if ( currentIndex < arrSchedule.length ) {
                    recurUtter ();
                }
            });

            const recurUtter = ( ) => {
                utter ( currentIndex );
            }

            recurUtter ( );
            break;
    }
}

const processWorkflow = () => {
    const jsPanel = matrixRetrieve ( "jsPanel" );
    const componentS = visualizeComponentS ();
    secuReFerShell ( jsPanel, componentS, "dashBoard" );
    secuReFerShell ( jsPanel, 0, "outLet" );
    const targetElem = componentS.querySelector("select#voiceSSel"); // asynchronous processing
    initializeVoiceSC ( targetElem );
}

processWorkflow ();

    // Your code here...
})();

/*
```
*/