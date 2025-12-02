document.addEventListener("nav", ( e ) => {
    const matches = document.querySelectorAll("a[data-slug='tags/6/jsAttached']")
    if ( matches.length > 0) {
        const currentSlug = e.detail.url
        const script = document.createElement("script")
        script.src = "../" + currentSlug + ".js"
        const elem = document.querySelector("article.popover-hint")
        if ( elem ) {
            console.log ( ".inline.ts" + Date.now() )
        }
    }
})