let lastDestroy = null;

document.addEventListener("prenav", () => {
    if (lastDestroy) {
        lastDestroy();   // 离开页面时销毁上一次播放器
        lastDestroy = null;
    }
});

document.addEventListener("nav", async () => {
    const slug = window.location.href;
    if ( ! slug.endsWith( "_JS9" ) ) return;

    const moduleUrl = slug.slice(0, -4) + ".js";
    const module = await import ( moduleUrl );

    if (typeof module.initModule !== "function") {
        console.warn("Module has no initModule:", moduleUrl);
        return;
    }
    const res = await module.initModule();
    lastDestroy = res?.destroy || null;
});