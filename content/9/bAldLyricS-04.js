import initPlayer from "./APlayerLyricsModule.js";

export async function initModule () {
    const targetElem =
        document.querySelector("article.popover-hint") ||
        document.querySelector("div.markdown-body") ||
        document.body;

    return initPlayer({
        mount: targetElem,
        autoplay: true,
        lrcType: 0,
        audio: [
            {
                name: 'ライア',
                artist: 'Zwei',
                url: 'https://oss.mojidict.com/article/audio/dd16f7f0-8367-4d49-830a-3a66d0489982.mp3',
                cover: 'https://zweima.com/wp/wp-content/uploads/b2b99ccc4fe2b7d9e69f2b14b16b7a2e-1024x1024.jpg',
                lrc: 'https://66e.github.io/9/%E3%83%A9%E3%82%A4%E3%82%A2.lrc',
                theme: '#ebd0c2'
            },
            {
                name: 'name2',
                artist: 'artist2',
                url: 'https://raw.githubusercontent.com/mcanam/assets/main/liricle-demo/audio.mp3',
                cover: 'cover2.jpg',
                lrc: 'https://raw.githubusercontent.com/mcanam/assets/main/liricle-demo/lyric-enhanced.lrc',
                theme: '#46718b'
            },
            {
                name: 'name1',
                artist: 'artist1',
                url: 'https://www.jplayer.org/audio/m4a/Miaow-07-Bubble.m4a',
                cover: 'cover1.jpg',
                lrc: 'https://www.eev3.com/plug/down.php?ac=music&lk=lrc&id=vwnhvkhwk',
                theme: '#ebd0c2'
            }
        ]
    });
}
