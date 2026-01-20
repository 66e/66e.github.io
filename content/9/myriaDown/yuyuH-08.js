/**
 * Project: yuyuH - v0.8 [Dark Flow]
 * Features: MD-Integrated Data, Dark Theme, Sticky Navigation, Slide Animation
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
                #y-dot { position:fixed; bottom:20px; right:20px; width:14px; height:14px; border-radius:50%; background:rgba(255,255,255,0.2); border:2px solid #fff; z-index:2147483647; cursor:pointer; }
                #y-menu { position:fixed; bottom:45px; right:20px; width:300px; max-height:75vh; background:#1a1a1a; border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,0.5); display:none; flex-direction:column; overflow:hidden; z-index:19; font-family:sans-serif; border:1px solid #333; color:#eee; }
                #y-menu.active { display:flex; }
                
                /* 粘性页眉 */
                .y-h { position:sticky; top:0; background:#252525; padding:14px; z-index:10; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center; }
                .y-back { cursor:pointer; color:#ff00ff; font-size:13px; }

                /* 列表与动画容器 */
                .y-viewport { flex:1; overflow-x:hidden; overflow-y:auto; position:relative; background:#111; }
                .y-list { list-style:none; margin:0; padding:10px; transition: transform 0.3s ease-out; }
                .y-list.slide-out { transform: translateX(-100%); }
                .y-list.slide-in { animation: y-slideIn 0.3s forwards; }
                @keyframes y-slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

                .y-item { padding:10px; cursor:pointer; font-size:13px; background:#222; border-radius:8px; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border:1px solid #2a2a2a; }
                .y-item:hover { background:#2a2a2a; border-color:#ff00ff; }
                .grid-mode { display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:10px; }
                .grid-item { flex-direction:column; gap:8px; text-align:center; margin-bottom:0; }
                .grid-item img, .vol-item img { height:70px; width:auto; border-radius:4px; object-fit:cover; background: #222 url('${LIBS.loading}') no-repeat center; background-size:16px; }
                
                /* 桌面端面板暗黑样式 */
                .jsPanel-theme-dark .jsPanel-content { background: #111 !important; }
                .y-panel-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 15px; padding: 15px; background:#111; }
                .y-panel-item { cursor: pointer; text-align: center; background:#1a1a1a; padding:10px; border-radius:8px; border:1px solid #222; transition:0.2s; }
                .y-panel-item:hover { border-color:#ff00ff; transform:translateY(-2px); }
                .y-panel-item img { width: 100%; height: 170px; object-fit: cover; border-radius: 4px; }
                .y-panel-item span { font-size: 11px; color: #888; margin-top: 8px; display: block; }
                
                /* 进度条 */
                .y-progress { position:absolute; top:0; left:0; height:2px; background:#ff00ff; transition:width 0.2s; z-index:11; width:0; }
            `;
            document.head.appendChild(s);
        },

        render(data, title = "目录", direction = 'forward') {
            const menu = document.getElementById('y-menu');
            const isRoot = state.history.length === 0;
            const isPageLevel = data.length > 0 && !data[0].children.length && data[0].title.includes('P');

            // 保持页眉粘性
            menu.innerHTML = `
                <div class="y-h">
                    ${!isRoot ? `<span class="y-back" id="y-back">⇠ BACK</span>` : '<span>EXPLORE</span>'}
                    <span style="font-size:12px; opacity:0.7">${title}</span>
                </div>
                <div class="y-viewport">
                    <div class="y-progress" id="y-progress"></div>
                    <ul class="y-list ${direction === 'forward' ? 'slide-in' : ''}" id="y-list-ul"></ul>
                </div>
            `;
            
            const listUl = menu.querySelector('#y-list-ul');
            if (isPageLevel && state.isMobile) listUl.classList.add('grid-mode');
            
            data.forEach((item) => {
                const li = document.createElement('li');
                const isVol = !!item.vol;
                li.className = isPageLevel ? 'y-item grid-item' : 'y-item vol-item';
                
                if (isVol || (isPageLevel && state.isMobile)) {
                    li.innerHTML = `<img src="${item.url}"><span>${item.title}</span>`;
                } else {
                    li.innerHTML = `<span>${item.title}</span><span>${item.children.length ? '›' : ''}</span>`;
                }

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
            const panel = jsPanel.create({
                headerTitle: volNode.title,
                contentSize: '850 600',
                theme: 'dark',
                content: `
                    <div class="y-progress" id="p-bar-${actionId}"></div>
                    <div class="y-panel-container">
                        ${volNode.children.map((p, idx) => `
                            <div class="y-panel-item" data-idx="${idx}">
                                <img src="${p.url}" loading="lazy">
                                <span>${p.title}</span>
                            </div>
                        `).join('')}
                    </div>`,
                callback: function() {
                    const progressBar = this.content.querySelector(`#p-bar-${actionId}`);
                    const imgs = this.content.querySelectorAll('img');
                    
                    // 使用 imagesLoaded 监听进度
                    const imgLoad = imagesLoaded(this.content);
                    imgLoad.on('progress', (instance, image) => {
                        const percent = (instance.progressedCount / instance.images.length) * 100;
                        progressBar.style.width = percent + '%';
                        if(!image.isLoaded) {
                            const m = UrlFactory.getMirrors(image.img.src);
                            image.img.src = m[0]; // 简单的镜像容错
                        }
                    });
                    imgLoad.on('done', () => { setTimeout(() => progressBar.style.width = '0', 500); });

                    this.content.querySelectorAll('.y-panel-item').forEach(el => {
                        el.onclick = () => UI.launchFancybox(volNode.children[el.dataset.idx], volNode.children);
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
                // --- 整合逻辑：直接读取 node.cnt 和 node.cv ---
                if (node.vol) {
                    const maxPage = node.cnt || 0;
                    const coverNum = node.cv || "1";
                    node.url = UrlFactory.getPrimary(node.vol, coverNum);
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
    state.tree = await myriaDown.load('https://gcore.jsdelivr.net/gh/qqvvv/qqvvv.github.io/content/9/myriaDown/galleryData.md');
    UI.injectStyles();
    const dot = document.createElement('div'); dot.id = 'y-dot'; document.body.appendChild(dot);
    const menu = document.createElement('div'); menu.id = 'y-menu'; document.body.appendChild(menu);
    dot.onclick = () => {
        state.menuOn = !state.menuOn;
        menu.classList.toggle('active', state.menuOn);
        if(state.menuOn) { state.history = []; UI.render(state.tree[0].children, state.tree[0].title); }
    };
})();