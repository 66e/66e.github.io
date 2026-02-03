/**
 * hYakusho-0052: 核心引导与泛用竞速架构
 */
const hYakusho = (function() {
    "use strict";

    const state = {
        isMobile: window.innerWidth <= 768,
        rawMD: "",
        tree: [],
        anchors: {},
        libs: {},
        rules: { volReg: "", pageReg: "", templates: [] },
        winners: {}
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

        // --- [在 hYakusho 闭包内的 Core.boot 中更新] ---
async boot() {
    if (this.isStarted) return;
    this.isStarted = true;

    try {
        const res = await fetch(`https://raw.githubusercontent.com/qqvvv/qqvvv.github.io/master/content/9/myriaDown/allIn1.md?t=${Date.now()}`);
        const rawMD = await res.text();

        await fetchMD(); // FROM_hYakusho-002
        await setupEnv(); // 测速并准备库 FROM_hYakusho-002

        // 1. 数据解析 (填充 state.libs 和 state.tree)
        Parser.build(rawMD);
        state.tree = Parser.flatten(Parser.activate(state.tree));

        // 2. 【核心步骤】执行库注入 (jsPanel 等在此处加载)
        await JSLoader.injectAll();

        // 3. 绑定快捷键
        this.bindHotkey();

        console.log("[hLog] 🚀 Environment initialized. All libraries and data ready.");
    } catch (err) {
        console.error("[hLog] Boot failed:", err);
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

        // --- [在 Core 模块中更新 toggleDebug] ---
toggleDebug() {
    if (window.jsPanel) {
        // 如果已存在则置顶或关闭，此处演示直接创建报表
        const existing = document.querySelector('.jsPanel-debug');
        if (existing) {
            existing.remove(); // 再次按下切换关闭
        } else {
            // 调用之前编写的 MirrorRacer 报表逻辑
            // 确保 MirrorRacer 也在闭包内或者 state 能够访问
            MirrorRacer.report(state.rules.templates, {
                vol: "01", page: "1",
                vReg: state.rules.volReg, pReg: state.rules.pageReg
            });
        }
    } else {
        console.table(state.winners);
        alert("jsPanel 加载失败，请查看控制台 Winners 表格。");
    }
}
    };

    // --- [模块 A1: 数据获取] ---FROM_hYakusho-002
    const fetchMD = async () => {
        console.log("[hLog] Fetching MD...");
        const url = 'https://raw.githubusercontent.com/qqvvv/qqvvv.github.io/master/content/9/myriaDown/allIn1.md';
        const res = await fetch(`${url}?t=${Date.now()}`);
        state.rawMD = await res.text();
    };

    // --- [模块 A2: 实验室解析与镜像竞速] ---FROM_hYakusho-002
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

const MirrorRacer = {};

/**
 * 扩展 MirrorRacer: 报表与可视化模块
 */
MirrorRacer.report = async function(templates, config) {
    console.log("🚀 竞速开始，请稍候...");
    
    // 1. 执行所有镜像的测速
    const results = await Promise.all(templates.map(async (tpl) => {
        const url = this.generate(tpl, config.vol, config.page, config.vReg, config.pReg);
        if (!url) return { hostname: '无效正则', ms: Infinity, status: 'Error' };
        
        const start = performance.now();
        try {
            const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
            return {
                hostname: new URL(url).hostname,
                ms: parseFloat((performance.now() - start).toFixed(1)),
                status: 'Success'
            };
        } catch (e) {
            return { hostname: new URL(url).hostname, ms: 9999, status: 'Failed' };
        }
    }));

    // 2. 按响应时间升序排列
    const sorted = results.sort((a, b) => a.ms - b.ms);

    // 3. 构建 HTML 表格内容
    const tableRows = sorted.map((item, index) => `
        <tr style="background: ${index === 0 ? 'rgba(0,255,0,0.1)' : 'transparent'}; border-bottom: 1px solid #444;">
            <td style="padding: 8px;">${index + 1}</td>
            <td style="padding: 8px;">${item.hostname}</td>
            <td style="padding: 8px; color: ${item.ms < 200 ? '#4caf50' : '#ff9800'}; font-family: monospace;">
                ${item.ms === 9999 ? 'Timeout' : item.ms + 'ms'}
            </td>
        </tr>
    `).join('');

    const tableHTML = `
        <div style="padding: 15px; background: #222; color: #eee; height: 100%;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="border-bottom: 2px solid #666;">
                        <th style="padding: 8px;">Rank</th>
                        <th style="padding: 8px;">Hostname</th>
                        <th style="padding: 8px;">Latency</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
            <p style="font-size: 12px; margin-top: 15px; color: #888;">* 基于 HEAD 请求测得的延迟</p>
        </div>
    `;

    // 4. 评估显示方式：jsPanel 是更好的选择
    if (window.jsPanel) {
        jsPanel.create({
            headerTitle: 'Mirror Performance Report',
            theme: 'dark',
            contentSize: '400 300',
            content: tableHTML,
            callback: function() {
                this.content.style.padding = '0';
            }
        });
    } else {
        // 退而求其次显示在控制台
        console.table(sorted);
    }

    return sorted[0]; // 依然返回最优解
};

    /**
 * JSLoader: 负责执行库的注入与全局挂载
 */
const JSLoader = {
    // 适配库的全局命名空间 (库 ID : 挂载到 window 的名称)
    globalMapping: {
        'fancyapps-ui': 'Fancybox',
        'imagesloaded': 'imagesLoaded',
        'jspanel': 'jsPanel'
    },

    async injectAll() {
        const raceTasks = Object.entries(state.libs).map(async ([libId, sets]) => {
            try {
                // 1. 调用 RaceEngine 针对每个 Set 的第一个有效 URL 进行竞速
                const candidates = Object.entries(sets).map(([sid, urls]) => ({
                    sid,
                    probeUrl: urls.find(u => /https?:\/\/[\w+\.]+\w+/.test(u)) || urls[0],
                    allUrls: urls
                }));

                const winner = await RaceEngine.run(candidates.map(c => c.probeUrl));
                
                // 2. 找到胜出的 Set ID 和完整 URL 列表
                const winningSet = candidates.find(c => c.probeUrl === winner.url);
                state.winners[libId] = { set: winningSet.sid, dns: winner.domain, ms: winner.ms };

                // 3. 执行物理注入
                for (const url of winningSet.allUrls) {
                    await this.loadResource(libId, url);
                }
                
                console.log(`[hLog] ✅ ${libId} loaded via ${winner.domain} (${winner.ms}ms)`);
            } catch (e) {
                console.error(`[hLog] ❌ Failed to load library: ${libId}`, e);
            }
        });

        await Promise.all(raceTasks);
    },

    async loadResource(libId, url) {
        if (url.endsWith('.css')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            document.head.appendChild(link);
        } else {
            // 使用 ESM 动态导入
            const mod = await import(url);
            const globalName = this.globalMapping[libId] || libId;
            // 尝试多种挂载方式以兼容不同打包格式
            window[globalName] = mod.default || mod[globalName] || mod;
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