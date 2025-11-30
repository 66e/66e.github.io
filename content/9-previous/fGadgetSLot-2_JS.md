/*
```js
*/

// ==UserScript==
// @name         loFap
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.4.6
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// ==/UserScript==

(() => {
    'use strict';

const uniqueLauncher = () => {
    const triggerExist = document.querySelector('div#triggerField');
    triggerExist === null ? preprocessPrecast() :
    console.log('already entity');
}

const appendRefer = (urlFile) => {
    const fileExtension = urlFile.match(/\.[^/.]+$/);
    const referElem = createByExtens(urlFile, fileExtension[0]);
    const fileName = urlFile.match(/[^\/=\b]+(?=\.[^\/.]*$)/)[0];
    referElem.id = fileName.replace(/\./g,'_')
    + fileExtension[0].replace(/\./g,'_');
    return referElem;
}

const createByExtens = (urlFile, fileExtens) => {
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

const generateUnit = (arrIn) => {
    const trgtContainer = document.querySelector("div#containErNT");
    const unit = loadFan(arrIn);
    if (trgtContainer) {
        trgtContainer.appendChild(unit);
    } else {
        geNEWin(unit);
    }
}

const geNEWin = (elem) => {
    const div = document.createElement("div");
    div.id = "containErNT";
    div.appendChild(elem);

    jsPanel.create({
        callback: (panel) => {
            panel.content.appendChild(div);
        },
        theme: 'primary',
    });
}

const genGFormT = (txt) => {
    const urlSArr = extractUrls(txt);
    generateUnit(urlSArr);
}

const fetchCors = async (url, targetElm) => {
    const respons = await fetch(url);
    const docData = await respons.text();
    targetElm.value = docData;
    genGFormT(docData);
}

const extractUrls = ( input ) => {
    // Search the input text for URLs (the regular expression pattern is taken from the excellent
    // "Regular Expressions Cookbook" by Jan Goyvaerts and Steven Levithan)
    const match = input.match(/\b((https?|ftp|file):\/\/|(www|ftp)\.)[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/ig);

    // Output the found URLs
    return match ? match : "No URLs found";
}

const loadFan = (arrIn) => {
    const unit = processElem(arrIn);
    return unit;
}

const arrSpliter = (txtInpt, chrSplt) => {
    const arrOutput = txtInpt.trim().split(chrSplt);
    return arrOutput;
}

const jspanel_OL = () => {
    const visualizeComponentS = () => {
        const input = document.createElement("input");
        input.addEventListener("dblclick", () => {
            input.value = '';
        });
        input.addEventListener("paste", (e) => {
            setTimeout(() => {
                fetchCors(e.target.value, textarea);
            }, 1);
        });
        input.id = "input";
        input.size = 40;
        const docUrl = "https://66e.github.io/9/2025-06-08-y.md";
        input.value = docUrl;
        const btnRtrv = document.createElement("button");
        btnRtrv.addEventListener("click", () => {
            fetchCors(input.value, textarea);
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
                genGFormT (textarea.value);
            }, 1);
        });
        textarea.cols = "50";
        textarea.rows = "10";
        textarea.id = "textarea";
        textarea.style.overflow = "auto";
        const btnRslv = document.createElement("button");
        btnRslv.textContent = "resolve";
        btnRslv.id = "btnRslv";
        btnRslv.addEventListener("click", () => {
            generateUnit (textarea.value);
        });
        const btnMsn = document.createElement("button");
        btnMsn.addEventListener("click", () => {
            const lngt = retrieveMsn();
            generateUnit ( lngt );
        });
        btnMsn.textContent = "Msn";
        btnMsn.id = "btnMsn";
        
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

    jsPanel.create({
        callback: (panel) => {
            const unit = visualizeComponentS();
            panel.content.appendChild(unit);
        },
        contentSize: '500 300',
        dragit: {
            snap: true,
        },
        headerTitle: 'dashboard',
        position: 'left-top',
        theme: 'dark',
    });
}

const imagesloaded_OL = () => {
    const urlSArr = [
        "https://7ed.net/bing/api?rand=true&size=1024x768", 
        "https://picsum.photos/v2/list", 
        "https://api.7ed.net/bing/api", 
        "https://picsum.photos/536/354"
    ];
    generateUnit (urlSArr);
}

const filterString = (strIn) => {
    const currentStr = parseURL(strIn);
    if (currentStr === "img") {
        return parseURL(strIn, 1);
    } else {
        return strIn;
    }
}

const parseURL = ($string, param) => {
    const __urlR = "((https?|ftp|file):\/\/|(www|ftp)\.)[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]";
    const __imgR = "\.(?:img|jpe?g|gif|png)";
    const urlRegex = new RegExp(__urlR, "i");
    const imgRegex = new RegExp(__imgR, "i");
    const imgWURegex = new RegExp(__urlR + __imgR, "i");
    const pRompt6Exe = /^\#6\/p\/\w+$/i;
    const regTestStr = urlRegex.test($string);
    if (regTestStr) {
        switch (true) {
            case imgRegex.test($string):
                if (param) {
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

const processElem = (urlS) => {
    const objS = [];
    const div = document.createElement("div");

urlS.forEach((url) => {
    const srcTrim = filterString(url);
    objS.push({ src: srcTrim });

    const li = document.createElement("li");
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
    img.src = srcTrim;
    img.style.borderRadius = "4px";
    img.style.opacity = 0;
    img.style.maxHeight = "70px";
    img.style.minWidth = "25px";
    img.style.transition = "opacity 0.4s";
    img.addEventListener("click", (e) => {
        const crrntPrnt = e.currentTarget.parentNode;
        const galIdx = [].indexOf.call(crrntPrnt.parentNode.childNodes, crrntPrnt);
        new Fancybox(
            // Array containing gallery items
            objS,
            // Gallery options
            {
                startIndex: galIdx,
            }
        );
    });

    li.appendChild(img);
    div.appendChild(li);
});

const imgLoad = imagesLoaded( div );
imgLoad.on( 'always', ( instance ) => {
  console.log( imgLoad.images.length + ' in total' );
});
imgLoad.on( 'done', ( instance ) => {
  console.log('DONE  - all succes');
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

div.className = "cntInner";
return div;
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

    const referUrl = [
        "https://jspanel.de/jspanel/dist/jspanel.min.css",
        "https://jspanel.de/jspanel/dist/jspanel.min.js",
        "https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.min.css",
        "https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.umd.min.js",
        "https://66e.github.io/j/msn_JS.md",
    ];
    const checkbox = [];
    const referElem = [];
    const boolean = [];

	const referReady = (iterator) => {
		referElem[iterator] = appendRefer(referUrl[iterator]);
		const elemId = referElem[iterator].id;
		referElem[iterator].addEventListener("load", () => {
			switch (elemId) {
			case 'jspanel_min_js':
				jspanel_OL ();
				break;
            case 'imagesloaded_pkgd_min_js':
				imagesloaded_OL ();
				break;
			default:
			}
		});
		document.documentElement.appendChild(referElem[iterator]);
		checkbox[iterator].title = referElem[iterator].id;
	}

    for (let i = 0; i < referUrl.length; i++) {
        checkbox[i] = createCheckbox();
        const label = document.createElement('label');
        label.textContent = i;
        bar.appendChild(label);
        bar.appendChild(checkbox[i]);
        boolean[i] = localStorage.getItem('checkbox' + i);
        if ( boolean[i] === 'true' ) {
			referReady(i);
        }
        checkbox[i].checked = boolean[i] === 'true';
        checkbox[i].addEventListener("change", () => {
            if (checkbox[i].checked) {
				referReady(i);
            } else {
                referElem[i].remove();
            }
            localStorage.setItem('checkbox' + i, (checkbox[i].checked));
        });
    }
    document.body.appendChild(trigger);
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

    // Your code here...
})();

/*
```
*/