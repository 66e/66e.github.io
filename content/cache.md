---
sort: 3
---

# a

```js
const matches = document.querySelectorAll("a[data-slug='tags/6/jsAttached']")
if ( matches.length > 0) {
    const script = document.createElement("script")
    script.src = `https://66e.github.io/${ currentSlug }.js`
    const el = document.querySelector("article.popover-hint")
    if ( el ) {
        el.appendChild( script )
    }
}
```
