/*
```js
*/

// 全局状态和实例，只创建一次
const textContainer = document.querySelector("div#outLet");
const utterance = new SpeechSynthesisUtterance();
let currentIndex = 0;
let currentArrSchedule = [];
let isIframeMode = false; // 用于跟踪当前是否处于 iframe 模式
let pTagsInIframe = []; // 新增：用于存储 iframe 中的 p 元素

// 辅助函数：根据模式查找元素
const findElementByIndex = (index) => {
    if (isIframeMode) {
        return pTagsInIframe[index];
    } else {
        return document.querySelector(`.sentence[data-index="${index}"]`);
    }
};

// 朗读结束监听器，只添加一次
utterance.addEventListener("end", () => {
    // 清除上一个句子的所有高亮
    const prevSentenceElement = findElementByIndex(currentIndex);
    if (prevSentenceElement) {
        prevSentenceElement.classList.remove('highlight-sentence');
        // 恢复原始文本内容
        prevSentenceElement.textContent = currentArrSchedule[currentIndex];
    }

    currentIndex++;
    if (currentIndex < currentArrSchedule.length) {
        utterRecursive(currentIndex);
    } else {
        currentIndex = 0; // 朗读完毕后重置状态
        isIframeMode = false; // 重置模式
    }
});

// 字词边界监听器，只添加一次
utterance.addEventListener("boundary", ({ charIndex, charLength }) => {
    const currentSentenceElement = findElementByIndex(currentIndex);

    if (currentSentenceElement) {
        const text = currentArrSchedule[currentIndex];
        const before = text.substring(0, charIndex);
        const word = text.substring(charIndex, charIndex + charLength);
        const after = text.substring(charIndex + charLength);

        const fragment = document.createDocumentFragment();
        if (before) {
            fragment.appendChild(document.createTextNode(before));
        }
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('highlight-word');
        wordSpan.textContent = word;
        fragment.appendChild(wordSpan);
        if (after) {
            fragment.appendChild(document.createTextNode(after));
        }

        // 清空旧内容并一次性插入新内容
        currentSentenceElement.innerHTML = '';
        currentSentenceElement.appendChild(fragment);
    }
});

// 递归朗读函数
const utterRecursive = (index) => {
    const currentSentenceElement = findElementByIndex(index);

    if (currentSentenceElement) {
        currentSentenceElement.classList.add('highlight-sentence');
    }

    utterance.text = currentArrSchedule[index];
    window.speechSynthesis.speak(utterance);
};

// 页面 DOM 渲染函数
const renderText = (arr) => {
    // 仅在非 iframe 模式下才清空和重新生成 DOM
    if (!isIframeMode) {
        textContainer.innerHTML = "";
        arr.forEach((sentence, index) => {
            const sentenceElement = document.createElement("span");
            sentenceElement.classList.add("sentence");
            sentenceElement.textContent = sentence;
            sentenceElement.dataset.index = index;
            textContainer.appendChild(sentenceElement);
        });
    } else {
        // 在 iframe 模式下，直接修改页面上的 P 元素
        pTagsInIframe.forEach((elem, index) => {
            elem.dataset.index = index;
            elem.classList.remove('highlight-sentence'); // 清除旧高亮
            elem.textContent = currentArrSchedule[index]; // 恢复为纯文本
        });
    }
};

// 主函数：根据场景决定朗读内容
const speakArrStrObj = (arrSchedule) => {
    window.speechSynthesis.cancel();
    
    // 1. 检查URL，决定是否进入iframe模式
    const iframeSelector = "div.epub-view>iframe";
    if (window.location.href.includes("https://alist-org.github.io/static/epub.js/viewer.html")) {
        try {
            const iframe = document.querySelector(iframeSelector);
            if (iframe && iframe.contentDocument) {
                const pTags = iframe.contentDocument.querySelectorAll("div>h4, p");
                pTagsInIframe = Array.from(pTags); // 将 NodeList 转换为数组
                
                const array = pTagsInIframe.map(elem => elem.textContent);
                currentArrSchedule = array;
                isIframeMode = true;
            } else {
                throw new Error("Iframe not found or content not accessible.");
            }
        } catch (e) {
            console.error("无法访问iframe内容，可能是跨域或元素不存在。", e);
            currentArrSchedule = Array.isArray(arrSchedule) ? arrSchedule : [arrSchedule];
            isIframeMode = false;
        }
    } else {
        currentArrSchedule = Array.isArray(arrSchedule) ? arrSchedule : [arrSchedule];
        isIframeMode = false;
    }

    currentIndex = 0;
    renderText(currentArrSchedule);
    utterRecursive(currentIndex);
};

/*
```
*/