/**
 * 工业级资源加载器
 * @param {string|string[]|Object} inputs - 网址、网址数组，或 { 变量名: 网址 } 对象
 * @param {Object} options - { callback: 回调函数, forceTag: 是否强制使用标签 }
 */
async function loadResources(inputs, { callback, forceTag = false } = {}) {
    // 1. 标准化输入：将字符串或对象统一转为 [{name, url}] 格式
    let tasks = [];
    if (typeof inputs === 'string') {
        tasks = [{ name: null, url: inputs }];
    } else if (Array.isArray(inputs)) {
        tasks = inputs.filter(u => u && typeof u === 'string').map(u => ({ name: null, url: u }));
    } else {
        tasks = Object.entries(inputs).map(([name, url]) => ({ name, url }));
    }

    // 2. 并行执行任务，但个体错误不影响整体
    const results = await Promise.all(tasks.map(async (task) => {
        const { name, url } = task;
        const isCSS = url.match(/\.(css|CSS)($|\?)/) || url.includes('_CSS.md');

        try {
            if (isCSS) {
                return await _loadCSS(url, forceTag);
            } else {
                return await _loadJS(url, name, forceTag);
            }
        } catch (err) {
            console.error(`[Loader] Failed to load: ${url}`, err);
            return null; // 单个加载失败，返回 null 继续其他任务
        }
    }));

    if (callback) callback(results);
    return results;
}

// --- 内部核心逻辑 (私有) ---

async function _loadJS(url, name, forceTag) {
    if (document.querySelector(`script[src="${url}"]`)) return window[name];

    // 策略：优先 import()，失败则回退到 <script>
    if (!forceTag) {
        try {
            const module = await import(url);
            const exportObj = module.default || module[name] || module;
            if (name) window[name] = exportObj;
            return exportObj;
        } catch (e) {
            console.warn(`[Loader] import() failed for ${url}, trying <script> tag.`);
        }
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve(window[name] || true);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function _loadCSS(url, forceTag) {
    if (document.querySelector(`link[href="${url}"]`)) return true;

    // 策略：如果是标准 .css 且非强制 tag，尝试 @import
    const isStandard = url.match(/\.css($|\?)/);
    if (!forceTag && isStandard) {
        const style = document.createElement('style');
        style.textContent = `@import url("${url}");`;
        document.head.appendChild(style);
        return true; // 注意：@import 无法精准判断失败，默认视为成功
    }

    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

// 同时加载多个库，并指定它们的全局变量名
(async () => {
    await loadResources({
        'vectorS': 'https://6cc.github.io/9/vectorS.css', // 自动尝试 import 并挂载到 window.jsPanel
        'dayjs': 'https://gcore.jsdelivr.net/gh/Flyer53/jsPanel4/es6module/jspanel.min.css',
        'jsPanel': 'https://gcore.jsdelivr.net/gh/Flyer53/jsPanel4/es6module/jspanel.min.js'       // 自动识别为 CSS 并使用 <link> 加载
    });

    // 此时 jsPanel 已经准备好在全局使用了
    if ( window.jsPanel ) {
        jsPanel.create({
            headerTitle: 'My Panel',
            content: 'Done!'
        });
    }
})();
