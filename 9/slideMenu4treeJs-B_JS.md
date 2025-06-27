/*
```js
*/

const appendRefer = ( urlFile ) => {
    const fileExtension = urlFile.match(/\.[^/.]+$/);
    const referElem = createByExtens(urlFile, fileExtension[0]);
    const fileName = urlFile.match(/[^\/=\b]+(?=\.[^\/.]*$)/)[0];
    referElem.id = fileName.replace(/\./g,'_')
    + fileExtension[0].replace(/\./g,'_');
    return referElem;
}

const createByExtens = ( urlFile, fileExtens ) => {
    switch (fileExtens) {
        case '.css':
            const linkRefer = document.createElement('link');
            linkRefer.href = urlFile;
            linkRefer.setAttribute('rel', 'stylesheet');
            return linkRefer;
        case '.js':
        case '.md':
            const scriptRefer = document.createElement('script');
            scriptRefer.src = urlFile;
            return scriptRefer;
        default:
            console.log(fileExtens);
            break;
    }
}

const rEFerfUse = (elemIn) => {
    if (typeof SlideMenu === "function") {
        initMenu ( elemIn );
    } else {
        const referS = [
            "https://grubersjoe.github.io/slide-menu/slide-menu.js",
            "https://grubersjoe.github.io/slide-menu/slide-menu.css",
            "https://grubersjoe.github.io/slide-menu/demo.css",
        ];
        referS.forEach((refer) => {
            const tag = appendRefer(refer);
            document.documentElement.appendChild(tag);
            switch ( tag.id ) {
                case "slide-menu_js":
                    tag.addEventListener("load", () => {
                        initMenu ( elemIn );
                    });
                break;
                default:
                    console.log("default");
            }
        });
    }
}

const initMenu = (targetElem) => {
    const menu = new SlideMenu(targetElem, {
        keyClose: 'Escape',
        submenuLinkAfter: '<span style="margin-left: 1em; font-size: 85%;">⮞</span>',
        backLinkBefore: '<span style="margin-right: 1em; font-size: 85%;">⮜</span>',
    });
    menu.open();
}

const treeData = [
  {
    id: '0',
    text: 'node-0',
    children: [
      {
        id: '0-0',
        text: 'node-0-0',
        children: [
          {id: '0-0-0', text: 'node-0-0-0'},
          {id: '0-0-1', text: 'node-0-0-1'},
          {id: '0-0-2', text: 'node-0-0-2'},
        ],
      },
      {id: '0-1', text: 'node-0-1'},
    ],
  },
  {
    id: '1',
    text: 'node-1',
    children: [{id: '1-0', text: 'node-1-0'}, {id: '1-1', text: 'node-1-1'}],
  },
];

document.addEventListener("DOMContentLoaded", (event) => {
    const menuElement = document.createElement("nav");
    menuElement.className = "slide-menu";
    const treeUnit = buildTree(treeData, 0);
    menuElement.appendChild(treeUnit);
    document.body.appendChild(menuElement);
    rEFerfUse ( menuElement );
});

function buildTree(nodes, depth) {
  const _this2 = this;

  const rootUlEle = createUlEle();

  if (nodes && nodes.length) {
    nodes.forEach(function (node) {
      const liEle = createLiEle(node, depth === null - 1);
      let ulEle = null;

      if (node.children && node.children.length) {
        ulEle = _this2.buildTree(node.children, depth + 1);
      }

      ulEle && liEle.appendChild(ulEle);
      rootUlEle.appendChild(liEle);
    });
  }
  return rootUlEle;
}

function createUlEle() {
  const ul = document.createElement('ul');
  ul.classList.add('treejs-nodes');
  return ul;
}

function createLiEle(node, closed) {
  const li = document.createElement('li');
  li.classList.add('treejs-node');
  if (closed) li.classList.add('treejs-node__close');

  if (node.children && node.children.length) {
    const switcher = document.createElement('span');
    switcher.classList.add('treejs-switcher');
    li.appendChild(switcher);
  } else {
    li.classList.add('treejs-placeholder');
  }

  const checkbox = document.createElement('span');
  checkbox.classList.add('treejs-checkbox');
  li.appendChild(checkbox);
  const aTag = document.createElement('a');
  aTag.classList.add('treejs-label');
  const text = document.createTextNode(node.text);
  aTag.appendChild(text);
  li.appendChild(aTag);
  li.nodeId = node.id;
  return li;
}

/*
```
*/