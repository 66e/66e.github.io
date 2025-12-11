async function initPlayer(options = {}) {

  // 加载 APlayer JS
  await import("https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js");

  // 加载 CSS
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css";
  document.head.appendChild(style);

  const mount = options.mount;
  if (!mount) throw new Error("Missing mount element");

  // 创建 APlayer 容器
  const container = document.createElement("div");
  mount.appendChild(container);

  // 播放列表
  const audioIn = options.audio || [];

  if (!Array.isArray(audioIn) || audioIn.length === 0)
    throw new Error("playlist must be a non-empty array");

  // 转成 APlayer 数据结构
  const ap = new APlayer({
    container,
    fixed: options.fixed,
    lrcType: options.lrcType,
    autoplay: options.autoplay,
    audio: audioIn.map(item => ({
      name: item.name,
      artist: item.artist,
      url: item.url,
      cover: item.cover,
      lrc: item.lrc,
      theme: item.theme,
    })),
  });

  // ──────────────────────────────────────────
  //   自定义外部歌词 lrcExt（RabbitLyrics 风格）
  // ──────────────────────────────────────────

  const lyricsPanel = document.createElement("div");
  lyricsPanel.style.padding = "12px 0";
  lyricsPanel.style.fontSize = "15px";
  lyricsPanel.style.lineHeight = "1.7em";
  lyricsPanel.style.maxHeight = "260px";
  lyricsPanel.style.overflow = "auto";
  lyricsPanel.style.borderTop = "1px solid #ddd";
  mount.appendChild(lyricsPanel);

  // 当前歌词数据
  let currentExtLrc = [];
  let userScroll = false;
  let autoScrollTimer = null;

  // 监听用户滚动
  ["scroll", "wheel", "touchstart", "touchmove", "mousedown"].forEach(ev =>
    lyricsPanel.addEventListener(ev, () => {
      userScroll = true;
      clearTimeout(autoScrollTimer);
      autoScrollTimer = setTimeout(() => userScroll = false, 3000);
    })
  );

  // 解析 LRC
  function parseLrc(text) {
    const lines = text.split(/\r?\n/);
    const result = [];
    const timeReg = /\[(\d+):(\d+\.\d+)\]/;

    for (let line of lines) {
      const m = timeReg.exec(line);
      if (!m) continue;
      const time = parseFloat(m[1]) * 60 + parseFloat(m[2]);
      const text = line.replace(timeReg, "").trim();
      result.push({ time, text });
    }
    return result.sort((a, b) => a.time - b.time);
  }

  // 显示歌词
  function renderLyrics() {
    lyricsPanel.innerHTML = "";
    for (let line of currentExtLrc) {
      const p = document.createElement("p");
      p.className = "lrc-line";
      p.textContent = line.text;
      p.dataset.time = line.time;
      p.style.margin = "4px 0";
      p.style.padding = "2px 0";
      lyricsPanel.appendChild(p);
    }
  }

  // 根据时间高亮
  function updateHighlight(currentTime) {
    let active = null;

    for (let i = 0; i < currentExtLrc.length; i++) {
      if (currentExtLrc[i].time <= currentTime) {
        active = i;
      }
    }

    [...lyricsPanel.querySelectorAll(".lrc-line")].forEach((p, index) => {
      if (index === active) {
        p.style.color = "#d33";
        p.style.fontWeight = "bold";

        if (!userScroll) {
          p.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        p.style.color = "";
        p.style.fontWeight = "";
      }
    });
  }

  // 点击跳转
  lyricsPanel.addEventListener("click", (e) => {
    const p = e.target.closest(".lrc-line");
    if (!p) return;
    const t = parseFloat(p.dataset.time);
    ap.seek(t);
  });

  // ──────────────────────────────────────────
  //   加载当前歌曲的 lrcExt
  // ──────────────────────────────────────────
  async function loadExtLrc(index) {
    const item = audioIn[index];
    if (!item.lrc) {
      currentExtLrc = [];
      renderLyrics();
      return;
    }

    const res = await fetch(item.lrc);
    const text = await res.text();
    currentExtLrc = parseLrc(text);
    renderLyrics();
  }

  // 初次加载
  await loadExtLrc(0);

  // 切歌时载入新歌词
  ap.on("listswitch", async (index) => {
    await loadExtLrc(index);
  });

  // 播放时更新高亮
  ap.on("timeupdate", () => {
    updateHighlight(ap.audio.currentTime);
  });

  return ap;
}
targetElem =
        document.querySelector("article.popover-hint") ||
        document.querySelector("div.markdown-body") ||
        document.body;
initPlayer({
  mount: targetElem,
  autoplay: true,
  lrcType: 3,
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