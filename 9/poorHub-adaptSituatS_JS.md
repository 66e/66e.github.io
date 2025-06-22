/*
```js
*/

(() => {
    'use strict';

const createMould = ({
    className,
    click,
    href,
    id,
    localName,
    textContent,
    src,
}) => {
    const tag = document.createElement(localName);
    switch ( true ) {
        case click !== undefined:
            tag.addEventListener(click || "click", () => {
                console.log(0);
            });
        case className !== undefined:
            tag.className = className;
        case href !== undefined:
            tag.href = href;
        case id !== undefined:
            tag.id = id;
        case textContent !== undefined:
            tag.textContent = textContent;
        case src !== undefined:
            tag.src = src;
    }
    return tag;
}

const preprocessPrecast = () => {
    const el = createMould({
        className : 'className',
        click : 'click',
        href : 'href',
        id : 'id',
        localName : 'div',
        textContent : 'textContent',
        src : 'src',
        });
    document.body.appendChild(el);
}

const adaptSituatS = (container) => {
    const uniqueLauncher = () => {
        const trgrEntity = document.querySelector("div#triggerField");
        if ( !trgrEntity ) {
            preprocessPrecast();
        } else {
            console.log('already entity');
        }
    }

    if ( container ) {
        uniqueLauncher();
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            uniqueLauncher();
        });
    }
}

adaptSituatS(document.body);

    // Your code here...
})();

/*
```
*/