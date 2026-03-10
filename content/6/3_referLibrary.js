/**
 * 核心模块：referLibrary (底座增强版)
 * 特色：
 * 1. 自动挂载：ESM 导出自动映射到 window[name]
 * 2. 样式追踪：给 style 标签增加 ID，支持 @import
 * 3. 异步健壮：支持 Promise 并行，个体失败不阻塞
 */

export async function referLibrary(inputs, { callback, forceTag = false } = {}) {
    // 1. 标准化输入
    let tasks = [];
    if (typeof inputs === 'string') {
        tasks = [{ name: null, url: inputs }];
    } else if (Array.isArray(inputs)) {
        tasks = inputs.filter(u => u && typeof u === 'string').map(u => ({ name: null, url: u }));
    } else {
        tasks = Object.entries(inputs).map(([name, url]) => ({ name, url }));
    }

    // 2. 并行执行任务
    const results = await Promise.all(tasks.map(async (task) => {
        const { name, url } = task;
        const isCSS = url.match(/\.(css|CSS)($|\?)/) || url.includes('_CSS.md');

        try {
            if (isCSS) {
                return await _loadCSS(url, name, forceTag);
            } else {
                return await _loadJS(url, name, forceTag);
            }
        } catch (err) {
            console.error(`[Loader] Failed to load: ${url}`, err);
            return null;
        }
    }));

    if (callback) callback(results);
    return results;
}

// --- 内部核心逻辑 ---

async function _loadJS(url, name, forceTag) {
    // 检查是否已存在
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) return name ? window[name] : true;

    // 策略：优先 import()，支持 ESM 自动挂载到全局
    if (!forceTag) {
        try {
            const module = await import(url);
            // 逻辑：如果有 name，自动挂载到全局
            if (name) {
                // 如果模块只有 default 导出，直接取 default
                // 如果有多个导出，则挂载整个模块对象
                window[name] = (Object.keys(module).length === 1 && module.default) 
                               ? module.default 
                               : module;
            }
            return module;
        } catch (e) {
            console.warn(`[Loader] ESM import() failed for ${url}, falling back to script tag.`);
        }
    }

    // 回退到传统 script 标签
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.setAttribute('data-loader', 'referLibrary');
        script.onload = () => resolve(name ? window[name] : true);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function _loadCSS(url, name, forceTag) {
    const styleId = name ? `style-${name}` : `style-css-${Math.random().toString(36).substr(2, 5)}`;
    
    // 检查 ID 或 URL 是否已存在
    if (document.getElementById(styleId) || document.querySelector(`link[href="${url}"]`)) return true;

    // 策略：优先使用 style + @import 模式（保留你的核心逻辑）
    const isStandard = url.match(/\.css($|\?)/);
    if (!forceTag && isStandard) {
        return new Promise((resolve) => {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `@import url("${url}");`;
            document.head.appendChild(style);
            
            // @import 无法精准检测完成，延迟一帧 resolve 确保渲染开始
            requestAnimationFrame(() => resolve(style));
        });
    }

    // 回退到传统 link 标签
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = () => resolve(link);
        link.onerror = reject;
        document.head.appendChild(link);
    });
}