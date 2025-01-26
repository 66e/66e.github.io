// ==UserScript==
// @name         socket0
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// ==/UserScript==

(() => {
  'use strict';

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

const pierceElem = () => {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.zIndex = 702;
  document.body.insertBefore(div, document.body.firstChild);

  const referUrl = [
      'https://66e.github.io/js1.js',
      'https://66e.github.io/js2.js',
      'https://66e.github.io/js3.js',
  ];
  const checkbox = [];
  const boolean = [];
  const referElem = [];
  for (let i = 0; i < referUrl.length; i++) {
      checkbox[i] = document.createElement('input');
      checkbox[i].type = 'checkbox';
      const label = document.createElement('label');
      label.textContent = '#00' + i;
      div.appendChild(label);
      div.appendChild(checkbox[i]);
      boolean[i] = localStorage.getItem('checkbox' + i);
      if ( boolean[i] === 'true' ) {
          referElem[i] = appendRefer(referUrl[i]);
          document.documentElement.appendChild(referElem[i]);
      }
      checkbox[i].checked = boolean[i] === 'true';
      checkbox[i].addEventListener("change", () => {
          if (checkbox[i].checked) {
              referElem[i] = appendRefer(referUrl[i]);
              document.documentElement.appendChild(referElem[i]);
          } else {
              referElem[i].remove();
          }
          localStorage.setItem('checkbox' + i, (checkbox[i].checked));
      });
  }
}

pierceElem();

  // Your code here...
})();