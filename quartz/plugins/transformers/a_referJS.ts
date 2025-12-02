import { QuartzTransformerPlugin } from "../types"

export const A_referJS: QuartzTransformerPlugin = () => {
  return {
    name: "A_referJS",
    externalResources() {
        return {
            css: [{ content: "https://fastly.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" }],
            js: [
              {
                // fix copy behaviour: https://github.com/KaTeX/KaTeX/blob/main/contrib/copy-tex/README.md
                src: "https://fastly.jsdelivr.net/npm/katex@0.16.11/dist/contrib/copy-tex.min.js",
                loadTime: "afterDOMReady",
                contentType: "external",
              },
            ],
          }
    },
  }
}