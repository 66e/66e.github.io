// ==UserScript==
// @name         quartzPlug
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// ==/UserScript==

(() => {
    'use strict';

const matchHref = () => {
    const githubPage = /\bhttps?:\/\/\w+\.github\.io/i;
    const msnCn = /\bhttps?:\/\/www\.msn\.cn\/zh-cn\/\w+\/\w+\/[%-\w]+\/[-\w]+/i;
    
    switch (true) {
        case githubPage.test(window.location.href):
            return 'githubPage';
        case msnCn.test(window.location.href):
            return 'msnCn';
        default:
            return '';
    }
}

const parseLinkS = (selectRule) => {
    const retrievedElemS = document.querySelectorAll(selectRule);
    const hrefArr = [];
    for (const elem of retrievedElemS) {
        const result = filterUrl('', elem.href);
        if (result === 'img') {
            elem.style.display = 'none';
            const urlTrim = filterUrl ('trim', elem.href);
            const fancySuit = getImageItem(urlTrim);
            elem.parentElement.classList.add('dynamic-container');
            elem.parentElement.insertBefore(fancySuit, elem);
            elem.remove();
        }
        hrefArr.push(elem.href);
    }
    return hrefArr;
}

const appendRefer = (urlFile) => {
    const fileExtension = urlFile.match(/\.[^/.]+$/);
    const referElem = createByExtens(urlFile, fileExtension[0]);
    const fileName = urlFile.match(/[^\/=\b]+(?=\.[^\/.]*$)/)[0];
    referElem.id = fileName.replace(/\./g,'_')
    + fileExtension[0].replace(/\./g,'_');
    document.documentElement.appendChild(referElem);
}

const createByExtens = (urlFile, fileExtens) => {
    switch (fileExtens) {
        case '.js':
            const scriptRefer = document.createElement('script');
            scriptRefer.src = urlFile;
            const fJ = 'https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.31/fancybox/fancybox.umd.min.js';
            if ( urlFile === fJ ) {
                scriptRefer.addEventListener('load', () => {
                    Fancybox.bind("[data-fancybox]", {
                        // Your custom options
                    });
                });
            }
            return scriptRefer;
            break;
        case '.css':
            const linkRefer = document.createElement('link');
            linkRefer.href = urlFile;
            linkRefer.setAttribute('rel', 'stylesheet');
            return linkRefer;
            break;
        default:
            console.log(fileExtens);
            break;
    }
}

const filterUrl = (funcParam, queryUrl) => {
    const sixComment = /\d\S\S\S\w+\S.*\s\S\w+\S\d{2,4}\S\d{1,2}\S\d{1,2}\s\d{1,2}\S\d{1,2}\S\d{1,2}.*/i;
    const rankTag = /\b6\/\/.r=\d/i;
    const twImgR = /\bhttps?:\/\/pbs.twimg.com\/media\/([\w-]{15,})/i;
    const youtuBeR = /^https?:\/\/(?:(?:youtu\.be\/)|(?:(?:www\.)?youtube\.com\/(?:(?:watch\?(?:[^&]+&)?vi?=)|(?:vi?\/)|(?:shorts\/))))([a-zA-Z0-9_-]{11,})/i;
    const baiduR = /\bhttps?:\/\/pics\d\.baidu\.com\/feed\/[0-9A-z]+\.(?:jpe?g|gif|png).+/i;
    const bingR = /^https?:\/\/.+\.bing\.\w+.th\Sid\S\w+[\.\-\w]+/i;
    const gtimgR = /^https?:\/\/inews\.gtimg\.com\/\w+\/.+\/\d+/i;
    const imgRegEX = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])\.(?:gif|img|jpe?g|png|mp4|svg|webp)+/i;
    const music163R = /^https?:\/\/music\.163\.com\/#?\/?\w+\?id\=\d+/i;
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
  
    switch (true) {
        case sixComment.test(queryUrl):
            return '6Comment';
        case rankTag.test(queryUrl):
            return 'rankTag';
        case twImgR.test(queryUrl):
            return 'twImgR';
        case youtuBeR.test(queryUrl):
            return funcParam !== 'trim' ?
            'youtuBeR' : queryUrl.match(youtuBeR)[1];
        case baiduR.test(queryUrl):
            return 'imgHttp';
        case bingR.test(queryUrl):
            return funcParam !== 'trim' ?
            'img' : queryUrl.match(bingR)[0];
        case gtimgR.test(queryUrl):
            return funcParam !== 'trim' ?
            'img' : queryUrl.match(gtimgR)[0];
        case imgRegEX.test(queryUrl):
            return funcParam !== 'trim' ?
            'img' : queryUrl.match(imgRegEX)[0];
        case music163R.test(queryUrl):
            return 'meting-js';
        case urlRegex.test(queryUrl):
            return funcParam !== 'trim' ?
            'a' : queryUrl;
        default:
            return funcParam !== 'trim' ?
            'p' : queryUrl;
            break;
    }
}

const getImageItem = (imgUrl) => {
    const img = new Image();
    const start_time = Date.now();
    img.style.maxHeight = '72px';
    img.style.maxWidth = '144px';
    img.style.borderRadius = '5px';
    img.src = imgUrl;
    const anchorTag = document.createElement('a');
  
    const check = function(){
        const diff = Date.now() - start_time;
        if(img.naturalWidth>0 || img.naturalHeight>0){
            const voidBoolean = '';
        }
        else{
            const voidBoolean = '❌';
            img.alt = imgUrl;
        }
        clearInterval(set);
        const imgResp = voidBoolean + '🏳‍🌈' + img.naturalWidth
        + '📶' + img.naturalHeight + '⌛' + diff;
        anchorTag.setAttribute('data-caption', imgResp);
    };
    const set = setInterval(check,40);
    const liTag = document.createElement('li');
    liTag.className = 'is-loading';
    liTag.style.float = 'left';
    liTag.style.listStyle = 'none';
    liTag.style.margin = '0 4px 0px 0';
    liTag.style.backgroundPosition = 'center center';
    liTag.style.backgroundRepeat = 'no-repeat';
    liTag.style.backgroundColor = 'rgba(241,241,241,.9)';
    liTag.style.backgroundImage = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/loading.gif';
    liTag.appendChild(img);
    anchorTag.setAttribute('data-fancybox', 'gallery');
    anchorTag.href = imgUrl;
    anchorTag.appendChild(liTag);
    return anchorTag;
}

if ( matchHref() === 'githubPage' ) {
    const style = document.createElement('style');
    style.id = 'dynaContainer';
    document.head.appendChild(style);
    const sheet = style.sheet;
    sheet.insertRule('.dynamic-container::after { clear: both; content: ""; display: block; }', 0);

    const iJ = 'https://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/5.0.0/imagesloaded.pkgd.min.js';
    appendRefer(iJ);
    const fC = 'https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.31/fancybox/fancybox.min.css';
    appendRefer(fC);
    const fJ = 'https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.31/fancybox/fancybox.umd.min.js';
    appendRefer(fJ);

    const querySelPath = 
    '#quartz-body > div.center > article.popover-hint > p > a.external';
    const linkS = parseLinkS(querySelPath);
    console.log(linkS);
}

    // Your code here...
})();