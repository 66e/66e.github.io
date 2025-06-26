/*
```js
*/

const createMould = ({
    localName, body,
    backgroundColor,
    border,
    bottom,
    className,
    click,
    display,
    fontSize,
    height,
    href,
    id,
    left,
    position,
    right,
    src,
    textContent,
    top,
    width,

}) => {
    const tag = document.createElement(localName);
    switch (true) {
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
        case backgroundColor !== undefined:
            tag.style.backgroundColor = backgroundColor;
        case border !== undefined:
            tag.style.border = border;
        case bottom !== undefined:
            tag.style.bottom = bottom;
        case display !== undefined:
            tag.style.display = display;
        case fontSize !== undefined:
            tag.style.fontSize = fontSize;
        case height !== undefined:
            tag.style.height = height;
        case left !== undefined:
            tag.style.left = left;
        case position !== undefined:
            tag.style.position = position;
        case right !== undefined:
            tag.style.right = right;
        case top !== undefined:
            tag.style.top = top;
        case width !== undefined:
            tag.style.width = width;
    }
return tag;
}

const createMenuItem = (cur, sub) => {
    const aTag = createMould({
        localName : "a",
        href : "#",
        textContent : cur,
    });
    const li = document.createElement("li");
    const fragment = new DocumentFragment();
    li.appendChild(aTag);
    fragment.appendChild(li);
    if ( Array.isArray(sub) ) {
        const ul = document.createElement("ul");
        sub.forEach((elem) => {
            const subItem = createMenuItem(elem);
            ul.appendChild(subItem);
        });
        fragment.appendChild(ul);
    }
    return fragment;
}

const prepareMaterial = () => {
    const navTag = createMould({
        localName : "nav",
        className : "slide-menu",
        id : "example-menu",
    });
    const dataArr = [];
    const navMenu = createMenuItem(dataArr);
    navTag.appendChild(navMenu);
    document.body.appendChild(navTag);
}

prepareMaterial();

/*
```
*/