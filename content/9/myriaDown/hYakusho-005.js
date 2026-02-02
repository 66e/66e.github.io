/**
 * hYakusho-005: 核心引导与泛用竞速架构
 */
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

    // --- [工具：泛用竞速引擎] ---
    const RaceEngine = {
        async run(urls) {
            const tasks = urls.map(async (url) => {
                const start = performance.now();
                try {
                    await fetch(url, { method: 'HEAD', mode: 'no-cors' });
                    return { url, ms: (performance.now() - start).toFixed(1), domain: new URL(url).hostname };
                } catch (e) {
                    return { url, ms: 9999, domain: new URL(url).hostname };
                }
            });
            // 只要有一个成功就返回，或者全部失败
            return await Promise.any(tasks);
        }
    };

    // --- [模块：核心引导] ---
    const Core = {
        isStarted: false,

        async boot() {
            if (this.isStarted) return;
            this.isStarted = true;

            try {
                const res = await fetch(`https://raw.githubusercontent.com/qqvvv/qqvvv.github.io/master/content/9/myriaDown/allIn1.md?t=${Date.now()}`);
                const rawMD = await res.text();

                // 1. 解析数据
                Parser.build(rawMD); 
                state.tree = Parser.flatten(Parser.activate(state.tree));

                // 2. 绑定快捷键 (Alt + \)
                this.bindHotkey();

                console.log("[hLog] Core Ready. Tree count:", state.tree[0]?.children?.length);
            } catch (err) {
                console.error("[hLog] Boot failed:", err);
                this.isStarted = false;
            }
        },

        bindHotkey() {
            window.addEventListener('keydown', (e) => {
                // 使用 e.code 匹配物理按键 Backslash
                if (e.altKey && e.code === 'Backslash') {
                    e.preventDefault();
                    this.toggleDebug();
                }
            });
            console.log("[hLog] Hotkey bound: Alt + \\");
        },

        toggleDebug() {
            if (window.jsPanel) {
                // 后续调用 MirrorRacer.report
                console.log("[hLog] Creating Debug Panel...");
            } else {
                console.log("[hLog] State Snapshot:", state);
                alert("jsPanel 尚未加载，数据已输出至控制台。");
            }
        }
    };

    // 暴露有限的 API
    return {
        start: () => Core.boot(),
        debug: () => state,
        // 这里可以根据需要暴露 RaceEngine 供外部独立验证
        testRace: (urls) => RaceEngine.run(urls) 
    };
})();

// 替代 CoreLoader.init() 的稳健启动
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hYakusho.start);
} else {
    hYakusho.start();
}