import initPlayer from "./APlayerLyricsModule.js";

export default async function initLyricsPage() {
    const targetElem =
        document.querySelector("article.popover-hint") ||
        document.querySelector("div.markdown-body") ||
        document.body;

    return initPlayer({
        mount: targetElem,
        audio: "https://oss.mojidict.com/article/audio/dd16f7f0-8367-4d49-830a-3a66d0489982.mp3",
        lrc: "https://66e.github.io/9/%E3%83%A9%E3%82%A4%E3%82%A2.lrc",
        cover: "https://zweima.com/wp/wp-content/uploads/b2b99ccc4fe2b7d9e69f2b14b16b7a2e-1024x1024.jpg",
        title: "ライア",
        artist: "Zwei",
    });
}
