import { QuartzTransformerPlugin } from "../types"

export const A_referJS: QuartzTransformerPlugin = () => {
    return {
        name: "A_referJS",
        externalResources() {
            switch ( 0 ) {
                case 0 :
                return {
                    js: [{
                        src: "https://66e.github.io/6/navAttach.js",
                        loadTime: "afterDOMReady",
                        contentType: "external",
                    },],
                }
            }
        },
    }
}