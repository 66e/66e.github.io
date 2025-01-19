import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeMathjax from "rehype-mathjax/svg"
import { QuartzTransformerPlugin } from "../types"

interface Options {
  renderEngine: "katex" | "mathjax"
  customMacros: MacroType
}

interface MacroType {
  [key: string]: string
}

export const Latex: QuartzTransformerPlugin<Partial<Options>> = (opts) => {
  const engine = opts?.renderEngine ?? "katex"
  const macros = opts?.customMacros ?? {}
  return {
    name: "Latex",
    markdownPlugins() {
      return [remarkMath]
    },
    htmlPlugins() {

        return [[rehypeKatex, { output: "html", macros }]]

    },
    externalResources() {

        return {
          css: [
            // base css
            "https://interactive-examples.mdn.mozilla.net/media/examples/link-element-example.css",
          ],
          js: [
            {
              // fix copy behaviour: https://github.com/KaTeX/KaTeX/blob/main/contrib/copy-tex/README.md
              src: "https://cdnjs.cloudflare.com/ajax/libs/lunr.js/2.3.9/lunr.min.js",
              loadTime: "afterDOMReady",
              contentType: "external",
            },
          ],
        }

    },
  }
}