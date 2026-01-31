const hYakusho = (function() {
    "use strict";

    // --- [内部状态机] ---
    const state = {
        isMobile: window.innerWidth <= 768,
        rawMD: "",
        tree: [],
        anchors: {},
        libs: {}
    };

    // --- [模块 A: 数据加载器] ---
    const Loader = async () => {
        console.log("[hLog] Module A: Fetching data...");
        const url = 'https://raw.githubusercontent.com/qqvvv/qqvvv.github.io/master/content/9/myriaDown/allIn1.md';
        try {
            const res = await fetch(`${url}?t=${Date.now()}`);
            state.rawMD = await res.text();
            
            // 提取 Labs 逻辑 (已修正识别范围)
            const lines = state.rawMD.split('\n');
            let inLabs = false, currentLib = null, lastSet = null;
            for (let line of lines) {
                const trim = line.trim(), indent = line.search(/\S/);
                if (trim.includes('#yggdrasiLabs')) { inLabs = true; continue; }
                if (inLabs && trim.startsWith('##')) { inLabs = false; break; }
                if (inLabs && trim.startsWith('- ')) {
                    const content = trim.replace(/^- /, '');
                    if (indent === 0) {
                        const id = content.split(' #?<')[0].trim();
                        state.libs[id] = {}; currentLib = state.libs[id];
                    } else if (content.startsWith('Set') && currentLib) {
                        currentLib[content] = []; lastSet = currentLib[content];
                    } else if (content.startsWith('http') && lastSet) {
                        lastSet.push(content);
                    }
                }
            }
            return true;
        } catch (e) { return false; }
    };

    // --- [模块 B: YggdrAML 解析器] ---
    const Parser = {
        parseTags(str) {
            const match = str.match(/#\?<([^&\s]+)(.*)/);
            if (!match) return {};
            const tags = {};
            const parts = match[1].split('=');
            tags[parts[0]] = parts[1] || true;
            const rest = match[2].trim();
            if (rest) {
                const params = new URLSearchParams(rest.replace(/^&/, ''));
                params.forEach((v, k) => tags[k] = v);
            }
            return tags;
        },

        // 构建原始树并处理逻辑
        build() {
            console.log("[hLog] Module B: Parsing Tree...");
            const lines = state.rawMD.split('\n');
            let inGallery = false;
            const root = { title: "Root", children: [], indent: -1 };
            const stack = [root];

            for (let line of lines) {
                const trim = line.trim();
                if (trim.startsWith('# ') && trim.includes('galleryData')) { inGallery = true; continue; }
                if (inGallery && trim.startsWith('# ') && !trim.includes('galleryData')) { inGallery = false; break; }
                
                if (inGallery && trim.startsWith('- ')) {
                    const indent = line.search(/\S/);
                    const content = trim.replace(/^- /, '');
                    const title = content.split(' #?<')[0].trim();
                    const tags = this.parseTags(content);

                    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();

                    const node = { title, indent, tags, children: [] };
                    if (tags.anchor) state.anchors[tags.anchor] = node;
                    stack[stack.length - 1].children.push(node);
                    stack.push(node);
                }
            }
            state.tree = root.children;
        }
    };

    // --- [主入口: 链式调用] ---
    const init = async () => {
        if (await Loader()) {
            Parser.build();
            // 这里以后可以接 Module C (UI)
            console.log("[hLog] Done! Final State:", state);
        }
    };

    // 暴露一个简单的启动口
    return { start: init, debug: () => state };

})();

// 启动！
hYakusho.start();