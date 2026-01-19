/**
 * Project: yuyuH - v0.7 [The Architect's Return]
 * Logic: Desktop (Panel Container) vs Mobile (Grid Menu), Vol-Cover, Loading GIF
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

    const volPageS = [102, 98, 96, 96, 104, 104, 101, 95, 96, 104, 95, 95, 94, 103, 103, 103, 103, 94, 97];
    const coverMap = { "07": "5", "08": "2", "09": "2", "14": "12", "18": "2" };

    const state = { tree: [], history: [], menuOn: false, isMobile: window.innerWidth <= 768 };

    const UrlFactory = {
        getPrimary(vol, page) {
            const vStr = vol.toString().padStart(2, '0');
            return `https://gcore.jsdelivr.net/gh/6cc/c/m/y/${vStr}/${page}.jpg`;
        },
        getMirrors(url) {
            const rawPath = url.replace('https://gcore.jsdelivr.net/gh/6cc/', '');
            return [
                `https://i1.wp.com/gcore.jsdelivr.net/gh/6cc/${rawPath}`,
                `https://6cc.github.io/${rawPath}`
            ];
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
                #y-dot { position:fixed; bottom:20px; right:20px; width:14px; height:14px; border-radius:50%; background:rgba(0,0,0,0.3); border:2px solid #fff; z-index:2147483647; cursor:pointer; }
                #y-menu { position:fixed; bottom:45px; right:20px; width:300px; max-height:75vh; background:rgba(255,255,255,0.92); backdrop-filter:blur(15px); border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.2); display:none; flex-direction:column; overflow:hidden; z-index:19; font-family:sans-serif; border:1px solid rgba(255,255,255,0.5); }
                #y-menu.active { display:flex; }
                .y-list { list-style:none; margin:0; padding:10px; overflow-y:auto; flex:1; }
                .y-list.grid-mode { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
                .y-item { padding:10px; cursor:pointer; font-size:13px; background:rgba(0,0,0,0.02); border-radius:8px; display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
                .grid-item { flex-direction:column; gap:6px; padding:8px; text-align:center; }
                .grid-item img, .vol-item img { height:70px; width:auto; border-radius:4px; object-fit:cover; background:url('${LIBS.loading}') no-repeat center; background-size:20px; }
                .vol-item { gap:15px; justify-content: flex-start; }
                .y-back { cursor:pointer; color:#ff00ff; padding:14px; display:block; border-bottom:1px solid rgba(0,0,0,0.05); }
                
                /* Desktop Panel Content Styles */
                .y-panel-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; padding: 15px; }
                .y-panel-item { cursor: pointer; text-align: center; }
                .y-panel-item img { width: 100%; height: 160px; object-fit: cover; border-radius: 6px; background: #222 url('${LIBS.loading}') no-repeat center; }
                .y-panel-item span { font-size: 12px; color: #ccc; margin-top: 5px; display: block; }
            `;
            document.head.appendChild(s);
        },

        render(data, title = "目录") {
            const menu = document.getElementById('y-menu');
            const isRoot = state.history.length === 0;
            const isPageLevel = data.length > 0 && !data[0].children.length && data[0].title.includes('P');

            menu.innerHTML = `<div class="y-h" style="padding:14px; font-weight:bold; font-size:13px; background:rgba(0,0,0,0.03);">
                ${!isRoot ? `<span class="y-back" id="y-back">⇠ 返回</span>` : '<span>Navigation</span>'}
                <span>${title}</span>
            </div>`;
            
            const list = document.createElement('ul');
            list.className = 'y-list' + (isPageLevel && state.isMobile ? ' grid-mode' : '');
            
            data.forEach((item, i) => {
                const li = document.createElement('li');
                // 卷级显示封面，页级移动端显示缩略图
                const showThumb = (item.vol || (isPageLevel && state.isMobile));
                li.className = isPageLevel ? 'y-item grid-item' : 'y-item vol-item';
                
                li.innerHTML = showThumb 
                    ? `<img src="${item.url}" loading="lazy"><span>${item.title}</span>`
                    : `<span>${item.title}</span> <span>${item.children.length ? '›' : ''}</span>`;

                li.onclick = (e) => {
                    e.stopPropagation();
                    if(item.children.length) {
                        // 桌面端点击卷名直接开启面板，不再进二级菜单
                        if(!state.isMobile && item.vol) {
                            this.openDesktopPanel(item);
                        } else {
                            state.history.push({data, title});
                            this.render(item.children, item.title);
                        }
                    } else {
                        this.launchFancybox(item, data);
                    }
                };
                list.appendChild(li);
            });
            menu.appendChild(list);
            if(!isRoot) menu.querySelector('#y-back').onclick = () => {
                const last = state.history.pop(); this.render(last.data, last.title);
            };
        },

        // 桌面端：直接展示整卷内容的面板
        openDesktopPanel(volNode) {
            const panel = jsPanel.create({
                headerTitle: volNode.title,
                contentSize: '800 600',
                theme: 'dark',
                content: `<div class="y-panel-container">
                    ${volNode.children.map((p, idx) => `
                        <div class="y-panel-item" data-idx="${idx}">
                            <img src="${p.url}" loading="lazy">
                            <span>${p.title}</span>
                        </div>
                    `).join('')}
                </div>`,
                callback: function() {
                    const items = this.content.querySelectorAll('.y-panel-item');
                    items.forEach(el => {
                        el.onclick = () => {
                            const idx = parseInt(el.dataset.idx);
                            UI.launchFancybox(volNode.children[idx], volNode.children);
                        };
                    });
                    // 处理面板内的图片错误
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
            const activeIndex = allSiblings.indexOf(activeItem);
            Fancybox.show(slides, { startIndex: activeIndex });
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
                    const volIdx = parseInt(node.vol) - 1;
                    const maxPage = volPageS[volIdx] || 0;
                    const cNum = coverMap[node.vol.toString().padStart(2,'0')] || "1";
                    node.url = UrlFactory.getPrimary(node.vol, cNum); // 卷级封面

                    for (let p = 1; p <= maxPage; p++) {
                        node.children.push({
                            title: `P${p.toString().padStart(3, '0')}`,
                            url: UrlFactory.getPrimary(node.vol, p),
                            children: []
                        });
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

    dot.onclick = () => {
        state.menuOn = !state.menuOn;
        menu.classList.toggle('active', state.menuOn);
        if(state.menuOn) {
            state.history = [];
            UI.render(state.tree[0].children, state.tree[0].title);
        }
    };
})();