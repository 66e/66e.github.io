// ==UserScript==
// @name         referHub
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
      'https://66e.github.io/quartzEnh.js',
      'https://66e.github.io/hexagraMenu.js',
      'https://66e.github.io/utTeRAnCE.js',
  ];
  const checkbox = [];
  const referElem = [];
  const boolean = [];
  for (let i = 0; i < referUrl.length; i++) {
      checkbox[i] = createCheckbox();
      const label = document.createElement('label');
      label.textContent = i;
      bar.appendChild(label);
      bar.appendChild(checkbox[i]);
      boolean[i] = localStorage.getItem('checkbox' + i);
      if ( boolean[i] === 'true' ) {
          referElem[i] = appendRefer(referUrl[i]);
          checkbox[i].title = referElem[i].id;
          document.documentElement.appendChild(referElem[i]);
      }
      checkbox[i].checked = boolean[i] === 'true';
      checkbox[i].addEventListener("change", () => {
          if (checkbox[i].checked) {
              referElem[i] = appendRefer(referUrl[i]);
              checkbox[i].title = referElem[i].id;
              document.documentElement.appendChild(referElem[i]);
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