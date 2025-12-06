// --- 先保证样式只插入一次 ---
function ensureRabbitLyricsStyle() {
  if (document.getElementById("rabbit-lyrics-style")) return;

  const cssUrl = "https://unpkg.com/rabbit-lyrics@2.1.1/src/index.css";

  fetch(cssUrl)
    .then((res) => res.text())
    .then((css) => {
      const style = document.createElement("style");
      style.id = "rabbit-lyrics-style";
      style.textContent = css;
      document.head.appendChild(style);
    });
}

export const initModule = async () => {

  ensureRabbitLyricsStyle();

  const audioUrl = 'https://oss.mojidict.com/article/audio/dd16f7f0-8367-4d49-830a-3a66d0489982.mp3';
  const lyricUrl = 'https://66e.github.io/9/%E3%83%A9%E3%82%A4%E3%82%A2.lrc';

  // 每次进入页面都创建新的 audio
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.src = audioUrl;

  // 强制重置状态（SPA 关键）
  audio.pause();
  audio.currentTime = 0;
  audio.load();

  // ---- UI ----
  const lyricsDisplay = document.createElement("div");
  lyricsDisplay.id = "lyrics-display";
  lyricsDisplay.style.fontSize = "20px";
  lyricsDisplay.style.height = "27em";
  lyricsDisplay.textContent = "加载歌词中...";

  const playerContainer = document.createElement("div");
  playerContainer.appendChild(audio);
  playerContainer.appendChild(lyricsDisplay);

  const root =
    document.querySelector("article.popover-hint") ||
    document.querySelector("div.markdown-body") ||
    document.body;
  root.insertBefore(playerContainer, root.firstChild);

  // ─── 加载 RabbitLyrics（避免重复导入不影响） ───
  const { default: RabbitLyrics } = await import(
    "https://unpkg.com/rabbit-lyrics@2.1.1/dist/rabbit-lyrics.esm.js"
  );

  // ─── 加载歌词文件 ───
  const lrcText = await (await fetch(lyricUrl)).text();

  // ─── 初始化歌词同步 ───
  const lyrics = new RabbitLyrics(lyricsDisplay, audio, {
    lyrics: lrcText,
    onUpdate: (state) => {
      lyricsDisplay.innerHTML = "";
      state.lines.forEach((line) => {
        const p = document.createElement("p");
        p.textContent = line.text;

        if (state.activeLine === line) {
          p.classList.add("active");
          p.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        lyricsDisplay.appendChild(p);
      });
    }
  });

  // ─── 播放控制（SPA 最稳定方式） ───
  audio.addEventListener("canplay", () => {
    audio.play();
  });
};
