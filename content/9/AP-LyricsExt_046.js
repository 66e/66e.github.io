import initPlayer from "./AP-LyricsSync.js";

export async function initModule () {
    const targetElem =
    document.querySelector("article.popover-hint") ||
    document.body;
    const destroy = await initPlayer({
        mount: targetElem,
        autoplay: true,
        lrcType: 3,
        audio: [
            {
                name: 'ライア',
                artist: 'Zwei',
                url: 'https://oss.mojidict.com/article/audio/dd16f7f0-8367-4d49-830a-3a66d0489982.mp3',
                cover: 'https://zweima.com/wp/wp-content/uploads/b2b99ccc4fe2b7d9e69f2b14b16b7a2e-1024x1024.jpg',
                lrc: 'https://qqvvv.github.io/9/%E3%83%A9%E3%82%A4%E3%82%A2.lrc',
            },
            {
                name: 'Two Occasions',
                artist: 'Jay R Sillona',
                url: 'https://api.injahow.cn/meting/?type=url&id=4453521',
                cover: 'http://p1.music.126.net/wAsLJMHAZUXxWksKX1QwfA==/848822976677760.jpg?param=130y130',
                lrc: 'https://api.injahow.cn/meting/?type=lrc&id=4453521',
                theme: '#46718b'
            },
            {
                name: '守候',
                artist: '赵英俊',
                url: 'https://api.injahow.cn/meting/?type=url&id=455345562',
                cover: 'https://img2.kuwo.cn/star/albumcover/500/33/47/409996676.jpg',
                lrc: 'https://api.injahow.cn/meting/?type=lrc&id=455345562',
                theme: '#ebd0c2'
            }
        ]
    });

    return {
        destroy
    };
}
