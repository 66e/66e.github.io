/*
```js
*/
// ==UserScript==
// @name         referHub-0530
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
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
        case '.js':
            const scriptRefer = document.createElement('script');
            scriptRefer.src = urlFile;
            return scriptRefer;
        case '.css':
            const linkRefer = document.createElement('link');
            linkRefer.href = urlFile;
            linkRefer.setAttribute('rel', 'stylesheet');
            return linkRefer;
        default:
            console.log(fileExtens);
            break;
    }
}

const loadAsyncJ = () => {
	const jsFrame = new JSFrame();
	const frame = jsFrame.create({
    title: 'Window',
    left: 20, top: 120, width: 320, height: 220,
    html: '<div id="aplayer"></div>'
	});
	frame.show();
}

const loadAsyncA = () => {
	const ap = new APlayer({
    container: document.getElementById('aplayer'),
    lrcType: 3,
    audio: [{
        name: 'ライア',
        artist: 'Zwei',
        url: 'https://oss.mojidict.com/article/audio/dd16f7f0-8367-4d49-830a-3a66d0489982.mp3',
        cover: 'https://zweima.com/wp/wp-content/uploads/b2b99ccc4fe2b7d9e69f2b14b16b7a2e-1024x1024.jpg',
        lrc: 'https://66e.github.io/9/%E3%83%A9%E3%82%A4%E3%82%A2.md'
    }]
});
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
        'https://riversun.github.io/jsframe/jsframe.js',
        'https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js'
    ];
    const checkbox = [];
    const referElem = [];
    const boolean = [];

	const referReady = (iterator) => {
		referElem[iterator] = appendRefer(referUrl[iterator]);
		const elemId = referElem[iterator].id;
		window.addEventListener("load", (event) => {
			switch (elemId) {
			case 'jsframe_js':
				loadAsyncJ();
				break;
			case 'APlayer_min_js':
				loadAsyncA();
				break;
			default:
				console.log(elemId);
			}
		});
		document.documentElement.appendChild(referElem[iterator]);
		checkbox[iterator].title = referElem[iterator].id;
		console.log('referReady');
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
    div.style.height = '160px';
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