import { QuartzFilterPlugin } from "../types"

export const ReferJS: QuartzFilterPlugin = () => {
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