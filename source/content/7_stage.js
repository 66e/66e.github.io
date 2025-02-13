// ==UserScript==
// @name         2_artIcuLate
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// ==/UserScript==

(() => {
    'use strict';

const synth = window.speechSynthesis;
let voices = [];

const artIculate = (text) => {
    synth.cancel();
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.voice = voices[139];
    synth.speak(utterThis);
}

synth.addEventListener('voiceschanged', () => {
    voices = synth.getVoices();
    artIculate('voices loaded');
});

const utterText = document.createElement('textarea');
    utterText.id = 'utterText';
    utterText.addEventListener('input', () => {
        artIculate(utterText.value);
    });
    document.body.appendChild(utterText);

    // Your code here...
})();