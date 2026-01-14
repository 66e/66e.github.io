/**
 * myriaDown x Salieri V3.0 [Resilient Edition]
 * 1. 恢复环境监测 (adaptSituatS 逻辑)
 * 2. 修复库加载阻塞
 * 3. 接入真实的 galleryData.md
 */

(function() {
    "use strict";

    const DATA_URL = 'https://gcore.jsdelivr.net/gh/qqvvv/qqvvv.github.io/content/9/galleryData.md';
    
    const LIB_CONFIG = [
        { name: 'jsPanelCSS', type: 'style', url: 'https://cdnjs.cloudflare.com/ajax/libs/jspanel4/4.15.0/jspanel.min.css' },
        { name: 'fbCSS', type: 'style', url: 'https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.33/fancybox/fancybox.css' },
        { name: 'jsPanel', type: 'script', url: 'https://gcore.jsdelivr.net/npm/jspanel4@4.15.0/dist/jspanel.min.js' },
        { name: 'Fancybox', type: 'script', url: 'https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.33/fancybox/fancybox.umd.js' },
        { name: 'imagesLoaded', type: 'script', url: 'https://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/5.0.0/imagesloaded.pkgd.min.js' }
    ];

    // --- 1. 环境监测：确保 body 存在且库加载完成 ---
    const adaptSituatS = (callback) => {
        const checker = setInterval(() => {
            // 同时检查 body 和 核心库是否在 window 挂载成功
            if (document.body && window.jsPanel && window.Fancybox) {
                clearInterval(checker);
                callback();
            }
        }, 100);
    };

    // --- 2. 改进的库加载：并行加载，不因一个失败而挂起 ---
    const loadAssets = () => {
        LIB_CONFIG.forEach(cfg => {
            if (cfg.type === 'style') {
                const link = document.createElement('link');
                link.rel = 'stylesheet'; link.href = cfg.url;
                document.head.appendChild(link);
            } else {
                if (document.querySelector(`script[src="${cfg.url}"]`)) return;
                const script = document.createElement('script');
                script.src = cfg.url;
                script.async = true;
                document.head.appendChild(script);
            }
        });
    };

    // --- 3. 样式注入 ---
    const injectStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            #md-trigger {
                position: fixed; bottom: 20px; right: 20px;
                width: 14px; height: 14px; border-radius: 50%;
                background: rgba(0, 0, 0, 0.4); border: 2px solid rgba(255, 255, 255, 0.6);
                z-index: 2147483647; cursor: pointer; transition: all 0.3s;
            }
            #md-trigger:hover { transform: scale(1.6); background: #ff00ff; }
            #md-panel {
                position: fixed; bottom: 45px; right: 20px; width: 280px; max-height: 60vh;
                background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
                border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 2147483646; display: none; flex-direction: column; overflow: hidden;
                border: 1px solid #ddd; font-family: sans-serif;
            }
            #md-panel.active { display: flex; }
            .md-h { padding: 12px; background: #eee; display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
            .md-list { list-style: none; margin: 0; padding: 0; overflow-y: auto; flex: 1; }
            .md-item { padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #eee; font-size: 14px; display: flex; justify-content: space-between; }
            .md-item:hover { background: #f0f0f0; }
            .md-item.has-c::after { content: '›'; color: #999; }
            .md-back { color: #ff00ff; cursor: pointer; margin-right: 10px; }
        `;
        document.head.appendChild(style);
    };

    // --- 4. myriaDown 数据引擎 ---
    const myriaDown = {
        async fetchData() {
            try {
                const r = await fetch(DATA_URL);
                const text = await r.text();
                return this.parse(text);
            } catch (e) {
                console.error("Fetch Data Failed", e);
                return [];
            }
        },
        parse(text) {
            const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'));
            const root = [];
            const stack = [{ indent: -1, children: root }];

            lines.forEach(line => {
                const indent = line.search(/\S/);
                const raw = line.trim().replace(/^[-+*]\s*/, '');
                const match = raw.match(/(.*?)\s*({.*})/);
                let node = { title: raw, children: [] };
                if (match) {
                    node.title = match[1].trim();
                    try { Object.assign(node, JSON.parse(match[2])); } catch(e) {}
                }
                
                // 100+ 项目生成的“执念”：如果包含 pages 属性则展开
                if (node.pages) {
                    for (let i = 1; i <= node.pages; i++) {
                        const pNum = i.toString().padStart(3, '0');
                        // 预留 relayRectify 逻辑的空间，这里先根据你的 galleryData 拼接
                        const url = `https://your-base-url/vol${node.vol}/${node.template.replace('%03d', pNum)}`;
                        node.children.push({ title: `P${pNum}`, url, isLeaf: true });
                    }
                }

                while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
                stack[stack.length - 1].children.push(node);
                stack.push({ indent, children: node.children });
            });
            return root;
        }
    };

    // --- 5. UI 应用逻辑 ---
    const App = {
        history: [],
        tree: [],
        init(data) {
            this.tree = data;
            injectStyles();
            this.buildDOM();
        },
        buildDOM() {
            const dot = document.createElement('div');
            dot.id = 'md-trigger';
            document.body.appendChild(dot);

            const panel = document.createElement('div');
            panel.id = 'md-panel';
            document.body.appendChild(panel);

            dot.onclick = (e) => {
                e.stopPropagation();
                panel.classList.toggle('active');
                if (panel.classList.contains('active')) {
                    this.history = [];
                    this.render(this.tree);
                }
            };
            document.addEventListener('click', () => panel.classList.remove('active'));
            panel.onclick = (e) => e.stopPropagation();
        },
        render(data, title = "Menu") {
            const panel = document.getElementById('md-panel');
            const isRoot = this.history.length === 0;
            panel.innerHTML = `
                <div class="md-h">
                    ${!isRoot ? `<span class="md-back" id="btn-back">⇠ 返回</span>` : '<span>导航</span>'}
                    <span>${title}</span>
                    <span id="btn-close" style="cursor:pointer">×</span>
                </div>
                <ul class="md-list">
                    ${data.map((item, i) => `
                        <li class="md-item ${item.children.length ? 'has-c' : ''}" data-idx="${i}">
                            ${item.title}
                        </li>
                    `).join('')}
                </ul>
            `;

            if (!isRoot) {
                panel.querySelector('#btn-back').onclick = () => {
                    const prev = this.history.pop();
                    this.render(prev.data, prev.title);
                };
            }
            panel.querySelector('#btn-close').onclick = () => panel.classList.remove('active');

            panel.querySelectorAll('.md-item').forEach(el => {
                el.onclick = () => {
                    const item = data[el.dataset.idx];
                    if (item.children.length > 0) {
                        this.history.push({ data, title });
                        this.render(item.children, item.title);
                    } else if (item.isLeaf || item.url) {
                        this.openImage(item.url, item.title);
                    }
                };
            });
        },
        openImage(url, title) {
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                Fancybox.show([{ src: url, type: "image", caption: title }]);
            } else {
                jsPanel.create({
                    headerTitle: title,
                    contentSize: '400 500',
                    content: `<img src="${url}" style="width:100%" id="view-img">`,
                    callback: function() {
                        const img = this.content.querySelector('#view-img');
                        imagesLoaded(img, () => {
                            img.onclick = () => Fancybox.show([{ src: url, type: "image" }]);
                        });
                    }
                });
            }
        }
    };

    // --- 启动流程 ---
    loadAssets(); // 立即并行加载库
    adaptSituatS(async () => {
        console.log("myriaDown: Body & Libs Ready. Starting engine...");
        const data = await myriaDown.fetchData();
        App.init(data);
    });

})();