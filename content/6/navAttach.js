document.addEventListener("nav", ( e ) => {
    const slug = e.detail.url
    if ( slug.endsWith( "_JS9" ) ) {
        const loadModule = ( moduleUrl ) => {
            const module = import ( moduleUrl );
            return module;
        }

        ( async () => {
            const url = "../" + slug.slice( 0, -4 ) + ".js";
            try {
                const module = await loadModule ( url );
                if ( module.initModule ) {
                    console.log( "nav" );
                    module.initModule ();
                }
                } catch (error) {
                    console.error(error);
                }
        }) ();
    }
})