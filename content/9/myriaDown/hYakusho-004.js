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
    /**
 * Module A: 环境测速引擎 (修正版)
 * 目标：解决 winners 为空，优化探测正则
 */
const setupEnv = async (rawMD) => {
    const lines = rawMD.split('\n');
    let inLabs = false, currentLib = null, lastSet = null;

    // 1. 提取 Labs (逻辑保持 002 的稳定性)
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
            } else if (content.startsWith('http') && lastSet) lastSet.push(content);
        }
    }

    // 2. 竞速逻辑：使用性能计时器
    const racePromises = Object.entries(state.libs).map(async ([libId, sets]) => {
        const setEntries = Object.entries(sets);
        try {
            const winner = await Promise.any(setEntries.map(async ([sid, urls]) => {
                const probe = urls.find(u => /https?:\/\/[\w+\.]+\w+/.test(u)) || urls[0];
                const start = performance.now();
                // 使用 mode: 'no-cors' 确保即使 CDN 不支持 CORS 也能测出响应时间
                await fetch(probe, { method: 'HEAD', mode: 'no-cors' });
                return { 
                    sid, 
                    ms: (performance.now() - start).toFixed(1), 
                    domain: new URL(probe).hostname 
                };
            }));

            state.winners[libId] = { set: winner.sid, dns: winner.domain, ms: winner.ms };
            
            // 3. 注入胜出的资源
            for (const url of sets[winner.sid]) {
                if (url.endsWith('.css')) {
                    const l = document.createElement('link'); l.rel='stylesheet'; l.href=url;
                    document.head.appendChild(l);
                } else {
                    const mod = await import(url);
                    // 适配特定的库命名
                    const globalName = libId === 'fancyapps-ui' ? 'Fancybox' : (libId === 'imagesloaded' ? 'imagesLoaded' : libId);
                    window[globalName] = mod.default || mod[globalName] || mod;
                }
            }
        } catch (e) {
            console.warn(`[hLog] Racing failed for ${libId}`, e);
        }
    });

    await Promise.all(racePromises);
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

/**
 * Module C: UI 渲染模块 (Matrix 容器)
 */
const UI = {
    // 注入基础 CSS
    injectStyles() {
        if (document.getElementById('hy-styles')) return;
        const style = document.createElement('style');
        style.id = 'hy-styles';
        style.innerHTML = `
            #hy-root { 
                position: fixed; inset: 0; z-index: 99999; 
                background: rgba(15, 15, 15, 0.95); color: #ccc;
                font-family: system-ui, -apple-system, sans-serif;
                display: none; flex-direction: column; overflow: hidden;
            }
            .hy-header { padding: 15px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; }
            .hy-grid { 
                flex: 1; overflow-y: auto; padding: 15px;
                display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;
            }
            .hy-card { 
                background: #222; border-radius: 8px; overflow: hidden; 
                transition: transform 0.2s; cursor: pointer;
            }
            .hy-card:active { transform: scale(0.95); }
            .hy-thumb { aspect-ratio: 3/4; background: #333 center/cover no-repeat; }
            .hy-title { padding: 8px; font-size: 13px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        `;
        document.head.appendChild(style);
    },

    render() {
        this.injectStyles();
        let root = document.getElementById('hy-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'hy-root';
            document.body.appendChild(root);
        }

        // 渲染书架
        root.innerHTML = `
            <div class="hy-header">
                <span>hYakusho v4.2</span>
                <span id="hy-close" style="cursor:pointer">✕</span>
            </div>
            <div class="hy-grid">
                ${state.tree.map((book, idx) => `
                    <div class="hy-card" data-idx="${idx}">
                        <div class="hy-thumb" style="background-image: url(${book.thumbUrl || ''})"></div>
                        <div class="hy-title">${book.title}</div>
                    </div>
                `).join('')}
            </div>
        `;
        root.style.display = 'flex';
        
        // 简单绑定：点击关闭
        document.getElementById('hy-close').onclick = () => root.style.display = 'none';
    }
};

    const init = async () => {
    try {
        const res = await fetch(`https://raw.githubusercontent.com/qqvvv/qqvvv.github.io/master/content/9/myriaDown/allIn1.md?t=${Date.now()}`);
        const rawMD = await res.text();
        
        // 1. 先跑测速和库注入
        await setupEnv(rawMD); 

        // 2. 解析与降维
        Parser.build(rawMD); 
        state.tree = Parser.flatten(Parser.activate(state.tree));

        // 3. 最终检查
        console.log("[hLog] Winners:", state.winners);
        console.log("[hLog] Tree Structure Cleaned. Books:", state.tree.length);
        
        // 4. 渲染界面
        UI.render();

    } catch (err) {
        console.error("[hLog] Init Error:", err);
    }
};

    return { start: init, debug: () => state };
})();

hYakusho.start();