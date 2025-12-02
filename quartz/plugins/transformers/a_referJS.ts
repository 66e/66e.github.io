import { QuartzTransformerPlugin } from "../types"

export const A_referJS: QuartzTransformerPlugin = () => {
    return {
        name: "A_referJS",
        externalResources() {
      switch (true) {
        case true:
          return {
            js: [
              {
                // fix copy behaviour: https://github.com/KaTeX/KaTeX/blob/main/contrib/copy-tex/README.md
                src: "https://66e.github.io/6/navAttach.js",
                loadTime: "afterDOMReady",
                contentType: "external",
              },
            ],
          }
      }
    },
    }
}