/**
 * Project: yuyuH - v0.8.7 [Industrial]
 * Features: Adaptive FAB, Swipe-to-Back, Non-sequential List, autoNavFirst
 */

(async () => {
    "use strict";

    let CONFIG = {
        mirrors: [],
        theme: 'primary',
        autoNavFirst: 0,
        loadingGif: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/loading.gif'
    };

    const state = { tree: [], history: [], menuOn: false, isMobile: window.innerWidth <= 768, startX: 0, fancyOpen: false };

    const UrlFactory = {
        getPrimary(vol, page) {
            return `https://gcore.jsdelivr.net/gh/6cc/c/m/y/${vol}/${page}.jpg`;
        },
        handleError(img) {
            const rawPath = img.src.split('/y/')[1];
            let i = 0;
            img.onerror = () => {
                if (i < CONFIG.mirrors.length) {
                    img.src = CONFIG.mirrors[i] + 'c/m/y/' + rawPath;
                    i++;
                } else img.onerror = null;
            };
        }
    };

    const UI = {
        injectStyles() {
            const s = document.createElement('style');
            s.textContent = `
                #y-dot { position:fixed; bottom:20px; right:20px; width:16px; height:16px; border-radius:50%; background:rgba(80,80,80,0.8); border:2px solid #fff; z-index:1049; cursor:pointer; }
                #y-menu { position:fixed; bottom:45px; right:20px; width:330px; height:70vh; max-height:550px; background:#1a1a1a; border-radius:16px; display:none; flex-direction:column; z-index:19; border:1px solid #333; overflow:hidden; touch-action: pan-y; }
                #y-menu.active { display:flex; }
                
                .y-h { flex-shrink:0; height:45px; background:#252525; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 15px; justify-content:space-between; z-index:10; }
                .y-back-btn { color:#ff00ff; font-size:12px; font-weight:bold; cursor:pointer; }

                .y-viewport { flex:1; overflow-y:auto; background:#111; position:relative; }
                .y-list { list-style:none; margin:0; padding:10px; display:grid; grid-template-columns:1fr 1fr; gap:10px; }
                
                /* 动画回归 */
                .slide-forward { animation: y-slideInRight 0.3s forwards; }
                .slide-backward { animation: y-slideInLeft 0.3s forwards; }
                @keyframes y-slideInRight { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes y-slideInLeft { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

                .y-item { padding:10px; cursor:pointer; background:#1e1e1e; border-radius:8px; border:1px solid #2a2a2a; display:flex; flex-direction:column; align-items:center; gap:5px; }
                .y-item img { height:80px; width:100%; object-fit:contain; opacity:0.3; transition:opacity 0.4s; background: transparent url('${CONFIG.loadingGif}') no-repeat center; background-size:16px; }
                .y-item span { font-size:11px; color:#fff; }

                /* 固定在右下角的 FAB */
                #y-fab-back { position:absolute; bottom:20px; right:20px; background:#ff00ff; color:#fff; width:36px; height:36px; border-radius:50%; display:none; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.5); cursor:pointer; z-index:100; font-weight:bold; }
                
                .y-panel-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; padding: 15px; background:#111; }
                .y-panel-item img { width: 100%; max-height:180px; object-fit:contain; opacity:0.3; transition:opacity 0.4s; }
            `;
            document.head.appendChild(s);
        },

        render(data, title = "书库", dir = 'forward') {
            const menu = document.getElementById('y-menu');
            const isRoot = state.history.length === 0;

            menu.innerHTML = `
                <div class="y-h">
                    <span class="y-back-btn" id="y-top-back">⇠ BACK</span>
                    <span style="font-size:12px; font-weight:bold; color:#eee;">${title}</span>
                    <span style="width:40px"></span>
                </div>
                <div class="y-viewport" id="y-scroll-target">
                    <div id="y-fab-back">⇠</div>
                    <ul class="y-list ${dir === 'forward' ? 'slide-forward' : 'slide-backward'}" id="y-list-ul"></ul>
                </div>
            `;
            
            const listUl = menu.querySelector('#y-list-ul');
            const fab = menu.querySelector('#y-fab-back');

            data.forEach(item => {
                const li = document.createElement('li');
                li.className = 'y-item';
                li.innerHTML = `<img src="${item.url || ''}"><span>${item.title}</span>`;
                li.onclick = () => {
                    if(item.children && item.children.length) {
                        if(!state.isMobile && item.vol) this.openDesktopPanel(item);
                        else { state.history.push({data, title}); this.render(item.children, item.title, 'forward'); }
                    } else this.launchFancybox(item, data);
                };
                listUl.appendChild(li);
            });

            // imagesLoaded 状态逻辑回归
            imagesLoaded(listUl).on('progress', (instance, image) => {
                const el = image.img;
                if (image.isLoaded) { el.style.opacity = "1"; } 
                else { el.style.filter = "grayscale(1) opacity(0.2)"; UrlFactory.handleError(el); }
            });

            const goBack = () => {
                if(isRoot) toggleMenu(false);
                else { const last = state.history.pop(); this.render(last.data, last.title, 'backward'); }
            };

            menu.querySelector('#y-top-back').onclick = goBack;
            fab.onclick = goBack;

            // 智能 FAB：基于触碰位置
            menu.onpointermove = (e) => {
                const rect = menu.getBoundingClientRect();
                const relativeY = e.clientY - rect.top;
                fab.style.display = (relativeY > rect.height / 2) ? 'flex' : 'none';
            };
        },

        openDesktopPanel(volNode) {
            jsPanel.create({
                headerTitle: volNode.title,
                contentSize: '850 600',
                theme: CONFIG.theme,
                content: `<div class="y-panel-container">${volNode.children.map((p, idx) => `<div class="y-panel-item" data-idx="${idx}"><img src="${p.url}"><span>${p.title}</span></div>`).join('')}</div>`,
                callback: function() {
                    imagesLoaded(this.content).on('progress', (instance, image) => {
                        if (image.isLoaded) image.img.style.opacity = "1";
                    });
                    this.content.querySelectorAll('.y-panel-item').forEach(el => {
                        el.onclick = () => UI.launchFancybox(volNode.children[el.dataset.idx], volNode.children);
                    });
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
                    if (trimmed.includes('autoNavFirst')) CONFIG.autoNavFirst = 1;
                    if (trimmed.includes('jsPanelTheme')) CONFIG.theme = trimmed.split('###')[1]?.trim() || 'primary';
                    if (trimmed.startsWith('http')) CONFIG.mirrors.push(trimmed);
                } else if (section === 'GALLERY' && trimmed) {
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
                        node.url = UrlFactory.getPrimary(vStr, node.cv || "1");
                        // 兼容连续与非连续图片
                        if (node.list) {
                            node.list.forEach(p => node.children.push({ title: `P${p.padStart(3,'0')}`, url: UrlFactory.getPrimary(vStr, p) }));
                        } else {
                            for (let p=1; p<=(node.cnt||0); p++) {
                                node.children.push({ title: `P${p.toString().padStart(3,'0')}`, url: UrlFactory.getPrimary(vStr, p) });
                            }
                        }
                    }
                    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
                    stack[stack.length - 1].children.push(node);
                    stack.push({ indent, children: node.children });
                }
            });
            return root;
        }
    };

    // 简单高效的手势监听
    const initGestures = () => {
        const menu = document.getElementById('y-menu');
        menu.addEventListener('touchstart', e => { state.startX = e.touches[0].clientX; });
        menu.addEventListener('touchend', e => {
            if (state.fancyOpen) return;
            const deltaX = e.changedTouches[0].clientX - state.startX;
            if (deltaX > 80) { // 向右滑动 80px 触发返回
                const btn = document.getElementById('y-top-back');
                if (btn) btn.click();
            }
        });
    };

    const setup = async () => {
        ['https://gcore.jsdelivr.net/gh/Flyer53/jsPanel4/es6module/jspanel.min.css','https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.css'].forEach(u => {
            const l = document.createElement('link'); l.rel='stylesheet'; l.href=u; document.head.appendChild(l);
        });
        const [mP, mF, mI] = await Promise.all([
            import('https://gcore.jsdelivr.net/gh/Flyer53/jsPanel4/es6module/jspanel.min.js'),
            import('https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.esm.js'),
            import('https://esm.sh/imagesloaded@5.0.0')
        ]);
        window.jsPanel = mP.jsPanel; window.Fancybox = mF.Fancybox; window.imagesLoaded = mI.default;
    };

    await setup();
    state.tree = await allInOneParser.load('https://gcore.jsdelivr.net/gh/qqvvv/qqvvv.github.io/content/9/myriaDown/allInOne-02.md');
    UI.injectStyles();
    
    const dot = document.createElement('div'); dot.id = 'y-dot'; document.body.appendChild(dot);
    const menu = document.createElement('div'); menu.id = 'y-menu'; document.body.appendChild(menu);

    const toggleMenu = (val) => {
        state.menuOn = val;
        menu.classList.toggle('active', val);
        if(val && state.history.length === 0) {
            UI.render(state.tree[0].children, state.tree[0].title);
            if (CONFIG.autoNavFirst && state.tree[0].children[0]) {
                // 自动进入首个项目
                const first = state.tree[0].children[0];
                state.history.push({data: state.tree[0].children, title: state.tree[0].title});
                UI.render(first.children, first.title, 'forward');
            }
        }
    };

    dot.onclick = () => toggleMenu(!state.menuOn);
    dot.onmouseenter = () => toggleMenu(true);
    initGestures();
})();