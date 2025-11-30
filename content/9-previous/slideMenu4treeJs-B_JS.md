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

const arrSpliter = ( txtIn, strIn ) => {
    const arrOutput = txtIn.trim().split(strIn);
    return arrOutput;
}

const resolveTxt = (txtIn) => {
    const paraS_a = arrSpliter(txtIn, ">　　　　　　　　");
    const nArrParaS = new Array();
    paraS_a.forEach((para) => {
        const arrLines = arrSpliter(para, "\n");
        const nArrStrS = new Array();
        arrLines.forEach((line) => {
            const aStrS = arrSpliter(line, "|");
            const nObjStrS = new Object();
            nObjStrS.id = aStrS[0];
            nObjStrS.text = aStrS[3];
            nArrStrS.push(nObjStrS);
        });
        const nObjParaS = new Object();
        nObjParaS.id = nArrStrS[8].id;
        nObjParaS.text = nArrStrS[8].text;
        nArrStrS.pop();
        nObjParaS.children = nArrStrS;
        nArrParaS.push(nObjParaS);
    });
    console.log(nArrParaS);
    return nArrParaS;
}

const fillContent = () => {
    const arr_bookS = ["yuyuHakusho",];
    const bookS = fillSubMenu ( arr_bookS );
    const volPageS = [
        102,  98,  96,  96, 104, 104, 101,  95,  96, 104,
         95,  95,  94, 103, 103, 103, 103,  94,  97, 
    ];
    const volS = fillSubMenu ( volPageS, "volS" );
    bookS.appendChild(volS);
    return bookS;
}

const fillSubMenu = ( volNum, param, pLength ) => {
    const li = document.createElement("li");
    const aTag = document.createElement("a");
    aTag.textContent = volNum;
    li.appendChild( aTag );
    if ( param === "recur" ) {
        const ul = document.createElement("ul");
        for (let i = 1; i <= pLength; i++) {
            const subMenu_L2 = fillSubMenu ( i );
            ul.appendChild( subMenu_L2 );
        }
        li.appendChild( ul );
    }
    return li;
}

const fillCluster = ( arr ) => {
    const ul = document.createElement("ul");
    arr.forEach(( elem, iterator ) => {
        const subset = fillSubMenu ( iterator + 1, "recur", elem );
        ul.appendChild( subset );
    });
    return ul;
}

const visualizMenu = ( obj ) => {
    const menuElement = document.createElement("nav");
    menuElement.style.display = "none";
    menuElement.className = "slide-menu";
    const volPageS = [
        102,  98,  96,  96, 104, 104, 101,  95,  96, 104,
         95,  95,  94, 103, 103, 103, 103,  94,  97, 
    ];
    const treeUnit = fillCluster ( volPageS );
    menuElement.appendChild( treeUnit );
    rEFerfUse ( menuElement );
    menuElement.style.bottom = "24px";
    menuElement.style.height = "95%";
    document.body.appendChild( menuElement );
}

const fetchCors = async ( url, targetElm ) => {
    const respons = await fetch(url);
    const docData = await respons.text();
    const parsedArr = resolveTxt(docData);
    visualizMenu ( parsedArr );
}

const initMenu = ( targetElem ) => {
    const menu = new SlideMenu(targetElem, {
        keyClose: 'Escape',
        submenuLinkAfter: '<span style="margin-left: 1em; font-size: 85%;">➤</span>',
        backLinkBefore: '<span style="margin-right: 1em; font-size: 85%;">◀️</span>',
    });
    targetElem.style.right = "24px";
    menu.open();
}

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

const createTrigger = () => {
    const trggrFld = document.createElement("div");
    trggrFld.addEventListener("click", () => {
        const slideMenu = document.querySelector("nav.slide-menu");
        slideMenu._slideMenu.toggle();
    });
    trggrFld.id = "menuTrigger";
    trggrFld.style = "border: 1px dashed rgb(255, 0, 255); bottom: 0px; height: 24px; position: fixed; right: 0px; width: 24px;";
    document.body.appendChild(trggrFld);
}

const preprocessPrecast = () => {
    const url = "https://66e.github.io/9/hexagram.md";
    fetchCors ( url );
    createTrigger ();
}

const adaptSituatS = ( container ) => {
    const uniqueLauncher = () => {
        const trgrEntity = document.querySelector("div#menuTrigger");
        if ( ! trgrEntity ) {
            preprocessPrecast();
        } else {
            console.log( "already entity" );
        }
    }

    if ( container ) {
        uniqueLauncher ();
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            uniqueLauncher ();
        });
    }
}

adaptSituatS( document.body );

/*
```
*/