document.addEventListener("nav", ( e ) => {
    const slug = e.detail.url
    if ( slug.endsWith("_JS9") ) {
        const script = document.createElement("script")
        script.src = "https://raw.githubusercontent.com/66e/66e.github.io/refs/heads/v4/content/"
        + slug + ".md"
        const elem = document.querySelector("article.popover-hint")
        if ( elem ) {
            elem.appendChild( script )
        }
        console.log( slug + ".js" + Date.now() );
    }
})