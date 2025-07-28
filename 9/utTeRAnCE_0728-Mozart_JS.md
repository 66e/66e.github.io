/*
```js
*/

const initializeVoiceSC = () => {
    const synth = window.speechSynthesis;
    synth.addEventListener("voiceschanged", () => {
        const voices = synth.getVoices();
        const select = document.createElement("select");
        document.body.appendChild( select );
        for (const voice of voices) {
            const option = document.createElement("option");
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute("data-lang", voice.lang);
            option.setAttribute("data-name", voice.name);
            select.appendChild(option);
        }
    });

}

const processWorkflow = () => {
    initializeVoiceSC ();
}

processWorkflow ();

/*
```
*/