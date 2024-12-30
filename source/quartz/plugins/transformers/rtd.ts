import { QuartzTransformerPlugin } from "../types"

interface Options {
  renderEngine: "rtd" | "rtd"
  customMacros: MacroType
}

interface MacroType {
  [key: string]: string
}

export const rtd: QuartzTransformerPlugin<Partial<Options>> = (opts) => {
  const engine = opts?.renderEngine ?? "katex"
  const macros = opts?.customMacros ?? {}
  return {
    name: "rtd",
    markdownPlugins() {
      return [rtd]
    },
    htmlPlugins() {
      return [[rtd, { output: "html", macros }]]
    },
    externalResources() {
        return {
          css: [
            // base css
            "https://cdn.jsdelivr.net/gh/rundocs/jekyll-rtd-theme@2.0.10/assets/css/theme.min.css",
          ],
          js: [
            {
              // fix copy behaviour: https://github.com/KaTeX/KaTeX/blob/main/contrib/copy-tex/README.md
              src: "https://cdn.jsdelivr.net/gh/rundocs/jekyll-rtd-theme@2.0.10/assets/js/theme.min.js",
              loadTime: "afterDOMReady",
              contentType: "external",
            },
          ],
        }
    },
  }
}
