/**
 * Project: myriaDown x ゆうゆうはくしょ幽遊白書
 * Interface: ESM + Dynamic Menu
 */

const MyriaDownSalieri = (() => {
    // 1. 现代化库加载函数 (使用 await import)
    const loadLibrary = async (configs) => {
        const results = await Promise.all(configs.map(async (cfg) => {
            if (cfg.type === 'style') {
                if (!document.querySelector(`link[href="${cfg.url}"]`)) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = cfg.url;
                    document.head.appendChild(link);
                }
                return { name: cfg.name, status: 'loaded' };
            }
            // 关键改动：使用 ESM import 替换 script 插入
            try {
                const module = await import(cfg.url);
                return { name: cfg.name, module };
            } catch (e) {
                console.warn(`Fallback to legacy for ${cfg.name}`);
                // 部分传统库可能不支持直接 import，此处可根据需要增加 fallback
            }
        }));
        return results;
    };

    // 2. myriaDown 解析器 (支持 100+ 项目动态循环)
    const myriaDown = {
        parse(text) {
            const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'));
            const root = [];
            const stack = [{ indent: -1, children: root }];

            lines.forEach(line => {
                const indent = line.search(/\S/);
                const raw = line.trim().replace(/^[-+*]\s*/, '');
                
                // 提取 JSON 元数据
                const match = raw.match(/(.*?)\s*({.*})/);
                let node = { title: raw, children: [] };
                if (match) {
                    node.title = match[1].trim();
                    try { node = { ...node, ...JSON.parse(match[2]) }; } catch(e) {}
                }

                // 核心执念：处理 100+ 自动循环生成
                if (node.pages) {
                    for (let i = 1; i <= node.pages; i++) {
                        const pageNum = i.toString().padStart(3, '0');
                        node.children.push({
                            title: `Page ${pageNum}`,
                            url: this.relayRectify(node.vol, i, node.template),
                            isLeaf: true
                        });
                    }
                }

                while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
                stack[stack.length - 1].children.push(node);
                stack.push({ indent, children: node.children });
            });
            return root;
        },

        // 原实例 y 的 URL 修正逻辑映射
        relayRectify(vol, page, template) {
            const fileName = template.replace('%03d', page.toString().padStart(3, '0'));
            return `https://your-cdn.com/vol${vol}/${fileName}`;
        }
    };

    // 3. UI 逻辑：圆点触发器与响应式展示
    const setupUI = (menuData) => {
        // 使用之前完善的 setupMenuTrigger 逻辑
        const dot = document.createElement('div');
        dot.id = 'md-trigger';
        Object.assign(dot.style, {
            position: 'fixed', bottom: '20px', right: '20px',
            width: '14px', height: '14px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.3)', zIndex: '2147483647', cursor: 'pointer'
        });
        document.body.appendChild(dot);

        // 菜单容器
        const panel = document.createElement('div');
        panel.id = 'md-panel';
        // ... (省略部分 CSS，参考之前讨论的 slide-menu 样式)
        document.body.appendChild(panel);

        const renderLevel = (data, title = "Menu") => {
            panel.innerHTML = `<div class="header">${title}</div><ul></ul>`;
            const ul = panel.querySelector('ul');
            data.forEach(item => {
                const li = document.createElement('li');
                li.innerText = item.title;
                li.onclick = (e) => {
                    e.stopPropagation();
                    if (item.children && item.children.length > 0) {
                        renderLevel(item.children, item.title);
                    } else if (item.isLeaf) {
                        showImage(item.url);
                    }
                };
                ul.appendChild(li);
            });
        };

        // 4. 响应式图片展示逻辑
        const showImage = (url) => {
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                // 移动端：直接在菜单区域下方显示或覆盖
                let imgBox = document.getElementById('mobile-img-viewer');
                if (!imgBox) {
                    imgBox = document.createElement('div');
                    imgBox.id = 'mobile-img-viewer';
                    document.body.appendChild(imgBox);
                }
                imgBox.innerHTML = `<img src="${url}" style="width:100%">`;
            } else {
                // 大屏：调用 jsPanel
                if (window.jsPanel) {
                    jsPanel.create({
                        headerTitle: 'Image Viewer',
                        content: `<img src="${url}" style="width:100%">`,
                        theme: 'dark'
                    });
                }
            }
        };

        dot.onclick = () => {
            const isVisible = panel.style.display === 'block';
            panel.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) renderLevel(menuData);
        };
    };

    // 执行初始化
    const init = async () => {
        // 1. 加载依赖
        await loadLibrary([
            { name: 'jsPanelStyle', type: 'style', url: 'https://gcore.jsdelivr.net/npm/jspanel4@4.15.0/dist/jspanel.min.css' },
            { name: 'jsPanel', type: 'module', url: 'https://gcore.jsdelivr.net/npm/jspanel4@4.15.0/dist/jspanel.min.js' }
        ]);

        // 2. 获取并解析数据
        const response = await fetch('https://gcore.jsdelivr.net/gh/qqvvv/qqvvv.github.io/content/9/galleryData.md');
        const mdText = await response.text();
        const menuData = myriaDown.parse(mdText);

        // 3. 构建 UI
        setupUI(menuData);
    };

    return { init };
})();

// 启动
MyriaDownSalieri.init();