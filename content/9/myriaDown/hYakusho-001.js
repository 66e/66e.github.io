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
    // 1. 解析标签
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

    // 2. 原始构建
    build(md) {
        const lines = md.split('\n');
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
                const tags = Parser.parseTags(content); 

                while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();

                const node = { title: content.split(' #?<')[0].trim(), indent, tags, children: [] };
                if (tags.anchor) state.anchors[tags.anchor] = node;
                
                stack[stack.length - 1].children.push(node);
                stack.push(node);
            }
        }
        state.tree = root.children;
    },

    // 3. 激活逻辑：识别 logic 节点并生成图片序列
    activate(nodes, parentTags = {}) {
        return nodes.map(node => {
            let tags = { ...parentTags, ...node.tags };
            
            // 处理 Alias 继承
            if (tags.alias && state.anchors[tags.alias]) {
                const src = JSON.parse(JSON.stringify(state.anchors[tags.alias]));
                node.children = [...src.children, ...node.children];
                tags = { ...src.tags, ...tags };
            }

            // 重要：标记逻辑穿透点
            if (tags.isMenuNode === 'false') {
                node.isBypass = true;
            }

            // 判定是否为“漫画卷” (非逻辑节点 且 (有序列指令 或 有子链接))
            const isSeq = tags.genSeqPics === 'true' && tags.lastPic;
            const hasHttp = node.children.some(c => c.title.startsWith('http'));

            if (!node.isBypass && (isSeq || hasHttp)) {
                const pad = parseInt(tags.padStart || 2);
                const vol = (node.title.match(/\d+/) || ["01"])[0].padStart(pad, "0");
                const base = isSeq ? `https://gcore.jsdelivr.net/gh/6cc/c/m/y/${vol}/` : "";
                
                node.children = isSeq 
                    ? Array.from({length: parseInt(tags.lastPic)}, (_, i) => ({ title: `P${i+1}`, url: `${base}${i+1}.jpg`, isPage: true }))
                    : node.children.map((c, i) => ({ title: `P${i+1}`, url: c.title, isPage: true }));
                
                node.isLeaf = true;
                node.thumbUrl = isSeq ? `${base}${tags.coverPic || 1}.jpg` : node.children[0].url;
            }

            // 递归激活 (排除已是叶子的节点)
            if (node.children.length > 0 && !node.isLeaf) {
                node.children = Parser.activate(node.children, tags);
            }
            return node;
        });
    },

    // 4. 降维扁平化：彻底溶解 isBypass 节点
    flatten(nodes) {
        let result = [];
        nodes.forEach(node => {
            // 先处理子节点的降维
            const children = node.children ? Parser.flatten(node.children) : [];
            
            if (node.isBypass) {
                // 如果是 mirrors 或 default，丢弃自己，将其子项（有效卷）推入父级
                result = result.concat(children);
            } else {
                // 如果是普通节点，保留自己，挂载处理后的子项
                result.push({ ...node, children });
            }
        });
        return result;
    }
};

    const init = async () => {
        try {
            // 1. 获取 MD 并测速环境 (setupEnv 内含 fetch)
            const res = await fetch(`https://raw.githubusercontent.com/qqvvv/qqvvv.github.io/master/content/9/myriaDown/allIn1.md?t=${Date.now()}`);
            const rawMD = await res.text();
            await setupEnv(rawMD); 

            // 2. 第一阶段：生成原始树 (state.tree 此时会有 21 个节点)
            Parser.build(rawMD); 

            // 3. 第二阶段：激活 (标记 isBypass 并生成图片，此时还是 21 个节点)
            const activeTree = Parser.activate(state.tree);

            // 4. 第三阶段：降维 (彻底消灭 default 和 mirrors，结果应为 19)
            state.tree = Parser.flatten(activeTree);

            console.log("[hLog] Final Analysis:", {
                totalBooks: state.tree.length,
                yuyuVolCount: state.tree[0]?.children?.length,
                winners: state.winners
            });
        } catch (err) {
            console.error("[hLog] Error during initialization:", err);
        }
    };

    return { start: init, debug: () => state };
})();

hYakusho.start();