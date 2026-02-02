/**
 * 模块：CoreLoader
 * 职责：环境适配、资源调度、单例启动
 */
const CoreLoader = {
    // 状态锁，防止在某些动态加载环境下重复触发
    isStarted: false,

    // 1. 核心启动逻辑
    async boot() {
        if (this.isStarted) return;
        this.isStarted = true;

        console.log("[Core] 🚀 发令枪响起，系统初始化...");

        try {
            // A. 执行数据获取 (Fetch 模块逻辑)
            const mdUrl = `https://raw.githubusercontent.com/qqvvv/qqvvv.github.io/master/content/9/myriaDown/allIn1.md?t=${Date.now()}`;
            const response = await fetch(mdUrl);
            const rawMD = await response.text();

            // B. 环境测速与库注入 (利用之前测通的 setupEnv)
            // 确保此时 jsPanel 等底层工具已就位
            if (typeof setupEnv === 'function') await setupEnv(rawMD);

            // C. 启动解析器
            if (typeof Parser !== 'undefined') {
                Parser.build(rawMD);
                const activeTree = Parser.activate(state.tree);
                state.tree = Parser.flatten(activeTree);
            }

            // D. 独立模块验证：自动运行一次最优镜像竞速报表
            if (typeof MirrorRacer !== 'undefined' && state.rules.templates.length > 0) {
                const bestMirror = await MirrorRacer.report(state.rules.templates, {
                    vol: "01", page: "1",
                    vReg: state.rules.volReg, pReg: state.rules.pageReg
                });
                state.activeMirror = bestMirror;
            }

            // E. 唤起 UI (如圆点菜单)
            if (typeof UI !== 'undefined') UI.render();

            console.log("[Core] ✨ 系统就绪。");

        } catch (err) {
            this.isStarted = false; // 出错时解锁，允许重试
            console.error("[Core] ☢️ 引导流程崩溃:", err);
        }
    },

    // 2. 页面适配器：确保在 DOM 准备好后启动
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.boot());
        } else {
            this.boot(); // 已经加载完了直接跑
        }
    }
};

// 立即激活引导模块
CoreLoader.init();