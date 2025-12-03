document.addEventListener("nav", ( e ) => {
    const matches = document.querySelectorAll("a[data-slug='tags/6/jsAttached']")
    if ( matches.length > 0) {
        const currentSlug = e.detail.url
        const script = document.createElement("script")
        script.src = "../" + currentSlug + ".js"
        const script2 = document.createElement("script")
        script2.src = "https://raw.githubusercontent.com/66e/66e.github.io/refs/heads/v4/content/"
         + currentSlug + ".md"
        const elem = document.querySelector("article.popover-hint")
        if ( elem ) {
            elem.appendChild( script )
            elem.appendChild( script2 )
        }
        console.log( ".js" + Date.now() );
    }
})