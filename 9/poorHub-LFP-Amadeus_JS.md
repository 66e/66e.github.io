/*
```js
*/

// ==UserScript==
// @name        loFaP_0716
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       none
// @version     0.7.0
// @author      -
// @description 2025/7/1 14:06:06
// ==/UserScript==

(() => {
    'use strict';

const uniqueLauncher = () => {
    const triggerExist = document.querySelector('div#triggerField');
    triggerExist === null ? preprocessPrecast() :
    console.log('already entity');
}

const appendRefer = ( urlFile ) => {
    const fileExtension = urlFile.match(/\.[^/.]+$/);
    const referElem = createByExtens(urlFile, fileExtension[0]);
    const fileName = urlFile.match(/[^\/=\b]+(?=\.[^\/.]*$)/)[0];
    referElem.id = fileName.replace(/\./g,'_')
    + fileExtension[0].replace(/\./g,'_');
    return referElem;
}

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

const initMenu = ( targetElem ) => {
    const menu = new SlideMenu(targetElem, {
        keyClose: 'Escape',
        submenuLinkAfter: '<span style="margin-left: 1em; font-size: 85%;">📁</span>',
        backLinkBefore: '<span style="margin-right: 1em; font-size: 85%;">◀返回</span>',
    });
    targetElem.style.right = "24px";
    menu.open();
}

const rO_SlideMenu = {
    exist: typeof SlideMenu,
    schedule: "function",
    referS: [
        "https://grubersjoe.github.io/slide-menu/slide-menu.js",
        "https://grubersjoe.github.io/slide-menu/slide-menu.css",
        "https://grubersjoe.github.io/slide-menu/demo.css",
    ],
    method: ( elem ) => {
        initMenu ( elem );
    },
};

const rO_imagesLoaded = {
    exist: typeof imagesLoaded,
    schedule: "function",
    referS: [
        "https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js",
    ],
    method: ( elem ) => {
        ilProgress ( elem );
    },
};

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

const rO_jspanel = {
    exist: typeof jsPanel,
    schedule: "object",
    referS: [
        "https://jspanel.de/jspanel/dist/jspanel.min.css",
        "https://jspanel.de/jspanel/dist/jspanel.min.js",
    ],
    method: ( elem, param ) => {
        createWindow ( elem, param );
    },
};

const rO_retrieveMsn = {
    exist: typeof retrieveMsn,
    schedule: "function",
    referS: [
        "https://66e.github.io/j/msn_JS.md",
    ],
    method: ( elem ) => {
        const arrMsn = retrieveMsn ();
        generateUnit ( arrMsn );
    },
};

const rO = new Object();
rO.fancybox = new Object();
rO.fancybox.exist = typeof Fancybox;
rO.fancybox.schedule = "function";
rO.fancybox.referS = [
    "https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.umd.min.js",
];
rO.fancybox.method = () => console.log(typeof Fancybox);

const secuReFerShell = ({ referObj, targetElem, param }) => {
    if ( referObj.exist === referObj.schedule ) {
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

const generateUnit = ( arrIn ) => {
    const trgtContainer = document.querySelector("div#containErNT");
    const unit = processElem ( arrIn );
    secuReFerShell ({
        referObj: rO_imagesLoaded, 
        targetElem: unit,
    });
    if (trgtContainer) {
        trgtContainer.appendChild(unit);
    } else {
        geNEWin(unit);
    }
}

const geNEWin = ( elem ) => {
    secuReFerShell ({
        referObj : rO_jspanel,
        targetElem : elem,
    });
    secuReFerShell ({
        referObj: rO_imagesLoaded,
        targetElem: elem,
    });
    secuReFerShell ({ referObj: rO.fancybox, });
}

const txtGenAlbum = ( txt ) => {
    const urlSArr = extractUrls( txt );
    generateUnit( urlSArr );
}

const arrSpliter = ( txtIn, SpliTeR, param ) => {
    const arrFromTxt = txtIn.trim().split(SpliTeR);
    if ( param === "clean" ) {
        const htmlScrap_class = /.<* *.class *= *.['"]obCompat['"] *.>*/i;
        const hS_imgSrc = /<* *.img *.src *= *["']/i;
        const hS_heightWidth = /['"] *.(height|width) *= *.['"]*\w*.['"] *\/?>*/i;
        const purifiedArr = arrFromTxt.filter(( line ) =>
        line.trim() !== "" && ! htmlScrap_class.test( line )
        && ! hS_imgSrc.test( line )
        && ! hS_heightWidth.test( line ));
        return purifiedArr;
    }
    return arrFromTxt;
}

const seqGen = ( url ) => {
    const fileNameReg = /[^\/=\b]+(?=\.[^\/.]*$)/i;
    const fileName = url.match(fileNameReg)[0];
    const fileInt = parseInt( fileName );
    const urlFrame = url.split( fileNameReg );
    const arrayEmpty = new Array();
    for (let i = 0; i < fileInt; i++) {
        arrayEmpty.push( urlFrame[0] + i + urlFrame[1] );
    }
    return arrayEmpty;
}

const resolveTxt = ( txtIn ) => {
    const paras = arrSpliter( txtIn, ">　　　　　　　　");
    const div = document.createElement("div");
    div.className = "containErNT";
    const objS = [];
    paras.forEach(( elem ) => {
        const lines = arrSpliter( elem, "\n", "clean" );
        const innerObj = [];
        const innerDiv = document.createElement("div");
        innerDiv.className = "unitCard";
        lines.forEach(( el, iterator ) => {
            const identify = parseURL( el );
            if ( identify === "img" && 
            parseURL( lines[ iterator - 1] ) === "pRompt6Exe" ) {
                const arrSeq = seqGen ( el );
                const unitS_Seq = processElem ( arrSeq );
                innerDiv.appendChild( unitS_Seq );
            } else {
                const iter = filterString( el );
                innerObj.push( identify );
                innerDiv.appendChild( iter );
            }
        });
        div.appendChild( innerDiv );
        objS.push( innerObj );
    });
    return [ div, objS ];
}

const fetchCors = async ( url, targetElm ) => {
    const respons = await fetch( url );
    const docData = await respons.text();
    targetElm.value = docData;
    const hybirdUnit = resolveTxt ( docData );
    geNEWin( hybirdUnit[0] );
}

const extractUrls = ( input ) => {
    // Search the input text for URLs (the regular expression pattern is taken from the excellent
    // "Regular Expressions Cookbook" by Jan Goyvaerts and Steven Levithan)
    const match = input.match(/\b((https?|ftp|file):\/\/|(www|ftp)\.)[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/ig);

    // Output the found URLs
    return match ? match : "No URLs found";
}

const filterString = ( strIn ) => {
    const currentStr = parseURL( strIn );
    switch ( currentStr ) {
        case "a":
            const aTag = document.createElement("a");
            aTag.textContent = strIn;
            return aTag;
            break;
        case "img":
            const liImg = createIlLi ( strIn );
            return liImg;
        case "p":
            const pTag = document.createElement("p");
            pTag.textContent = strIn;
            return pTag;
            break;
        case "pRompt6Exe":
            const div = document.createElement("div");
            div.textContent = strIn;
            return div;
            break;
        default:
        console.log("default");
    }
}

const parseURL = ( $string, param ) => {
    const __urlR = "((https?|ftp|file):\/\/|(www|ftp)\.)[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]";
    const __imgR = "\.(?:img|jpe?g|gif|png)";
    const urlRegex = new RegExp(__urlR, "i");
    const imgRegex = new RegExp(__imgR, "i");
    const imgWURegex = new RegExp(__urlR + __imgR, "i");
    const pRompt6Exe = /^\#6\/p\/\w+/i;
    const strIsUrl = urlRegex.test($string);
    if ( strIsUrl ) {
        switch ( true ) {
            case imgRegex.test($string):
                if ( param ) {
                    const trimmed = $string.match(imgWURegex)[0];
                    return trimmed;
                }
                return "img";
                break;

            default:
                return "a";
        }
    } else if (pRompt6Exe.test($string)) {
        return "pRompt6Exe";
    } else {
        return "p";
    }
}

const visualizeComponentS = () => {
    const input = document.createElement("input");
        input.addEventListener("dblclick", () => {
            input.value = '';
        });
        input.addEventListener("paste", (e) => {
            setTimeout(() => {
                fetchCors( e.target.value, textarea );
            }, 1);
        });
        input.id = "input";
        input.size = 40;
        const docUrl = "https://66e.github.io/9/2025-06-08-y.md";
        input.value = docUrl;
        const btnRtrv = document.createElement("button");
        btnRtrv.addEventListener("click", () => {
            fetchCors( input.value, textarea );
        });
        btnRtrv.id = "btnRtrv";
        btnRtrv.textContent = "retrieve";
        const checkbox = document.createElement("input");
        checkbox.textContent = "checkbox";
        checkbox.id = "checkbox";
        checkbox.type = "checkbox";
        const textarea = document.createElement("textarea");
        textarea.addEventListener("dblclick", () => {
            textarea.value = "";
        });
        textarea.addEventListener("paste", () => {
            setTimeout(() => {
                txtGenAlbum ( textarea.value );
            }, 1);
        });
        textarea.id = "textarea";
        textarea.cols = "50";
        textarea.rows = "10";
        textarea.style.overflow = "auto";
        const btnRslv = document.createElement("button");
        btnRslv.addEventListener("click", () => {
            txtGenAlbum ( textarea.value );
        });
        btnRslv.id = "btnRslv";
        btnRslv.textContent = "resolve";
        const btnMsn = document.createElement("button");
        btnMsn.addEventListener("click", () => {
            secuReFerShell ({
                referObj : rO_retrieveMsn,
            });
        });
        btnMsn.id = "btnMsn";
        btnMsn.textContent = "Msn";
        const div = document.createElement("div");
        div.id = "dashboard";
        div.appendChild(input);
        div.appendChild(btnRtrv);
        div.appendChild(checkbox);
        div.appendChild(textarea);
        div.appendChild(btnRslv);
        div.appendChild(btnMsn);
    return div;
}

const relaySwitch = ( param ) => {
    switch ( param ) {
        case undefined:
            return "div.containErNT";
            break;
        case "menu":
            return "nav.slide-menu";
            break;
    }
}

const createIlLi = ( url, param ) => {
    const urlTrimmed = parseURL ( url, "trim" );
    const li = document.createElement("li");
    li.className = "iLAttached";
    li.style.backgroundColor = "#000";
    li.style.backgroundImage = "url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/loading.gif')";
    li.style.backgroundPosition = "center center";
    li.style.backgroundRepeat = "no-repeat";
    li.style.borderRadius = "4px";
    li.style.display = "block";
    li.style.float = "left";
    li.style.height = "70px";
    li.style.margin = "2px 2px 2px 2px";

    const img = new Image();
    img.src = urlTrimmed;
    img.className = "fBAttached";
    img.style.borderRadius = "4px";
    img.style.opacity = 0;
    img.style.maxHeight = "70px";
    img.style.minWidth = "25px";
    img.style.transition = "opacity 0.4s";
    const qSExp = relaySwitch ( param );
    img.addEventListener("click", ( e ) => {
        const eventTarget = e.currentTarget;
        const trgtContainer = eventTarget.parentNode.parentNode.parentNode.parentNode;
        const arrImgS = trgtContainer.querySelectorAll("li.iLAttached > img.fBAttached");
        const arrForFB = new Array();
        arrImgS.forEach(( elemImg ) => {
            arrForFB.push({ src: elemImg.src });
        });
        const galIdx = [].indexOf.call( arrImgS, eventTarget );
        new Fancybox(
            // Array containing gallery items
            arrForFB,
            // Gallery options
            {
                startIndex: galIdx,
            }
        );
    });

    li.appendChild(img);
    return li;
}

const ilProgress = ( elem ) => {
    const imgLoad = imagesLoaded( elem );
imgLoad.on( 'always', ( instance ) => {
  console.log( imgLoad.images.length + ' in total' );
});
imgLoad.on( 'done', ( instance ) => {
  console.log('DONE  - all success');
});
imgLoad.on( 'fail', ( instance ) => {
  console.log('FAIL - loaded, one mORe broken');
});
imgLoad.on( 'progress', ( instance, image ) => {
    if ( image.isLoaded ) {
        image.img.style.opacity = 1;
    } else {
        image.img.parentNode.style.backgroundColor = "#DCDCDC";
        image.img.parentNode.style.backgroundImage = "url('https://fastly.jsdelivr.net/gh/microsoft/fluentui-system-icons/assets/Image%20Prohibited/SVG/ic_fluent_image_prohibited_24_filled.svg')";
    }
    const result = image.isLoaded ? 'loaded' : 'broken';
    console.log('[' + result + '] ' + image.img.src);
});

}

const processElem = ( urlS ) => {
    const objS = new Array();
    const div = document.createElement("div");

urlS.forEach(( url ) => {
    objS.push({ src: url });
    const liImg = createIlLi ( url );
    div.appendChild(liImg);
});

div.className = "cntInner";
return div;
}

const insertRuleAfter = () => {
    const style = document.createElement("style");
    style.id = 'dynaContainer';
    document.head.appendChild(style);
    const sheet = style.sheet;
    sheet.insertRule('.unitCard::after { clear: both; content: ""; display: block; }', 0);
}

const moduloCeil = ( integerIn, divide ) => {
    const float = integerIn / divide;
    const intCeil = Math.ceil( float );
    return intCeil;
}

const fillUnit = ( volNum, iIn ) => {
    const table = document.createElement("table");
    const td_1 = document.createElement("td");
    const td_2 = document.createElement("td");
    const td_3 = document.createElement("td");
    const td_4 = document.createElement("td");
    table.appendChild( td_1 );
    table.appendChild( td_2 );
    table.appendChild( td_3 );
    table.appendChild( td_4 );
    const iteratorEqual = iIn * 2 - 1;
    const subMenu_L2 = fillSubMenu ( iteratorEqual );
    const vol = volNum.toString();
    const volPadS = vol.padStart(2, "0");
    const url = "https://6cc.github.io/c/m/y/" + volPadS + "/" + iteratorEqual + ".jpg";
    const liImg = createIlLi ( url, "menu" );
    const url_2 = "https://6cc.github.io/c/m/y/" + volPadS + "/" + iIn * 2 + ".jpg";
    const liImg_2 = createIlLi ( url_2, "menu" );
    const num_2 = document.createTextNode( iIn * 2 );
    td_1.appendChild( subMenu_L2 );
    td_2.appendChild( liImg );
    td_3.appendChild( liImg_2 );
    td_4.appendChild( num_2 );
    return table;
}

const fillSubMenu = ( volNum, param, pageSLength ) => {
    const li = document.createElement( "li" );
    const aTag = document.createElement( "a" );
    aTag.textContent = volNum;
    li.appendChild( aTag );
    if ( param === "recur" ) {
        const ul = document.createElement("ul");
        const section = moduloCeil ( pageSLength, 2 );
        for (let i = 1; i <= section; i++) {
            const unit = fillUnit ( volNum, i );
            ul.appendChild( unit );
        }
        secuReFerShell ({
            referObj: rO_imagesLoaded, 
            targetElem: ul,
        });
        li.appendChild( ul );
    }
    return li;
}

const fillCluster = ( arr ) => {
    const ul = document.createElement( "ul" );
    arr.forEach(( elem, iterator ) => {
        const subset = fillSubMenu ( iterator + 1, "recur", elem );
        ul.appendChild( subset );
    });
    return ul;
}

const visualizMenu = () => {
    const containerNav = document.createElement("nav");
    containerNav.style.display = "none";
    containerNav.className = "slide-menu";
    const volPageS = [
        102,  98,  96,  96, 104, 104, 101,  95,  96, 104,
         95,  95,  94, 103, 103, 103, 103,  94,  97, 
    ];
    const menuUnit = fillCluster ( volPageS );
    containerNav.appendChild( menuUnit );
    secuReFerShell ({
        referObj: rO_SlideMenu, 
        targetElem: containerNav,
    });
    secuReFerShell ({ referObj: rO.fancybox, });
    containerNav.style.bottom = "24px";
    containerNav.style.height = "95%";
    document.body.appendChild( containerNav );
}

const preprocessPrecast = () => {
    const trigger = createTrigger();
    const bar = createBar();
    trigger.addEventListener('mouseover', () => {
        bar.style.display = 'block';
    });
    trigger.appendChild(bar);
    const button = document.createElement('button');
    button.textContent = 'x';
    button.style.width = '16px';
    button.style.height = '16px';
    button.addEventListener('mouseup', () => {
        trigger.remove();
    });
    bar.appendChild(button);
    document.body.appendChild(trigger);
    visualizMenu ();
    insertRuleAfter ();
}

const createTrigger = () => {
    const triggerField = document.createElement('div');
    triggerField.style.position = 'fixed';
    triggerField.style.zIndex = 801;
    triggerField.id = 'triggerField';
    triggerField.style.bottom = '0px';
    triggerField.style.right = '0px';
    triggerField.style.width = '16px';
    triggerField.style.height = '16px';
    triggerField.style.backgroundColor = '#ccc';
    triggerField.addEventListener('contextmenu', () => {
		console.log('contextmenu');
    });
    return triggerField;
}

const createBar = () => {
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.bottom = '16px';
    div.style.right = '0px';
    div.style.width = '16px';
    div.style.backgroundColor = '#ccc';
    div.style.display = 'none';
    div.addEventListener('mouseleave', () => {
        div.style.display = 'none';
    });
    return div;
}

const createCheckbox = () => {
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.style.margin = '0';
    return check;
}

if (document.body) {
    uniqueLauncher();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        uniqueLauncher();
    });
}

const domainReStrict = ( dest ) => {
    const ghPage = /\bhttps?:\/\/\S+\.github\.io/i;
    const jsitor = /\bhttps?:\/\/jsitor\.com/i;
    const msnCn = /\bhttps?:\/\/www\.msn\.cn\/zh-cn\/\w+\/\w+\/[%-\w]+\/[-\w]+/i;
    switch ( true ) {
        case ghPage.test(dest):
            return "ghPage";
            break;
        case jsitor.test(dest):
            return "jsitor";
            break;
        case msnCn.test(dest):
            return "msnCn";
            break;
        default:
            console.log("default");
    }
}

const msnBehaviour = ( mutateObserv ) => {
    const observer = new MutationObserver((mutationsList, observer) => {
    const cpArticleElement = document.querySelector( mutateObserv );
    if (cpArticleElement) {
        secuReFerShell ({ referObj : rO_retrieveMsn });
        observer.disconnect();
    }
});

// 配置观察器：监视子节点的变化和所有后代的变化
const config = { childList: true, subtree: true };

// 开始观察整个文档或特定的父元素
// 如果你知道cp-article会出现在哪个父元素下，观察该父元素会更高效
observer.observe(document.body, config);
}

const reStrict = domainReStrict ( document.URL );
switch ( reStrict ) {
    case "ghPage" :
    case "jsitor" :
        const unit = visualizeComponentS ();
        secuReFerShell ({
            referObj : rO_jspanel,
            targetElem : unit,
            param : "dashBoard",
        });
        break;
    case "msnCn" :
        msnBehaviour ( "cp-article" );
        break;
    default:
        console.log("default");
}

    // Your code here...
})();

/*
```
*/