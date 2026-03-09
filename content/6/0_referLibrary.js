/**
 * 核心模块：referLibrary (ESM 驱动版)
 * 支持：动态解构、CSS 自动注入、Promise 链式调用
 */

export async function referLibrary(resources) {
    const results = {};
    const promises = Object.entries(resources).map(async ([key, url]) => {
        // --- 处理 CSS ---
        if (url.endsWith('.css') || url.includes('css')) {
            if (!document.querySelector(`link[href="${url}"]`)) {
                return new Promise((resolve, reject) => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = url;
                    link.onload = () => resolve({ [key]: true });
                    link.onerror = () => reject(`CSS加载失败: ${url}`);
                    document.head.appendChild(link);
                });
            }
            return { [key]: true };
        }

        // --- 处理 JS (ESM 模式) ---
        if (url.endsWith('.js') || url.includes('js')) {
            try {
                // 核心改动：使用动态 import 拿到导出项
                const module = await import(url);
                return { [key]: module };
            } catch (err) {
                console.error(`JS模块加载失败: ${url}`, err);
                // 降级处理：如果不是 ESM，尝试用 script 标签加载
                return new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = url;
                    script.onload = () => resolve({ [key]: window[key] || true });
                    document.head.appendChild(script);
                });
            }
        }
    });

    // 等待所有资源加载完成
    const loadedResources = await Promise.all(promises);
    
    // 将数组结果整合回对象
    loadedResources.forEach(res => {
        if (res) Object.assign(results, res);
    });

    return results; // 返回包含所有模块的对象
}