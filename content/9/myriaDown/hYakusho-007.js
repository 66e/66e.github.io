const hYakusho = (function() {
    "use strict";

    // --- 第一层：State (唯一真理来源) ---
    const state = {
        activeMirror: null,
        allStats: [], // 汇总所有竞速结果的数组
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
        let mode = null; 
        const root = { title: "Root", children: [], indent: -1 };
        const stack = [root];
        
        state.libs = {}; 
        let currentLib = null, lastSet = null;

        for (let line of lines) {
            const trim = line.trim();
            const indent = line.search(/\S/);
            if (!trim) continue;

            // 1. 更加强壮的模式识别 (忽略前后空格)
            if (trim.startsWith('#')) {
                const headerText = trim.replace(/^#+\s*/, '');
                if (headerText.includes('galleryData')) { mode = 'gallery'; continue; }
                if (headerText.includes('yggdrasiLabs')) { mode = 'labs'; continue; }
                // 遇到其他一级标题则退出当前模式
                if (trim.startsWith('# ')) { mode = null; continue; }
            }

            if (!mode) continue;

            // 2. 线性解析 Labs (JS库)
            if (mode === 'labs' && trim.startsWith('- ')) {
                const content = trim.replace(/^- /, '');
                // 根据缩进深度判断层级：0级是库ID，2级或更多是Set，更深是URL
                if (indent === 0) {
                    const id = content.split(' #?<')[0].trim();
                    state.libs[id] = {}; 
                    currentLib = state.libs[id];
                } else if (content.startsWith('Set') && currentLib) {
                    currentLib[content] = []; 
                    lastSet = currentLib[content];
                } else if (content.startsWith('http') && lastSet) {
                    lastSet.push(content);
                }
            }

            // 3. 线性解析 Gallery (画廊)
            if (mode === 'gallery' && trim.startsWith('- ')) {
                const content = trim.replace(/^- /, '');
                const tags = this.parseTags(content);
                // 这里的 indent 是核心，决定了父子关系
                while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
                const node = { title: content.split(' #?<')[0].trim(), indent, tags, children: [] };
                if (tags.anchor) state.anchors[tags.anchor] = node;
                stack[stack.length - 1].children.push(node);
                stack.push(node);
            }
        }
        state.tree = root.children;
        console.log(`[hLog] Parser.build 完成. 捕获库: ${Object.keys(state.libs).length} 个, 根节点: ${state.tree.length} 个`);
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
    showStatsPanel() {
        const rows = state.allStats.map(s => `
            <tr style="border-bottom: 1px solid #333;">
                <td style="padding:4px; font-size:12px;">[${s.type}]</td>
                <td style="padding:4px;">${s.name}</td>
                <td style="padding:4px; text-align:right; color:#0f0;">${s.ms}ms</td>
            </tr>
        `).join('');

        jsPanel.create({
            headerTitle: 'hYakusho 系统状态监控',
            theme: 'dark',
            contentSize: '350 250',
            content: `
                <div style="padding:10px; background:#111; color:#eee; font-family:monospace;">
                    <table style="width:100%; border-collapse:collapse;">
                        ${rows}
                    </table>
                </div>
            `
        });
    }
};

    const Core = {
    async boot() {
        const mdMirrors = [
            `https://gcore.jsdelivr.net/gh/qqvvv/qqvvv.github.io/content/9/myriaDown/allIn1.md`,
            `https://fastly.jsdelivr.net/gh/qqvvv/qqvvv.github.io/content/9/myriaDown/allIn1.md`,
            `https://qqvvv.github.io/9/myriaDown/allIn1.txt`,
            `https://raw.githubusercontent.com/qqvvv/qqvvv.github.io/master/content/9/myriaDown/allIn1.md`
        ];

        try {
            // 第一场竞速：配置文件
            const winner = await RaceEngine.run(mdMirrors);
            state.allStats.push({ type: 'Config', name: winner.domain, ms: winner.ms });

            const res = await fetch(`${winner.url}?t=${Date.now()}`);
            const rawMD = await res.text();

            // 解析 MD
            Parser.build(rawMD);
            // 此时 Parser 会填充 state.libs
            
            // 激活与降维 (这里会捕获正则 rules)
            const activeTree = Parser.activate(state.tree);
            state.tree = Parser.flatten(activeTree);

            // 第二场竞速：JS 库注入
            if (Object.keys(state.libs).length > 0) {
                await JSLoader.injectAll();
                // 转换 winners 到 allStats
                Object.entries(state.winners).forEach(([id, info]) => {
                    state.allStats.push({ type: 'Library', name: id, ms: info.ms, dns: info.dns });
                });
            } else {
                console.warn("[hLog] Parser 未能提取到任何 JS 库地址。");
            }

            // 第三场竞速：图片镜像 (按需手动或在此处自动触发)
            // MirrorRacer.report(); 

            // 最终汇报
            console.group("--- hYakusho 系统概览 ---");
                console.table(state.allStats);
                console.log("正则规则:", state.rules);
                console.log("画廊结构:", state.tree);
            console.groupEnd();

            // 如果 jsPanel 成功注入，自动弹窗
            if (window.jsPanel) MirrorRacer.showStatsPanel();

        } catch (err) {
            console.error("[hLog] 启动过程中断:", err);
        }
    }
};

    return { start: Core.boot, debug: () => state };
})();

hYakusho.start();