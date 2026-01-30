/**
 * Project: yuyuH - v0.8.8 [Structural Calibration]
 * Fixes: Fixed FAB, Tiered Nav, Gallery Mirrors, Dynamic Z-Index
 */

(async () => {
    "use strict";

    let CONFIG = {
        mirrors: [], // 全局库镜像
        galleryMirrors: [], // 图片镜像
        theme: 'primary',
        autoNavFirst: 0,
        loadingGif: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/loading.gif'
    };

    const state = { tree: [], history: [], menuOn: false, isMobile: window.innerWidth <= 768, startX: 0, fancyOpen: false };

    const UrlFactory = {
        handleError(img) {
            // 优先尝试 allInOne 中定义的 ## Mirrors
            let attempt = 0;
            const originalSrc = img.src;
            
            img.onerror = () => {
                if (attempt < CONFIG.galleryMirrors.length) {
                    // 提取文件名，例如 97.jpg
                    const fileName = originalSrc.split('/').pop();
                    const volPath = originalSrc.split('/').slice(-2, -1)[0]; // 提取卷号
                    
                    // 这里假设镜像结构相似，仅作演示，建议根据实际镜像结构微调
                    img.src = CONFIG.galleryMirrors[attempt]; 
                    attempt++;
                } else {
                    img.onerror = null;
                    img.style.filter = "grayscale(1) opacity(0.3)";
                }
            };
        }
    };

    const UI = {
        injectStyles() {
            const s = document.createElement('style');
            s.textContent = `
                #y-dot { position:fixed; bottom:20px; right:20px; width:16px; height:16px; border-radius:50%; background:rgba(80,80,80,0.8); border:2px solid #fff; z-index:2001; cursor:pointer; }
                
                #y-menu { position:fixed; bottom:45px; right:20px; width:330px; height:70vh; max-height:550px; background:#1a1a1a; border-radius:16px; display:none; flex-direction:column; z-index:1000; border:1px solid #333; overflow:hidden; touch-action: pan-y; }
                #y-menu.active { display:flex; }
                
                .y-h { flex-shrink:0; height:45px; background:#252525; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 15px; justify-content:space-between; }
                .y-back-btn { color:#ff00ff; font-size:12px; font-weight:bold; cursor:pointer; padding:10px 5px; }

                .y-viewport { flex:1; overflow-y:auto; background:#111; position:relative; }
                .y-list { list-style:none; margin:0; padding:10px; display:grid; grid-template-columns:1fr 1fr; gap:10px; }
                
                .y-progress-bar { position:absolute; top:0; left:0; height:2px; background:#ff00ff; width:0; transition:width 0.3s; z-index:11; }

                /* 修正 FAB：相对于 #y-menu 绝对定位，不再随滚动条移动 */
                #y-fab-back { position:absolute; bottom:20px; right:20px; background:#ff00ff; color:#fff; width:40px; height:40px; border-radius:50%; display:none; align-items:center; justify-content:center; box-shadow:0 4px 15px rgba(0,0,0,0.6); cursor:pointer; z-index:100; font-weight:bold; font-size:20px; }
                
                .y-item { padding:10px; cursor:pointer; background:#1e1e1e; border-radius:8px; border:1px solid #2a2a2a; display:flex; flex-direction:column; align-items:center; gap:5px; }
                .y-item img { height:80px; width:100%; object-fit:contain; opacity:0; transition:opacity 0.4s; background: transparent url('${CONFIG.loadingGif}') no-repeat center; background-size:16px; }
                .y-item span { font-size:11px; color:#fff; text-align:center; }

                /* Fancybox 桌面版页码颜色修正 */
                .fancybox__caption { color: #eee !important; text-align: center !important; }
                
                /* 动画 */
                .slide-forward { animation: y-slideInRight 0.3s forwards; }
                .slide-backward { animation: y-slideInLeft 0.3s forwards; }
                @keyframes y-slideInRight { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes y-slideInLeft { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `;
            document.head.appendChild(s);
        },

        render(data, title = "书库列表", dir = 'forward') {
            const menu = document.getElementById('y-menu');
            const isRoot = state.history.length === 0;

            // 结构：Header + Viewport + FAB(处于外层)
            menu.innerHTML = `
                <div class="y-h">
                    <span class="y-back-btn" id="y-top-back">${isRoot ? '⇠ CLOSE' : '⇠ BACK'}</span>
                    <span style="font-size:12px; font-weight:bold; color:#eee; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${title}</span>
                    <span style="width:40px"></span>
                </div>
                <div class="y-viewport" id="y-scroll-target">
                    <div class="y-progress-bar" id="y-main-progress"></div>
                    <ul class="y-list ${dir === 'forward' ? 'slide-forward' : 'slide-backward'}" id="y-list-ul"></ul>
                </div>
                <div id="y-fab-back">⇠</div>
            `;
            
            const listUl = menu.querySelector('#y-list-ul');
            const fab = menu.querySelector('#y-fab-back');
            const progressBar = menu.querySelector('#y-main-progress');

            data.forEach(item => {
                const li = document.createElement('li');
                li.className = 'y-item';
                li.innerHTML = `<img src="${item.url || ''}"><span>${item.title}</span>`;
                li.onclick = (e) => {
                    e.stopPropagation();
                    if(item.children && item.children.length) {
                        // 如果是移动端或者是书名级（没有vol属性），则进入下一级
                        if(state.isMobile || !item.vol) {
                            state.history.push({data, title});
                            UI.render(item.children, item.title, 'forward');
                        } else {
                            this.openDesktopPanel(item);
                        }
                    } else this.launchFancybox(item, data);
                };
                listUl.appendChild(li);
            });

            imagesLoaded(listUl).on('progress', (instance, image) => {
                progressBar.style.width = (instance.progressedCount / instance.images.length) * 100 + '%';
                if (image.isLoaded) image.img.style.opacity = "1";
                else UrlFactory.handleError(image.img);
            }).on('done', () => {
                setTimeout(() => progressBar.style.width = '0', 400);
            });

            const goBack = (e) => {
                e.stopPropagation();
                if(isRoot) toggleMenu(false);
                else {
                    const last = state.history.pop();
                    UI.render(last.data, last.title, 'backward');
                }
            };

            menu.querySelector('#y-top-back').onclick = goBack;
            fab.onclick = goBack;

            // 智能 FAB 显示逻辑：仅在滚动容器高度超过一定值且在中线以下时显示
            const scrollTarget = menu.querySelector('#y-scroll-target');
            menu.onpointermove = (e) => {
                const rect = menu.getBoundingClientRect();
                const relativeY = e.clientY - rect.top;
                fab.style.display = (relativeY > rect.height / 2 && scrollTarget.scrollHeight > rect.height) ? 'flex' : 'none';
            };
        },

        openDesktopPanel(volNode) {
            jsPanel.create({
                headerTitle: volNode.title,
                contentSize: '850 600',
                theme: CONFIG.theme,
                zIndex: 1500,
                content: `<div class="y-panel-container">${volNode.children.map((p, idx) => `<div class="y-panel-item" data-idx="${idx}"><img src="${p.url}"><span>${p.title}</span></div>`).join('')}</div>`,
                callback: function() {
                    imagesLoaded(this.content).on('progress', (instance, image) => {
                        if (image.isLoaded) image.img.style.opacity = "1";
                        else UrlFactory.handleError(image.img);
                    });
                    this.content.querySelectorAll('.y-panel-item').forEach(el => {
                        el.onclick = () => UI.launchFancybox(volNode.children[el.dataset.idx], volNode.children);
                    });
                    // 点击窗口时，降低菜单 z-index
                    this.addEventListener('pointerdown', () => { document.getElementById('y-menu').style.zindex = "1000"; });
                }
            });
        },

        launchFancybox(item, siblings) {
            state.fancyOpen = true;
            Fancybox.show(siblings.map(s => ({ src: s.url, type: "image", caption: s.title })), { 
                startIndex: siblings.indexOf(item),
                on: { destroy: () => state.fancyOpen = false }
            });
        }
    };

    const allInOneParser = {
        async load(url) {
            const res = await fetch(url);
            const text = await res.text();
            const lines = text.split('\n');
            let section = '';
            const root = [];
            const stack = [{ indent: -1, children: root }];

            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('# CONFIG')) { section = 'CONFIG'; return; }
                if (trimmed.startsWith('# GALLERY')) { section = 'GALLERY'; return; }

                if (section === 'CONFIG') {
                    if (trimmed.includes('autoNavFirst')) {
                        const val = trimmed.split(':')[1];
                        CONFIG.autoNavFirst = val ? parseInt(val.trim()) : 0;
                    }
                    if (trimmed.includes('jsPanelTheme')) CONFIG.theme = trimmed.split('###')[1]?.trim() || 'primary';
                } else if (section === 'GALLERY') {
                    if (trimmed.startsWith('## Mirrors')) return; // 标记位
                    if (trimmed.startsWith('http')) { CONFIG.galleryMirrors.push(trimmed); return; }
                    
                    if (trimmed) {
                        const indent = line.search(/\S/);
                        const raw = trimmed.replace(/^[-+*]\s*/, '');
                        const match = raw.match(/(.*?)\s*({.*})/);
                        let node = { title: raw, children: [] };
                        if (match) {
                            node.title = match[1].trim();
                            try { Object.assign(node, JSON.parse(match[2])); } catch(e) {}
                        }
                        if (node.vol) {
                            const vStr = node.vol.toString().padStart(2, '0');
                            const base = `https://gcore.jsdelivr.net/gh/6cc/c/m/y/${vStr}/`;
                            if (node.list) {
                                node.list.forEach(p => node.children.push({ title: `P${p.padStart(3,'0')}`, url: base + p + '.jpg' }));
                            } else {
                                for (let p=1; p<=(node.cnt||0); p++) {
                                    node.children.push({ title: `P${p.toString().padStart(3,'0')}`, url: base + p + '.jpg' });
                                }
                            }
                        }
                        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
                        stack[stack.length - 1].children.push(node);
                        stack.push({ indent, children: node.children });
                    }
                }
            });
            return root;
        }
    };

    await (async () => {
        ['https://gcore.jsdelivr.net/gh/Flyer53/jsPanel4/es6module/jspanel.min.css','https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.css'].forEach(u => {
            const l = document.createElement('link'); l.rel='stylesheet'; l.href=u; document.head.appendChild(l);
        });
        const [mP, mF, mI] = await Promise.all([
            import('https://gcore.jsdelivr.net/gh/Flyer53/jsPanel4/es6module/jspanel.min.js'),
            import('https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.esm.js'),
            import('https://esm.sh/imagesloaded@5.0.0')
        ]);
        window.jsPanel = mP.jsPanel; window.Fancybox = mF.Fancybox; window.imagesLoaded = mI.default;
    })();

    state.tree = await allInOneParser.load('https://gcore.jsdelivr.net/gh/qqvvv/qqvvv.github.io/content/9/myriaDown/allInOne-03.md');
    UI.injectStyles();
    
    const dot = document.createElement('div'); dot.id = 'y-dot'; document.body.appendChild(dot);
    const menu = document.createElement('div'); menu.id = 'y-menu'; document.body.appendChild(menu);

    // 抢占式 z-index
    menu.addEventListener('pointerdown', () => { menu.style.zIndex = "2000"; });

    const toggleMenu = (val) => {
        state.menuOn = val;
        menu.classList.toggle('active', val);
        if(val && state.history.length === 0) {
            UI.render(state.tree, "书库根目录");
            if (CONFIG.autoNavFirst && state.tree[0]) {
                const firstBook = state.tree[0];
                state.history.push({data: state.tree, title: "书库根目录"});
                UI.render(firstBook.children, firstBook.title, 'forward');
            }
        }
    };

    dot.onclick = () => toggleMenu(!state.menuOn);
    // 侧滑返回监听
    menu.addEventListener('touchstart', e => { state.startX = e.touches[0].clientX; });
    menu.addEventListener('touchend', e => {
        if (state.fancyOpen) return;
        if (e.changedTouches[0].clientX - state.startX > 80) {
            const btn = document.getElementById('y-top-back');
            if (btn) btn.click();
        }
    });
})();