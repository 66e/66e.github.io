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
            if (tags.regExp) {
    // 只要看到标签里有 regExp，就根据 node.title 存入 rules
    if (node.title === 'volume') state.rules.volReg = tags.regExp;
    if (node.title === 'page') state.rules.pageReg = tags.regExp;
}
            
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

    /**
    * 修正后的 RaceEngine：返回所有参与者的成绩
    */
   const RaceEngine = {
    async run(urls, type = 'Default') {
        const validUrls = urls.filter(u => typeof u === 'string' && u.startsWith('http'));
        
        const tasks = validUrls.map(async (url) => {
            const start = performance.now();
            try {
                // 增加 AbortController 信号，应对页面关闭时的 fetch 报错
                await fetch(url, { method: 'HEAD', mode: 'no-cors' });
                return { 
                    type, 
                    name: new URL(url).hostname, // 统一获取 DNS
                    ms: parseFloat((performance.now() - start).toFixed(1)),
                    url: url,
                    status: '✅'
                };
            } catch (e) {
                // 如果是因为页面关闭导致的错误，不输出 log
                if (e.name !== 'AbortError') {
                    return { type, name: new URL(url).hostname, ms: 9999, url, status: '❌' };
                }
            }
        });

        const results = (await Promise.all(tasks)).filter(r => r);
        
        // 推入全量统计 (排除重复项)
        results.forEach(res => state.allStats.push(res));

        const winner = results.filter(r => r.status === '✅').sort((a, b) => a.ms - b.ms)[0];
        if (winner) winner.isWinner = true;
        return winner;
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

    /**
    * 修复 URLFactory 的调用链
    */
   const MirrorRacer = {
    // 1. 核心测速逻辑：直接测 MD 里的 mirrors 地址
    async report() {
        if (!state.rules.templates || state.rules.templates.length === 0) {
            console.warn("[hLog] 未发现镜像地址，请检查 Parser 是否成功捕获 mirrors 节点。");
            return;
        }

        console.log("[hLog] 开始图库镜像全量测速...");
        
        // 直接使用模板地址进行测速，不再生成具体的图片 URL
        // 这样既能测试连通性，又能获取最纯粹的延迟
        const winner = await RaceEngine.run(state.rules.templates, 'Gallery');
        
        if (winner) {
            state.activeMirror = winner.url;
            console.log(`[hLog] 最优镜像已锁定: ${winner.name}`);
        }

        // 测速完成后，如果监控面板已打开，则刷新它
        const activePanels = window.jsPanel?.activePanels;
        if (activePanels && typeof activePanels.get === 'function' && activePanels.get('stats-panel')) {
            this.showStatsPanel(); 
        }
    },

    // 2. 增强型显示面板
    showStatsPanel() {
        if (!window.jsPanel) return;

        // 定义三色外观
        const typeStyles = {
            'MdFile':  { bg: 'rgba(33, 150, 243, 0.15)', color: '#90caf9' },
            'Library': { bg: 'rgba(156, 39, 176, 0.15)', color: '#ce93d8' },
            'Gallery': { bg: 'rgba(255, 152, 0, 0.15)',  color: '#ffcc80' }
        };

        // 排序逻辑：先按类型(MdFile > Library > Gallery)，再按延迟
        const typeOrder = { 'MdFile': 1, 'Library': 2, 'Gallery': 3 };
        const sortedStats = [...state.allStats].sort((a, b) => {
            if (a.type !== b.type) return typeOrder[a.type] - typeOrder[b.type];
            return a.ms - b.ms;
        });

        const rows = sortedStats.map(s => {
            const style = typeStyles[s.type] || { bg: 'transparent', color: '#eee' };
            const isWinner = s.isWinner ? 'border-left: 4px solid #4caf50; background: rgba(76, 175, 80, 0.1);' : '';
            const winnerIcon = s.isWinner ? '🏆 ' : '';

            return `
                <tr style="${isWinner} border-bottom: 1px solid #222;">
                    <td style="padding:8px; background:${style.bg}; color:${style.color}; font-size:11px;">${s.type}</td>
                    <td style="padding:8px; color:#eee;">${winnerIcon}${s.name}</td>
                    <td style="padding:8px; text-align:right; font-family:monospace; color:${s.ms < 500 ? '#4caf50' : '#888'}">
                        ${s.ms === 9999 ? '<span style="color:#ff5252">FAIL</span>' : s.ms + 'ms'}
                    </td>
                </tr>
            `;
        }).join('');

        // 创建或更新面板
        const panel = window.jsPanel?.activePanels?.get?.('stats-panel');
        if (panel) {
            panel.content.innerHTML = this.getPanelHTML(rows);
        } else {
            jsPanel.create({
                id: 'stats-panel',
                headerTitle: 'hYakusho 系统概览 (Alt + \\)',
                contentSize: '500 400',
                theme: 'dark',
                content: this.getPanelHTML(rows)
            });
        }
    },

    getPanelHTML(rows) {
        return `
            <div style="background:#111; height:100%; overflow:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead style="background:#000; position:sticky; top:0; z-index:1;">
                        <tr>
                            <th style="padding:10px;text-align:left;color:#888;">类型</th>
                            <th style="padding:10px;text-align:left;color:#888;">主机节点</th>
                            <th style="padding:10px;text-align:right;color:#888;">响应</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
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

    // 1. CSS 加载器
    loadStyle(url) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`link[href="${url}"]`)) return resolve();
            const link = document.createElement('link');
            link.rel = 'stylesheet'; link.href = url;
            link.onload = () => { console.log(`[hLog] 🎨 CSS Loaded: ${url.split('/').pop()}`); resolve(); };
            link.onerror = reject;
            document.head.appendChild(link);
        });
    },

    // 2. JS 加载器 (含全局变量守卫)
    async loadScript(libId, url) {
        try {
            const mod = await import(url);
            const globalName = this.globalMapping[libId] || libId;
            window[globalName] = mod.default || mod[globalName] || mod;
            
            // 守卫轮询
            const start = Date.now();
            while (!window[globalName] && Date.now() - start < 3000) {
                await new Promise(r => requestAnimationFrame(r));
            }
            if (window[globalName]) {
                console.log(`[hLog] 📜 JS Executed: ${globalName}`);
            } else {
                console.warn(`[hLog] ⚠️ ${globalName} imported but window object missing.`);
            }
        } catch (e) {
            console.error(`[hLog] ❌ Script Load Fail: ${url}`, e);
            throw e; // 抛出异常以便外层捕获
        }
    },

    // 3. 智能分发器 (正则判断)
    async loadResource(libId, url) {
        // 匹配 .css 或 .css?v=...
        if (/\.css(\?.*)?$/i.test(url)) {
            await this.loadStyle(url);
        } else {
            await this.loadScript(libId, url);
        }
    },

    // 4. 核心注入逻辑 (Set 模式)
    async injectAll() {
        const tasks = Object.entries(state.libs).map(async ([libId, sets]) => {
            // A. 准备竞速候选者 (每个 Set 选一个探针)
            const candidates = Object.entries(sets).map(([setId, urls]) => {
                // 优先选 JS 作为探针，如果没有 JS 则选第一个
                const probeUrl = urls.find(u => !/\.css/i.test(u)) || urls[0];
                return { setId, probeUrl, allFiles: urls };
            });

            // B. 探针竞速
            const winnerResult = await RaceEngine.run(candidates.map(c => c.probeUrl), 'Library');

            // C. 胜者全量加载
            if (winnerResult) {
                // 找到赢家对应的完整 Set
                const winningSet = candidates.find(c => c.probeUrl === winnerResult.url);
                
                if (winningSet) {
                    // 记录胜利信息
                    state.winners[libId] = { dns: winnerResult.name, ms: winnerResult.ms, set: winningSet.setId };
                    
                    // 并行加载该 Set 内的所有文件 (CSS 和 JS 同时下载)
                    await Promise.all(winningSet.allFiles.map(url => this.loadResource(libId, url)));
                }
            }
        });

        await Promise.all(tasks);
    }
};

    const UI = {
    panel: null,
    
    injectStyles() {
        const css = `
            #h-orb { position: fixed; right: 20px; bottom: 20px; width: 48px; height: 48px; border-radius: 50%; background: rgba(80, 80, 80, 0.6); color: white; z-index: 1049; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; backdrop-filter: blur(4px); }
            .md-sidebar { position: fixed; top: 0; right: 0; bottom: 0; width: 320px; background: #121212; z-index: 19; transform: translateX(100%); transition: transform 0.3s ease; overflow-y: auto; color: #eee; border-left: 1px solid #333; font-family: sans-serif; }
            .md-sidebar.active { transform: translateX(0); }
            .md-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 18; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
            .md-backdrop.active { opacity: 1; pointer-events: auto; }
            .u-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px; }
            .u-card { background: #1e1e1e; border: 1px solid #333; text-align: center; cursor: pointer; overflow: hidden; }
            .u-thumb { width: 100%; aspect-ratio: 3/4; background-size: cover; background-position: center; background-color: #222; }
            .u-label { font-size: 11px; padding: 6px; color: #bbb; }
            .u-btn { padding: 14px 18px; border-bottom: 1px solid #333; cursor: pointer; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
            .u-header { padding: 15px; background: #1a1a1a; font-weight: bold; border-bottom: 1px solid #333; color: #ea580c; }
        `;
        const style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);
    },

    getMeta(node) {
        const tag = node.tags?.meta || "";
        return {
            last: parseInt(tag.match(/lastPic=(\d+)/)?.[1] || 20),
            cover: tag.match(/coverPic=(\d+)/)?.[1] || "1"
        };
    },

    // 核心下钻逻辑
    renderSidebar(level = 0, params = {}) {
        const sidebar = document.querySelector('.md-sidebar');
        let html = '';

        // --- LEVEL 0: ROOT 菜单 ---
        if (level === 0) {
            html = `<div class="u-header">L0 Specifications</div>`;
            html += `<div class="u-btn" onclick="window.UI.renderSidebar(1)">📂 Root <span style="color:#666">❯</span></div>`;
            html += `<div class="u-btn" style="color:#ff9800" onclick="window.MirrorRacer.showStatsPanel()">⚙ 系统概览 (Debug)</div>`;
        } 
        
        // --- LEVEL 1: 书库 (第一本漫画, apocrypha) ---
        else if (level === 1) {
            const rootNode = state.tree[0];
            const mangas = rootNode.children || [];
            html = `<div class="u-header">L1 ${rootNode.title}</div>`;
            html += `<div class="u-btn" style="color:#2196F3" onclick="window.UI.renderSidebar(0)">❮ 返回 Root</div>`;
            html += `<div class="u-grid">`;
            mangas.forEach((m, mIdx) => {
                // 封面逻辑：取该漫画下第一个有效卷的补正页
                const firstVol = m.children?.find(c => c.isMenuNode !== false);
                const meta = firstVol ? this.getMeta(firstVol) : {cover: "1"};
                const coverUrl = URLFactory.generate(state.activeMirror, "01", meta.cover, state.rules.volReg, state.rules.pageReg);
                
                html += `
                    <div class="u-card" onclick="window.UI.renderSidebar(2, {mIdx: ${mIdx}, title: '${m.title}'})">
                        <div class="u-thumb" style="background-image: url('${coverUrl}')"></div>
                        <div class="u-label">${m.title}</div>
                    </div>`;
            });
            html += `</div>`;
        }

        // --- LEVEL 2: 19卷数字目录 (过滤非菜单节点) ---
        else if (level === 2) {
            const mangaNode = state.tree[0].children[params.mIdx];
            // 过滤掉 isMenuNode 为 false 的数据目录
            const vols = (mangaNode.children || []).filter(c => c.isMenuNode !== false);
            
            html = `<div class="u-header">L2 ${params.title}</div>`;
            html += `<div class="u-btn" style="color:#2196F3" onclick="window.UI.renderSidebar(1)">❮ 返回书库</div>`;
            html += `<div class="u-grid">`;
            vols.forEach((vol) => {
                // 在 mangaNode.children 中的原始索引
                const originalVIdx = mangaNode.children.indexOf(vol);
                const meta = this.getMeta(vol);
                const volNum = vol.title.match(/\d+/)?.[0] || "01";
                const coverUrl = URLFactory.generate(state.activeMirror, volNum, meta.cover, state.rules.volReg, state.rules.pageReg);
                
                html += `
                    <div class="u-card" onclick="window.UI.handleVolClick(${params.mIdx}, ${originalVIdx})">
                        <div class="u-thumb" style="background-image: url('${coverUrl}')"></div>
                        <div class="u-label">${vol.title}</div>
                    </div>`;
            });
            html += `</div>`;
        }

        // --- LEVEL 3: 卷内图片流 (移动端) ---
        else if (level === 3) {
            const vol = state.tree[0].children[params.mIdx].children[params.vIdx];
            html = `<div class="u-header">L3 ${vol.title} (${this.getMeta(vol).last}P)</div>`;
            html += `<div class="u-btn" style="color:#2196F3" onclick="window.UI.renderSidebar(2, {mIdx: ${params.mIdx}, title: '卷列表'})">❮ 返回卷列表</div>`;
            const urls = this.generateUrlArray(vol);
            html += `<div class="u-grid">`;
            urls.forEach((url, i) => {
                html += `
                    <div class="u-card" onclick="window.UI.openGallery(${params.mIdx}, ${params.vIdx}, ${i})">
                        <img src="${url}" style="width:100%; display:block;" loading="lazy">
                        <div class="u-label">P.${i+1}</div>
                    </div>`;
            });
            html += `</div>`;
        }

        sidebar.innerHTML = html;
        sidebar.scrollTop = 0;
    },

    handleVolClick(mIdx, vIdx) {
        if (state.isMobile) {
            this.renderSidebar(3, { mIdx, vIdx });
        } else {
            this.launchDesktopReader(mIdx, vIdx);
        }
    },

    generateUrlArray(volNode) {
        const meta = this.getMeta(volNode);
        const volNum = volNode.title.match(/\d+/)?.[0] || "01";
        // 自动生成从 1 到 lastPic 的数组
        return Array.from({ length: meta.last }, (_, i) => 
            URLFactory.generate(state.activeMirror, volNum, String(i+1), state.rules.volReg, state.rules.pageReg)
        );
    },

    launchDesktopReader(mIdx, vIdx) {
        const vol = state.tree[0].children[mIdx].children[vIdx];
        const urls = this.generateUrlArray(vol);
        const gridHtml = `
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(110px, 1fr)); gap:10px; padding:15px; background:#000; min-height:100%;">
                ${urls.map((u, i) => `
                    <div class="u-card" onclick="window.UI.openGallery(${mIdx}, ${vIdx}, ${i})">
                        <img src="${u}" style="width:100%; display:block;" loading="lazy">
                        <div class="u-label">P.${i+1}</div>
                    </div>
                `).join('')}
            </div>`;
        
        jsPanel.create({ headerTitle: vol.title, contentSize: '800 600', theme: 'dark', content: gridHtml });
        this.toggleDrawer(false);
    },

    openGallery(mIdx, vIdx, index) {
        const vol = state.tree[0].children[mIdx].children[vIdx];
        const urls = this.generateUrlArray(vol);
        if (window.Fancybox) {
            window.Fancybox.show(urls.map(src => ({ src, type: "image" })), { startIndex: index, infinite: false });
        }
    },

    toggleDrawer(force) {
        const isOpen = force ?? !document.querySelector('.md-sidebar').classList.contains('active');
        document.querySelector('.md-sidebar').classList.toggle('active', isOpen);
        document.querySelector('.md-backdrop').classList.toggle('active', isOpen);
    },

    init() {
        window.UI = this;
        window.MirrorRacer = MirrorRacer;
        this.injectStyles();
        const bd = document.createElement('div'); bd.className = 'md-backdrop'; bd.onclick = () => this.toggleDrawer(false);
        const sb = document.createElement('div'); sb.className = 'md-sidebar';
        const orb = document.createElement('div'); orb.id = 'h-orb'; orb.innerHTML = '⚙'; orb.onclick = () => this.toggleDrawer();
        document.body.append(bd, sb, orb);
        this.renderSidebar(0);
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
            // --- Core.boot 内部推荐的尾部逻辑 ---
            await JSLoader.injectAll(); // 等待所有 Set 加载完成

            // 此时 Library 的 stats 已经全了，开始跑 Gallery 测速
            // 注意：report 内部现在会自动调用 RaceEngine 并填充 Gallery stats
            await MirrorRacer.report(); 

            // 最终展现：确保 jsPanel 真的存在
            if (window.jsPanel) {
                console.log("[hLog] 所有竞速完成，弹出全量仪表盘。");
            } else {
                // 如果 jsPanel 没出来，至少在控制台给你看结果
                console.table(state.allStats);
            }

            UI.init();

        } catch (err) {
            if (err.message.includes('shutting down')) return; // 忽略静默错误
            console.error("[hLog] 启动过程中断:", err);
        }
    }
};

    return { start: Core.boot, debug: () => state };
})();

hYakusho.start();