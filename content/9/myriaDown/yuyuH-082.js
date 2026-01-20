/**
 * Project: yuyuH - v0.8.2 [Visual Correction]
 * Fixes: Sticky Header, Object-Fit (Contain), Dark Theme Contrast, Dot Z-index
 */

(async () => {
    "use strict";

    const LIBS = {
        jsPanel: 'https://gcore.jsdelivr.net/gh/Flyer53/jsPanel4/es6module/jspanel.min.js',
        Fancybox: 'https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.esm.js',
        imagesLoaded: 'https://esm.sh/imagesloaded@5.0.0',
        jsPanelCSS: 'https://gcore.jsdelivr.net/gh/Flyer53/jsPanel4/es6module/jspanel.min.css',
        fancyCSS: 'https://cdnjs.cloudflare.com/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.css',
        loading: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/loading.gif'
    };

    let globalActionId = 0;
    const state = { tree: [], history: [], menuOn: false, isMobile: window.innerWidth <= 768 };

    const UrlFactory = {
        getPrimary(vol, page) {
            const vStr = vol.toString().padStart(2, '0');
            return `https://gcore.jsdelivr.net/gh/6cc/c/m/y/${vStr}/${page}.jpg`;
        },
        getMirrors(url) {
            const rawPath = url.replace('https://gcore.jsdelivr.net/gh/6cc/', '');
            return [`https://i1.wp.com/gcore.jsdelivr.net/gh/6cc/${rawPath}`, `https://6cc.github.io/${rawPath}`];
        }
    };

    const setup = async () => {
        const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = LIBS.jsPanelCSS; document.head.appendChild(link);
        const linkF = document.createElement('link'); linkF.rel = 'stylesheet'; linkF.href = LIBS.fancyCSS; document.head.appendChild(linkF);
        const [mP, mF, mI] = await Promise.all([import(LIBS.jsPanel), import(LIBS.Fancybox), import(LIBS.imagesLoaded)]);
        window.jsPanel = mP.jsPanel || mP.default;
        window.Fancybox = mF.Fancybox || mF.default;
        window.imagesLoaded = mI.default || mI;
    };

    const UI = {
        injectStyles() {
            const s = document.createElement('style');
            s.textContent = `
                /* 调整 Dot 层级至 1049 */
                #y-dot { position:fixed; bottom:20px; right:20px; width:16px; height:16px; border-radius:50%; background:rgba(60,60,60,0.8); border:2px solid #fff; z-index:1049; cursor:pointer; box-shadow: 0 0 8px rgba(0,0,0,0.5); transition: 0.3s; }
                #y-dot:hover { background:#ff00ff; box-shadow: 0 0 12px #ff00ff; }
                
                #y-menu { position:fixed; bottom:45px; right:20px; width:320px; height: 75vh; max-height: 600px; background:#1a1a1a; border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,0.6); display:none; flex-direction:column; overflow:hidden; z-index:19; font-family:sans-serif; border:1px solid #333; color:#eee; }
                #y-menu.active { display:flex; }
                
                /* 确保页眉固定 */
                .y-h { flex-shrink: 0; background:#252525; padding:12px 15px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center; }
                .y-back { cursor:pointer; color:#ff00ff; font-size:12px; font-weight:bold; }

                .y-viewport { flex:1; overflow-y:auto; overflow-x:hidden; position:relative; background:#111; }
                .y-list { list-style:none; margin:0; padding:10px; display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
                
                .slide-forward { animation: y-slideInRight 0.3s ease-out forwards; }
                .slide-backward { animation: y-slideInLeft 0.3s ease-out forwards; }
                @keyframes y-slideInRight { from { transform: translateX(50%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes y-slideInLeft { from { transform: translateX(-50%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

                .y-item { padding:8px; cursor:pointer; background:#222; border-radius:8px; display:flex; flex-direction:column; align-items:center; border:1px solid #2a2a2a; gap:6px; transition:0.2s; }
                .y-item:hover { border-color:#ff00ff; background:#2a2a2a; }
                .y-item img { height:75px; width:100%; object-fit:contain; border-radius:4px; background:#222 url('${LIBS.loading}') no-repeat center; background-size:16px; }
                .y-item span { font-size: 11px; color: #fff; } /* 菜单内页码白色 */
                
                /* Desktop Panel Container */
                .y-panel-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; padding: 15px; background:#111; }
                .y-panel-item { cursor: pointer; text-align: center; background:#1a1a1a; padding:12px; border-radius:8px; border:1px solid #222; }
                .y-panel-item:hover { border-color: #ff00ff; }
                .y-panel-item img { width: 100%; max-height: 180px; object-fit: contain; border-radius: 4px; background: #222 url('${LIBS.loading}') no-repeat center; background-size: 24px; }
                .y-panel-item span { font-size: 11px; color: #ffffff; margin-top: 8px; display: block; opacity: 0.9; } /* 面板内页码白色 */
                
                .y-progress { position:sticky; top:0; left:0; height:2px; background:#ff00ff; transition:width 0.2s; z-index:11; width:0; }
            `;
            document.head.appendChild(s);
        },

        render(data, title = "目录", direction = 'forward') {
            const menu = document.getElementById('y-menu');
            const isRoot = state.history.length === 0;

            // 重新构建内部结构
            menu.innerHTML = `
                <div class="y-h">
                    ${!isRoot ? `<span class="y-back" id="y-back">⇠ BACK</span>` : '<span style="font-size:10px;opacity:0.4;">EXPLORE</span>'}
                    <span style="font-size:12px; font-weight:bold;">${title}</span>
                </div>
                <div class="y-viewport">
                    <ul class="y-list ${direction === 'forward' ? 'slide-forward' : 'slide-backward'}" id="y-list-ul"></ul>
                </div>
            `;
            
            const listUl = menu.querySelector('#y-list-ul');
            data.forEach((item) => {
                const li = document.createElement('li');
                li.className = 'y-item';
                li.innerHTML = `<img src="${item.url}"><span>${item.title}</span>`;
                li.onclick = (e) => {
                    if(item.children.length) {
                        if(!state.isMobile && item.vol) {
                            this.openDesktopPanel(item);
                        } else {
                            state.history.push({data, title});
                            this.render(item.children, item.title, 'forward');
                        }
                    } else {
                        this.launchFancybox(item, data);
                    }
                };
                listUl.appendChild(li);
            });

            if(!isRoot) menu.querySelector('#y-back').onclick = () => {
                const last = state.history.pop();
                this.render(last.data, last.title, 'backward');
            };
        },

        openDesktopPanel(volNode) {
            const actionId = ++globalActionId;
            jsPanel.create({
                headerTitle: volNode.title,
                contentSize: '850 600',
                theme: 'dark',
                content: `
                    <div class="y-progress" id="p-bar-${actionId}"></div>
                    <div class="y-panel-container">
                        ${volNode.children.map((p, idx) => `
                            <div class="y-panel-item" data-idx="${idx}"><img src="${p.url}"><span>${p.title}</span></div>
                        `).join('')}
                    </div>`,
                callback: function() {
                    const progressBar = this.content.querySelector(`#p-bar-${actionId}`);
                    const imgLoad = imagesLoaded(this.content);
                    imgLoad.on('progress', (instance) => {
                        progressBar.style.width = (instance.progressedCount / instance.images.length) * 100 + '%';
                    });
                    imgLoad.on('done', () => { setTimeout(() => progressBar.style.width = '0', 400); });
                    this.content.querySelectorAll('.y-panel-item').forEach(el => {
                        el.onclick = () => UI.launchFancybox(volNode.children[el.dataset.idx], volNode.children);
                    });
                    // 处理镜像
                    this.content.querySelectorAll('img').forEach(img => {
                        img.onerror = () => {
                            const m = UrlFactory.getMirrors(img.src);
                            img.src = m[0]; img.onerror = () => { img.src = m[1]; img.onerror = null; };
                        };
                    });
                }
            });
        },

        launchFancybox(activeItem, allSiblings) {
            const slides = allSiblings.map(item => ({ src: item.url, type: "image", caption: item.title }));
            Fancybox.show(slides, { startIndex: allSiblings.indexOf(activeItem) });
        }
    };

    const myriaDown = {
        async load(url) {
            const res = await fetch(url);
            return this.parse(await res.text());
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
                if (node.vol) {
                    const maxPage = node.cnt || 0;
                    node.url = UrlFactory.getPrimary(node.vol, node.cv || "1");
                    for (let p = 1; p <= maxPage; p++) {
                        node.children.push({ title: `P${p.toString().padStart(3, '0')}`, url: UrlFactory.getPrimary(node.vol, p), children: [] });
                    }
                }
                while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
                stack[stack.length - 1].children.push(node);
                stack.push({ indent, children: node.children });
            });
            return root;
        }
    };

    await setup();
    state.tree = await myriaDown.load('https://gcore.jsdelivr.net/gh/qqvvv/qqvvv.github.io/content/9/galleryData.md');
    UI.injectStyles();
    
    const dot = document.createElement('div'); dot.id = 'y-dot'; document.body.appendChild(dot);
    const menu = document.createElement('div'); menu.id = 'y-menu'; document.body.appendChild(menu);

    const toggleMenu = (val) => {
        state.menuOn = val;
        menu.classList.toggle('active', val);
        if(val && state.history.length === 0) UI.render(state.tree[0].children, state.tree[0].title);
    };

    dot.onclick = () => toggleMenu(!state.menuOn);
    dot.onmouseenter = () => toggleMenu(true);
})();