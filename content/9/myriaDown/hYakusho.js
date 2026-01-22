/**
 * Project: yuyuH - v0.8.6 [Premium UX]
 * Features: Dual-Back Buttons, iOS Swipe-Back, Advanced MD Parser, Image Fade
 */

(async () => {
    "use strict";

    let CONFIG = {
        mirrors: [],
        libs: {},
        theme: 'primary',
        loadingGif: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/loading.gif'
    };

    const state = { tree: [], history: [], menuOn: false, isMobile: window.innerWidth <= 768, touchX: 0, touchY: 0 };

    const setup = async () => {
        const css = [
            'https://gcore.jsdelivr.net/gh/Flyer53/jsPanel4/es6module/jspanel.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.css'
        ];
        css.forEach(url => { const l = document.createElement('link'); l.rel='stylesheet'; l.href=url; document.head.appendChild(l); });
        
        const [mP, mF, mI] = await Promise.all([
            import('https://gcore.jsdelivr.net/gh/Flyer53/jsPanel4/es6module/jspanel.min.js'),
            import('https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.esm.js'),
            import('https://esm.sh/imagesloaded@5.0.0')
        ]);
        window.jsPanel = mP.jsPanel || mP.default;
        window.Fancybox = mF.Fancybox || mF.default;
        window.imagesLoaded = mI.default || mI;
    };

    const UI = {
        injectStyles() {
            const s = document.createElement('style');
            s.textContent = `
                #y-dot { position:fixed; bottom:20px; right:20px; width:16px; height:16px; border-radius:50%; background:rgba(80,80,80,0.8); border:2px solid #fff; z-index:1049; cursor:pointer; box-shadow:0 0 10px rgba(0,0,0,0.5); }
                #y-menu { position:fixed; bottom:45px; right:20px; width:330px; height:70vh; max-height:550px; background:#1a1a1a; border-radius:16px; display:none; flex-direction:column; z-index:19; border:1px solid #333; overflow:hidden; }
                #y-menu.active { display:flex; }
                
                /* 粘性页眉 */
                .y-h { flex-shrink:0; height:45px; background:#252525; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 15px; justify-content:space-between; z-index:10; }
                .y-back-btn { color:#ff00ff; font-size:12px; font-weight:bold; cursor:pointer; padding:5px 10px; border-radius:4px; }
                .y-back-btn:hover { background:rgba(255,0,255,0.1); }

                .y-viewport { flex:1; overflow-y:auto; background:#111; position:relative; scroll-behavior: smooth; }
                .y-list { list-style:none; margin:0; padding:10px; display:grid; grid-template-columns:1fr 1fr; gap:10px; }
                
                .y-item { padding:10px; cursor:pointer; background:#1e1e1e; border-radius:8px; border:1px solid #2a2a2a; display:flex; flex-direction:column; align-items:center; gap:5px; transition:0.3s; }
                .y-item img { height:80px; width:100%; object-fit:contain; opacity:0; transition:opacity 0.4s; background: transparent url('${CONFIG.loadingGif}') no-repeat center; background-size:16px; }
                
                /* 悬浮返回按钮 (FAB) - 初始隐藏 */
                #y-fab-back { position:absolute; bottom:20px; left:20px; background:#ff00ff; color:#fff; width:40px; height:40px; border-radius:50%; display:none; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.4); cursor:pointer; z-index:15; font-size:18px; }
                
                .y-panel-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; padding: 15px; background:#111; }
                .y-panel-item img { width: 100%; max-height:180px; object-fit:contain; opacity:0; transition:opacity 0.4s; background: transparent url('${CONFIG.loadingGif}') no-repeat center; background-size:24px; }
            `;
            document.head.appendChild(s);
        },

        render(data, title = "书库") {
            const menu = document.getElementById('y-menu');
            const isRoot = state.history.length === 0;

            menu.innerHTML = `
                <div class="y-h">
                    <span class="y-back-btn" id="y-top-back">⇠ BACK</span>
                    <span style="font-size:12px; font-weight:bold; color:#fff;">${title}</span>
                    <span style="width:40px"></span> 
                </div>
                <div class="y-viewport" id="y-scroll-target">
                    <div id="y-fab-back">⇠</div>
                    <ul class="y-list" id="y-list-ul"></ul>
                </div>
            `;
            
            const listUl = menu.querySelector('#y-list-ul');
            const viewport = menu.querySelector('#y-viewport');
            const fab = menu.querySelector('#y-fab-back');

            data.forEach(item => {
                const li = document.createElement('li');
                li.className = 'y-item';
                li.innerHTML = `<img src="${item.url || ''}"><span>${item.title}</span>`;
                li.onclick = () => {
                    if(item.children && item.children.length) {
                        if(!state.isMobile && item.vol) this.openDesktopPanel(item);
                        else { state.history.push({data, title}); this.render(item.children, item.title); }
                    } else this.launchFancybox(item, data);
                };
                listUl.appendChild(li);
            });

            // 图像渐变载入
            imagesLoaded(listUl).on('progress', (instance, image) => {
                if (image.isLoaded) image.img.style.opacity = "1";
            });

            // 智能返回逻辑
            const goBack = () => {
                if(isRoot) toggleMenu(false);
                else { const last = state.history.pop(); this.render(last.data, last.title); }
            };

            menu.querySelector('#y-top-back').onclick = goBack;
            fab.onclick = goBack;

            // 监听滚动显示 FAB
            const scrollTarget = menu.querySelector('#y-scroll-target');
            scrollTarget.onscroll = () => {
                fab.style.display = scrollTarget.scrollTop > 200 ? 'flex' : 'none';
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

    const advancedParser = {
        async load(url) {
            const res = await fetch(url);
            const text = await res.text();
            const lines = text.split('\n');
            let currentSection = '';
            const root = [];
            const stack = [{ indent: -1, children: root }];

            lines.forEach(line => {
                const trimmed = line.trim();
                if (line.startsWith('# CONFIG')) { currentSection = 'CONFIG'; return; }
                if (line.startsWith('# GALLERY')) { currentSection = 'GALLERY'; return; }

                if (currentSection === 'CONFIG') {
                    // 简单的 URL 提取逻辑：识别以 http 开头的行并存入 mirrors
                    if (trimmed.startsWith('http')) CONFIG.mirrors.push(trimmed);
                } else if (currentSection === 'GALLERY' && trimmed) {
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
                        node.url = `https://gcore.jsdelivr.net/gh/6cc/c/m/y/${vStr}/${node.cv || "1"}.jpg`;
                        for (let p=1; p<=(node.cnt||0); p++) {
                            node.children.push({ title: `P${p.toString().padStart(3,'0')}`, url: `https://gcore.jsdelivr.net/gh/6cc/c/m/y/${vStr}/${p}.jpg` });
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

    // iOS 侧滑返回监听
    const initGestures = () => {
        document.addEventListener('touchstart', e => {
            state.touchX = e.touches[0].clientX;
            state.touchY = e.touches[0].clientY;
        });
        document.addEventListener('touchend', e => {
            const deltaX = e.changedTouches[0].clientX - state.touchX;
            const deltaY = Math.abs(e.changedTouches[0].clientY - state.touchY);
            // 条件：从左边缘滑动、距离足够、不是垂直滚动、灯箱未开启、菜单已开启
            if (state.menuOn && !state.fancyOpen && state.touchX < 40 && deltaX > 100 && deltaY < 40) {
                const backBtn = document.getElementById('y-top-back');
                if (backBtn) backBtn.click();
            }
        });
    };

    await setup();
    state.tree = await advancedParser.load('https://gcore.jsdelivr.net/gh/qqvvv/qqvvv.github.io/content/9/myriaDown/allInOne.md');
    UI.injectStyles();
    
    const dot = document.createElement('div'); dot.id = 'y-dot'; document.body.appendChild(dot);
    const menu = document.createElement('div'); menu.id = 'y-menu'; document.body.appendChild(menu);

    const toggleMenu = (val) => {
        state.menuOn = val;
        menu.classList.toggle('active', val);
        if(val && state.history.length === 0) UI.render(state.tree, "书库根目录");
    };

    dot.onclick = () => toggleMenu(!state.menuOn);
    dot.onmouseenter = () => toggleMenu(true);
    initGestures();
})();