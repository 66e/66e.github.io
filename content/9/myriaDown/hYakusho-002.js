const hYakusho = (function() {
    "use strict";

    const state = {
        isMobile: window.innerWidth <= 768,
        rawMD: "",
        tree: [],
        anchors: {},
        libs: {},
        winners: {} // 记录每个库最终胜出的 Set
    };

    // --- [模块 A1: 数据获取] ---
    const fetchMD = async () => {
        console.log("[hLog] Fetching MD...");
        const url = 'https://raw.githubusercontent.com/qqvvv/qqvvv.github.io/master/content/9/myriaDown/allIn1.md';
        const res = await fetch(`${url}?t=${Date.now()}`);
        state.rawMD = await res.text();
    };

    // --- [模块 A2: 实验室解析与镜像竞速] ---
    const setupEnv = async () => {
        const lines = state.rawMD.split('\n');
        let inLabs = false, currentLib = null, lastSet = null;

        // 1. 精准提取 Labs 信息
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

        // 2. 竞速与注入
        const racePromises = Object.entries(state.libs).map(async ([libId, sets]) => {
            const setEntries = Object.entries(sets);
            try {
                // 使用 Promise.any 进行并行的 HEAD 测速 (Fastest Wins)
                const winnerId = await Promise.any(setEntries.map(([setId, urls]) => {
                    const probe = urls.find(u => u.endsWith('.js'));
                    return fetch(probe, { method: 'HEAD', mode: 'no-cors' }).then(() => setId);
                }));

                state.winners[libId] = sets[winnerId];
                console.log(`[hLog] ${libId} -> Winner: ${winnerId}`);

                // 立即注入资源
                for (const url of state.winners[libId]) {
                    if (url.endsWith('.css')) {
                        const l = document.createElement('link'); l.rel='stylesheet'; l.href=url;
                        document.head.appendChild(l);
                    } else {
                        // 使用 import 动态载入 ESM 模块或传统脚本
                        const mod = await import(url);
                        window[libId === 'fancyapps-ui' ? 'Fancybox' : libId] = mod.default || mod[libId] || mod;
                    }
                }
            } catch (e) {
                console.warn(`[hLog] All mirrors failed for ${libId}`);
            }
        });

        await Promise.all(racePromises);
        console.log("[hLog] Environment Environment Setup Complete.");
    };

    // --- [模块 B: 解析器已保留在原位] ---
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

        build() {
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

    const init = async () => {
        await fetchMD();
        await setupEnv(); // 测速并准备库
        Parser.build();   // 解析数据
        console.log("[hLog] All systems go. State:", state);
    };

    return { start: init, debug: () => state };
})();

hYakusho.start();