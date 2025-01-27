// ==UserScript==
// @name         jshub
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// ==/UserScript==

(() => {
    'use strict';

const uniqueLauncher = () => {
  const triggerExist = document.querySelector('div#trigger0');
  triggerExist === null ? attachTrigger() :
  console.log('already entity');
}

const attachTrigger = () => {
    const trigger = createTrigger();
    document.body.appendChild(trigger);
    const bar = createNavBar();
    trigger.appendChild(bar);
}

const createTrigger = () => {
    const trigger0 = document.createElement('div');
    trigger0.id = 'trigger0';
    trigger0.style.position = 'fixed';
    trigger0.style.zIndex = '801';
    trigger0.style.bottom = '16px';
    trigger0.style.right = '16px';
    trigger0.style.width = '16px';
    trigger0.style.height = '16px';
    trigger0.style.backgroundColor = '#999';
    trigger0.addEventListener('contextmenu', () => {
        trigger0.remove();
    });
    return trigger0;
}

const createNavBar = () => {
  const navBar = document.createElement('ul');
  navBar.className = 'nav-menu';
  navBar.id = 'navBar';
  navBar.style.position = 'fixed';
  navBar.style.bottom = '0px';
  navBar.style.right = '16px';
  navBar.style.width = '16px';
  navBar.style.height = '16px';
  navBar.style.backgroundColor = '#999';
  navBar.style.display = 'none';

  const trigger0 = document.querySelector('div#trigger0');
  document.body.insertBefore(navBar, trigger0);

  trigger0.addEventListener('mouseover', () => {
    navBar.style.display = 'block';
  });

  navBar.addEventListener('mouseleave', () => {
    navBar.style.display = 'none';
  });

  return navBar;
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