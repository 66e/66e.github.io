/**
 * hYakusho - Module A (v3.0.0)
 * 职责：防重复、镜像深度竞速、资源注入、h-Console 调试台。
 */
(async () => {
    "use strict";

    // --- [1. 防重复启动] ---
    if (window.hYakusho_Instance) return;
    window.hYakusho_Instance = true;

    // --- [2. 全局状态机] ---
    const state = {
        isMobile: window.innerWidth <= 768,
        libs: {},      // 存储从 MD 解析出的库信息
        winners: {},   // 存储每个库胜出的 Set 地址
        logs: [],      // 简易日志，供 jsPanel 显示
        maxZ: 18       // 初始层级
    };

    // 自定义日志函数
    const hLog = (msg, data = null) => {
        const entry = { time: new Date().toLocaleTimeString(), msg, data };
        state.logs.push(entry);
        console.log(`[hYakusho] ${msg}`, data || "");
        // 如果调试窗口已打开，则触发重绘（后续 Module E 实现）
    };

    const ResourceManager = {
        // --- [3. 智能竞速算法] ---
        // 对特定库的多个 Set 进行 HEAD 探测
        async raceLibrary(libId, sets) {
            hLog(`Racing mirrors for: ${libId}`);
            const setEntries = Object.entries(sets); // [[Set1, [urls]], [Set2, [urls]]]
            
            try {
                const winnerSetId = await Promise.any(setEntries.map(([setId, urls]) => {
                    const probeUrl = urls.find(u => u.endsWith('.js'));
                    if (!probeUrl) return Promise.reject();
                    
                    return fetch(probeUrl, { method: 'HEAD', mode: 'no-cors' })
                        .then(() => setId);
                }));
                
                state.winners[libId] = sets[winnerSetId];
                hLog(`${libId} winner selected: ${winnerSetId}`);
            } catch (e) {
                hLog(`${libId} all mirrors failed, using fallback Set 1`);
                state.winners[libId] = Object.values(sets)[0];
            }
        },

        // --- [4. 资源注入] ---
        async inject(libId) {
            const assets = state.winners[libId];
            if (!assets) return;

            for (const url of assets) {
                if (url.endsWith('.css')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet'; link.href = url;
                    document.head.appendChild(link);
                } else {
                    // ESM 动态导入
                    const mod = await import(url);
                    // 兼容不同库的导出格式
                    window[libId === 'fancyapps-ui' ? 'Fancybox' : libId] = mod.default || mod[libId] || mod;
                }
            }
            hLog(`${libId} injected successfully.`);
        }
    };

    // --- [5. h-Console 调试辅助] ---
    const DebugUI = {
        // 针对你提到的可折叠数组/对象，我们可以利用简单的递归生成 HTML
        renderObject(obj) {
            if (typeof obj !== 'object' || obj === null) return `<span>${obj}</span>`;
            return `<details style="margin-left:10px;">
                <summary>${Array.isArray(obj) ? 'Array' : 'Object'}(${Object.keys(obj).length})</summary>
                ${Object.entries(obj).map(([k, v]) => `<div><b>${k}:</b> ${this.renderObject(v)}</div>`).join('')}
            </details>`;
        },
        
        show() {
            if (!window.jsPanel) return;
            window.jsPanel.create({
                headerTitle: 'hYakusho 控制台',
                position: 'center-bottom 0 -20',
                contentSize: '350 250',
                theme: 'dark',
                content: `<div id="h-console" style="font-size:12px; padding:10px; color:#0f0; font-family:monospace;">
                    ${state.logs.map(l => `<div>[${l.time}] ${l.msg} ${l.data ? DebugUI.renderObject(l.data) : ''}</div>`).join('')}
                </div>`,
                callback: function() { this.style.zIndex = 1000; }
            });
        }
    };

    // --- [6. 启动流] ---
    const start = async () => {
        hLog("Environment check: " + (state.isMobile ? "Mobile" : "Desktop"));
        
        // 此处暂存 Module B 的逻辑，先行模拟 MD 解析后的 libs 结构
        // 实际运行时将由 Module B 填充 state.libs
        // Example: state.libs['jsPanel'] = { 'Set 1': [...], 'Set 2': [...] };

        hLog("Waiting for Data Parser (Module B)...");
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    // 暴露部分接口供后续 Module 调用
    window.hYakusho = { state, ResourceManager, DebugUI, hLog };

})();