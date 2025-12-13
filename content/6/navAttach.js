let lastDestroy = null;

document.addEventListener("nav", async ( e ) => {
    const slug = e.detail.url;
    if (lastDestroy) {
        lastDestroy();   // 离开页面时销毁上一次播放器
        lastDestroy = null;
    }

    if ( slug.endsWith( "_JS9" ) ) {
        const moduleUrl = "../" + slug.slice( 0, -4 ) + ".js";
        const module = await import ( moduleUrl );

        if ( module.initModule ) {
            const ret = await module.initModule();
            
            if (ret && typeof ret.destroy === "function") {
                lastDestroy = ret.destroy;
            }
        }
    }
});