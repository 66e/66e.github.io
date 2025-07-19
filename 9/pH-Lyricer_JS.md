/*
```js
*/

// ==UserScript==
// @name         referHub-06
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.6.3
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

const jspanel_OL = () => {
    jsPanel.create({content: '<div id="jspContainer"></div>'});
}

const lyricer_OL = () => {
    const fetchCors = async(url, targetElem) => {
        const response = await fetch(url);
        const docData = await response.text();
        lrc.setLrc(docData);
    }
    const docUrl = 'https://66e.github.io/9/%E3%83%A9%E3%82%A4%E3%82%A2.md';
    fetchCors(docUrl);
    const jspContainer = document.querySelector('div.markdown-body');
    const audio = document.createElement('audio');
    audio.controls = true; // 显示播放器控件
    audio.src = 'https://oss.mojidict.com/article/audio/dd16f7f0-8367-4d49-830a-3a66d0489982.mp3';  // 设置音频源
    jspContainer.appendChild(audio);
    const lyricer = document.createElement('div');
    lyricer.id = 'lyricer';
    jspContainer.appendChild(lyricer);

    const lrc = new Lyricer();

    audio.addEventListener( "timeupdate", function() {
        lrc.move(audio.currentTime);
    });

    window.addEventListener('lyricerclick', function(e){
        if (e.detail.time > 0) {
            audio.currentTime = e.detail.time;
        }
    });
}

const jsframe_OL = () => {
	const jsFrame = new JSFrame();
	const frame = jsFrame.create({
    title: 'Window',
    left: 20, top: 120, width: 320, height: 220,
    html: '<div id="aplayer"></div>'
	});
	frame.show();
}

const APlayer_OL = () => {
	const ap = new APlayer({
    container: document.getElementById('aplayer'),
    lrcType: 3,
    audio: [{
        name: 'ライア',
        artist: 'Zwei',
        url: 'https://oss.mojidict.com/article/audio/dd16f7f0-8367-4d49-830a-3a66d0489982.mp3',
        cover: 'https://zweima.com/wp/wp-content/uploads/b2b99ccc4fe2b7d9e69f2b14b16b7a2e-1024x1024.jpg',
        lrc: 'https://66e.github.io/%E3%83%A9%E3%82%A4%E3%82%A2.lrc'
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
        'https://jspanel.de/jspanel/dist/jspanel.min.css',
        'https://jspanel.de/jspanel/dist/jspanel.min.js',
        'https://lusaisai.github.io/Lyricer/Lyricer-master/lyricer.min.css',
        'https://lusaisai.github.io/Lyricer/Lyricer-master/lyricer.min.js'
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
                    jspanel_OL();
                    break;
                case 'lyricer_min_js':
                    lyricer_OL();
                    break;
                case 'jsframe_js':
                    jsframe_OL();
                    break;
                case 'APlayer_min_js':
                    APlayer_OL();
                    break;
                default:
                    console.log(iterator + ' without func_OL');
			}
		});
		document.documentElement.appendChild(referElem[iterator]);
		checkbox[iterator].title = referElem[iterator].id;
		console.log(iterator + ' [' + elemId + '] is ready');
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