/*
```js
*/

// ==UserScript==
// @name        New script 
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       none
// @version     1.0
// @author      -
// @description 2025/6/30 13:45:42
// ==/UserScript==

(() => {
    'use strict';

const visualizeTrigger = () => {
    const div = document.createElement("div");
    div.addEventListener("mouseover", () => {
        div.style.borderStyle = "dashed";
    });
    div.addEventListener("mouseout", () => {
        div.style.borderStyle = "";
    });
    div.style = "border: 1px rgb(255, 0, 255); bottom: 0px; height: 24px; position: fixed; right: 0px; width: 24px;";
    document.body.appendChild( div );
}

visualizeTrigger ();

    // Your code here...
})();

/*
```
*/