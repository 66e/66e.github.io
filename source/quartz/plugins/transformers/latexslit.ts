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
  const enginee = opts?.renderEngine ?? "katex"
  const macrosm = opts?.customMacros ?? {}
  return {
    name: "Latex",
    markdownPlugins() {
      return [remarkMath]
    },
    htmlPlugins() {
      if (enginee === "katex") {
        return [[rehypeKatex, { output: "html", macrosm }]]
      } else {
        return [[rehypeMathjax, { macrosm }]]
      }
    },
    externalResources() {
      if (enginee === "katex") {
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