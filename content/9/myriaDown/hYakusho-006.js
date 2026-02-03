const hYakusho = (function() {
    "use strict";

    // --- 第一层：State (唯一真理来源) ---
    const state = {
        activeMirror: null,
        anchors: {},
        isMobile: window.innerWidth <= 768,
        libs: {},
        rawMD: "",
        rules: { volReg: "", pageReg: "", templates: [] },
        tree: [],
        winners: {},
    };

    // --- 第二层：Tools ---
    const RaceEngine = {
        async run(urls) {
            const tasks = urls.map(async (url) => {
                const start = performance.now();
                try {
                    // 对于 MD 文件或图片，HEAD 请求是最快的
                    await fetch(url, { method: 'HEAD', mode: 'no-cors' });
                    return { url, ms: (performance.now() - start).toFixed(1), domain: new URL(url).hostname };
                } catch (e) { return null; }
            });
            const results = (await Promise.all(tasks)).filter(r => r !== null);
            return results.sort((a, b) => a.ms - b.ms)[0]; // 返回最快的
        }
    };

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

    build(md) {
        const lines = md.split('\n');
        let inGallery = false;
        const root = { title: "Root", children: [], indent: -1 };
        const stack = [root];
        // 重置 state 里的锚点，防止旧数据干扰
        state.anchors = {};

        for (let line of lines) {
            const trim = line.trim();
            const indent = line.search(/\S/);
            
            if (trim.startsWith('# ') && trim.includes('galleryData')) { inGallery = true; continue; }
            if (inGallery && trim.startsWith('# ') && !trim.includes('galleryData')) { inGallery = false; break; }
            
            if (inGallery && trim.startsWith('- ')) {
                const content = trim.replace(/^- /, '');
                const tags = this.parseTags(content); 
                while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();

                const node = { title: content.split(' #?<')[0].trim(), indent, tags, children: [] };
                if (tags.anchor) state.anchors[tags.anchor] = node;
                
                stack[stack.length - 1].children.push(node);
                stack.push(node);
            }
        }
        state.tree = root.children;
    },

    // 修复栈溢出的核心：activate
    activate(nodes, parentTags = {}, depth = 0) {
        // 防止意外的深度递归
        if (depth > 10) return nodes; 

        return nodes.map(node => {
            let tags = { ...parentTags, ...node.tags };
            
            // 1. 捕获正则 (存入 state.rules)
            if (tags.volReg) state.rules.volReg = tags.volReg;
            if (tags.pageReg) state.rules.pageReg = tags.pageReg;
            
            // 2. 捕获镜像模板
            if (node.title === 'mirrors' || tags.isMirrorNode === 'true') {
                state.rules.templates = node.children
                    .filter(c => c.title.startsWith('http'))
                    .map(c => c.title.replace('/master', '')); // 自动移除 /master
            }

            // 3. 处理 Alias (锚点继承)
            if (tags.alias && state.anchors[tags.alias]) {
                const src = state.anchors[tags.alias];
                // 仅在子节点为空时继承，防止死循环
                if (node.children.length === 0) {
                    node.children = JSON.parse(JSON.stringify(src.children));
                }
            }

            // 4. 判定 Bypass (溶解逻辑)
            // 如果节点名为 default/mirrors 或标记了 isMenuNode=false，则标记为待溶解
            if (node.title === 'default' || node.title === 'mirrors' || tags.isMenuNode === 'false') {
                node.isBypass = true;
            }

            // 5. 递归处理子节点
            if (node.children && node.children.length > 0) {
                node.children = this.activate(node.children, tags, depth + 1);
            }

            return node;
        });
    },

    flatten(nodes) {
        let result = [];
        nodes.forEach(node => {
            const children = node.children ? this.flatten(node.children) : [];
            if (node.isBypass) {
                // 溶解自己，将其子项上浮
                result = result.concat(children);
            } else {
                node.children = children;
                result.push(node);
            }
        });
        return result;
    }
};

    // --- 第三层：Executors ---
    /**
 * 修正后的 JSLoader 片段
 */
const JSLoader = {
    globalMapping: {
        'fancyapps-ui': 'Fancybox',
        'imagesloaded': 'imagesLoaded',
        'jspanel': 'jsPanel'
    },

    async injectAll() {
        // 增加防御性检查：如果 Parser 没填入数据，这里会直接跳过
        const libEntries = Object.entries(state.libs);
        if (libEntries.length === 0) {
            console.warn("[hLog] Warning: state.libs is empty. Did Parser.build fail?");
            return;
        }

        const raceTasks = libEntries.map(async ([libId, sets]) => {
            try {
                // 竞速逻辑...
                const candidates = Object.entries(sets).map(([sid, urls]) => ({
                    sid,
                    probeUrl: urls.find(u => /https?:\/\/[\w+\.]+\w+/.test(u)) || urls[0],
                    allUrls: urls
                }));

                const winner = await RaceEngine.run(candidates.map(c => c.probeUrl));
                const winningSet = candidates.find(c => c.probeUrl === winner.url);
                
                // 物理注入
                for (const url of winningSet.allUrls) {
                    await this.loadResource(libId, url);
                }

                // 记录成功状态
                state.winners[libId] = { set: winningSet.sid, dns: winner.domain, ms: winner.ms };
            } catch (e) {
                console.error(`[hLog] Error loading ${libId}:`, e);
            }
        });

        await Promise.all(raceTasks);
        // 强制等待一小会儿，确保 window 对象的属性挂载完成
        await new Promise(r => setTimeout(r, 100));
    },

    async loadResource(libId, url) {
        if (url.endsWith('.css')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet'; link.href = url;
            document.head.appendChild(link);
        } else {
            const mod = await import(url);
            const globalName = this.globalMapping[libId] || libId;
            // 重点修正：jspanel 的 ESM 模块通常导出为 jsPanel 对象
            window[globalName] = mod.default || mod[globalName] || mod;
            console.log(`[hLog] Attempting to mount ${globalName} to window...`);
        }
    }
};

    /**
 * Module B-4: URLFactory (带容错机制)
 */
const URLFactory = {
    generate(template, vol, page) {
        // 从 state 中实时获取最新的正则规则
        const { volReg, pageReg } = state.rules;
        let url = template;

        if (!url) return "";

        try {
            // 替换卷号
            if (volReg) {
                const vRegex = new RegExp(volReg);
                url = url.replace(vRegex, (match, p1) => match.replace(p1, vol));
            }
            // 替换页码
            if (pageReg) {
                const pRegex = new RegExp(pageReg);
                url = url.replace(pRegex, (match, p1) => match.replace(p1, page));
            }
        } catch (e) {
            console.warn("[hLog] URLFactory logic skip:", e.message);
        }
        return url;
    }
};

    const MirrorRacer = {
    async report() {
        if (!state.rules.templates.length) return alert("未发现可测速的镜像模板");

        const testVol = "01", testPage = "1";
        const tasks = state.rules.templates.map(async (tpl) => {
            const testUrl = URLFactory.generate(tpl, testVol, testPage, state.rules.volReg, state.rules.pageReg);
            const start = performance.now();
            try {
                // 使用 no-cors 避免跨域拦截
                await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
                return { hostname: new URL(tpl).hostname, ms: (performance.now() - start).toFixed(1) };
            } catch (e) {
                return { hostname: new URL(tpl).hostname, ms: "Timeout" };
            }
        });

        const results = (await Promise.all(tasks)).sort((a, b) => parseFloat(a.ms) - parseFloat(b.ms));
        
        // 记录最优镜像
        state.activeMirror = state.rules.templates.find(t => t.includes(results[0].hostname));

        // 窗口显示
        if (window.jsPanel) {
            const rows = results.map(r => `<tr><td style="padding:5px">${r.hostname}</td><td style="padding:5px;text-align:right">${r.ms}ms</td></tr>`).join('');
            jsPanel.create({
                headerTitle: '镜像响应报表',
                content: `<div style="padding:10px;background:#1a1a1a;color:#fff"><table style="width:100%">${rows}</table></div>`,
                theme: 'dark',
                contentSize: '300 200'
            });
        } else {
            console.table(results);
        }
    }
};

    const LabsParser = (md) => {
    const lines = md.split('\n');
    let inLabs = false, currentLib = null, lastSet = null;

    for (let line of lines) {
        const trim = line.trim(), indent = line.search(/\S/);
        if (trim.includes('#yggdrasiLabs')) { inLabs = true; continue; }
        if (inLabs && (trim.startsWith('# ') || trim.startsWith('##'))) { inLabs = false; break; }
        
        if (inLabs && trim.startsWith('- ')) {
            const content = trim.replace(/^- /, '');
            if (indent === 0) {
                const id = content.split(' #?<')[0].trim();
                state.libs[id] = {}; currentLib = state.libs[id];
            } else if (content.startsWith('Set') && currentLib) {
                currentLib[content] = []; lastSet = currentLib[content];
            } else if (content.startsWith('http') && lastSet) {
                lastSet.push(trim.replace(/^- /, '').replace('/master', ''));
            }
        }
    }
};

    const Core = {
        async boot() {
            try {
                // --- 第 3 场竞速：MD 配置文件本身 ---
                const mdMirrors = [
                    `https://gcore.jsdelivr.net/gh/qqvvv/qqvvv.github.io/content/9/myriaDown/allIn1.md`,
                    `https://fastly.jsdelivr.net/gh/qqvvv/qqvvv.github.io/content/9/myriaDown/allIn1.md`,
                    `https://qqvvv.github.io/9/myriaDown/allIn1.txt`,
                    `https://raw.githubusercontent.com/qqvvv/qqvvv.github.io/master/content/9/myriaDown/allIn1.md`
                ];
                
                console.log("[hLog] 正在寻找最快的配置镜像...");
                const winner = await RaceEngine.run(mdMirrors);
                const res = await fetch(`${winner.url}?t=${Date.now()}`);
                const rawMD = await res.text();

                // 解析
                Parser.build(rawMD);
                LabsParser ( rawMD );
                state.tree = Parser.flatten(Parser.activate(state.tree));

                // 库注入
                await JSLoader.injectAll();
                
                // 绑定快捷键
                window.addEventListener('keydown', (e) => {
                    if (e.altKey && e.code === 'Backslash') {
                        e.preventDefault();
                        MirrorRacer.report(); // 触发报表
                    }
                });

                console.log("[hLog] 系统就绪。最优配置源:", winner.domain);
            } catch (err) {
                console.error("[hLog] 启动崩溃:", err);
            }
        }
    };

    return { start: Core.boot, debug: () => state };
})();

hYakusho.start();