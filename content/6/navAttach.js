let lastDestroy = null;

document.addEventListener("prenav", () => {
    if (lastDestroy) {
        lastDestroy();   // 离开页面时销毁上一次播放器
        lastDestroy = null;
    }
});

document.addEventListener("nav", async ( e ) => {
    const slug = e.detail.url;
    if ( ! slug.endsWith( "_JS9" ) ) return;

    const moduleUrl = "../" + slug.slice( 0, -4 ) + ".js";
    const module = await import ( moduleUrl );
    const res = await module.initModule();
    lastDestroy = res?.destroy || null;
});