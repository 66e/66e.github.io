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

export const Latexslit: QuartzTransformerPlugin<Partial<Options>> = (opts) => {
  const engines = opts?.renderEngine ?? "katex"
  const macross = opts?.customMacros ?? {}
  return {
    name: "Latexslit",
    markdownPlugins() {
      return [remarkMath]
    },
    htmlPlugins() {
      if (engines === "katex") {
        return [[rehypeKatex, { output: "html", macros }]]
      } else {
        return [[rehypeMathjax, { macross }]]
      }
    },
    externalResources() {
      if (engines === "katex") {
        return {
          css: [
            // base css
            "https://interactive-examples.mdn.mozilla.net/media/examples/link-element-example.css",
          ],
          js: [
            {
              // fix copy behaviour: https://github.com/KaTeX/KaTeX/blob/main/contrib/copy-tex/README.md
              src: "https://66e.github.io/js",
              loadTime: "afterDOMReady",
              contentType: "external",
            },
          ],
        }
      } else {
        return {}
      }
    },
  }
}