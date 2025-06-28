/*
```js
*/

const arrSpliter = ( txtIn, strIn ) => {
    const arrOutput = txtIn.trim().split(strIn);
    return arrOutput;
}

const six = [
          {id: '0', text: '初'},
          {id: '1', text: '二'},
          {id: '2', text: '三'},
          {id: '3', text: '四'},
          {id: '4', text: '五'},
          {id: '5', text: '上'},
        ];

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
            nObjStrS.children = six;
            nArrStrS.push(nObjStrS);
        });
        const nObjParaS = new Object();
        nObjParaS.id = nArrStrS[8].id;
        nObjParaS.text = nArrStrS[8].text;
        nObjParaS.children = nArrStrS;
        nArrParaS.push(nObjParaS);
    });
    console.log(nArrParaS);
    return nArrParaS;
}

const fetchCors = async ( url, targetElm ) => {
    const respons = await fetch(url);
    const docData = await respons.text();
    const parsedArr = resolveTxt(docData);
}

const url = "https://66e.github.io/9/hexagram.md";
fetchCors(url);

/*
```
*/