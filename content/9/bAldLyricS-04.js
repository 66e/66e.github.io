import initPlayer from "./APlayerLyricsModule.js";

const targetElem = document.querySelector( "article.popover-hint" ) ||
document.querySelector( "div.markdown-body" ) || document.body;

initPlayer({
    mount: targetElem,     // 安装到哪里
    audio: "https://oss.mojidict.com/article/audio/dd16f7f0-8367-4d49-830a-3a66d0489982.mp3",        // 音频地址
    lrc: "https://66e.github.io/9/%E3%83%A9%E3%82%A4%E3%82%A2.lrc",        // LRC 地址
    title: "歌曲名",
    artist: "歌手名"
    cover: "https://zweima.com/wp/wp-content/uploads/b2b99ccc4fe2b7d9e69f2b14b16b7a2e-1024x1024.jpg",
});
