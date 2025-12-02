import { QuartzTransformerPlugin } from "../types"

export const ReferJS: QuartzTransformerPlugin = () => {
    return {
        name: "atex",
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