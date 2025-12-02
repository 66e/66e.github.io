import { QuartzTransformerPlugin } from "../types"

export const A_referJS: QuartzTransformerPlugin = () => {
    return {
        name: "A_referJS",
        externalResources() {
                    js: [{
                        src: "https://66e.github.io/6/navAttach.js",
                        loadTime: "afterDOMReady",
                        contentType: "external",
                    },],
        },
    }
}