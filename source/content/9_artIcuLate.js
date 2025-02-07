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

const createFragSuit = () => {
    const fragment = document.createDocumentFragment();

    const utterText = document.createElement('textarea');
    utterText.id = 'utterText';
    fragment.appendChild(utterText);

    const bUtter_1 = document.createElement('button');
    bUtter_1.textContent = 'utterance';
    bUtter_1.addEventListener('mouseup', () => {
        articuExpress(utterText.value);
    });
    fragment.appendChild(bUtter_1);

    const bUtter_2 = document.createElement('button');
    bUtter_2.textContent = 'utterance';
    bUtter_2.addEventListener('mouseup', () => {
        articuExpress(utterText.value, 152);
    });
    fragment.appendChild(bUtter_1);

    const synth = window.speechSynthesis;
    const cancel = document.createElement('button');
    cancel.textContent = 'utterance';
    cancel.addEventListener('mouseup', () => {
        synth.cancel();
    });
    fragment.appendChild(cancel);

    const pause = document.createElement('button');
    pause.textContent = 'utterance';
    pause.addEventListener('mouseup', () => {
        synth.pause();
    });
    fragment.appendChild(pause);

    return fragment;
}

const getVoices = () => {
    return new Promise(resolve => {
        let voices = speechSynthesis.getVoices();
        if (voices.length) {
            resolve(voices);
            return;
        }
        const voiceschanged = () => {
            voices = speechSynthesis.getVoices();
            resolve(voices);
        }
        speechSynthesis.onvoiceschanged = voiceschanged;
    })
}

const artIculate = async (text, voiceIndex, vol) => {
    const ttsVoices = await getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = ttsVoices[voiceIndex || 61];
    const currentOur = new Date().getHours();
    const decentVol = currentOur > 10 ? 1 : .2;
    utterance.volume = vol || decentVol;
    speechSynthesis.speak(utterance);
}
//appreciate koldobika https://stackoverflow.com/questions/66951019/async-await-promise-does-not-work-promiseresult-is-undefined
//appreciate docta_faustus https://stackoverflow.com/questions/61016951/changing-the-speechsynthesis-voice-not-working  

    // Your code here...
})();