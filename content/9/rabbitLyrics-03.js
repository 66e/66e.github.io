export const initModule = async () => {

  // --- 1. 音频与歌词 URL ---
  const audioUrl = 'https://oss.mojidict.com/article/audio/dd16f7f0-8367-4d49-830a-3a66d0489982.mp3';
  const lyricUrl = 'https://66e.github.io/9/%E3%83%A9%E3%82%A4%E3%82%A2.lrc';

  // --- 2. 动态创建 UI ---
  const playerContainer = document.createElement('div');
  playerContainer.id = 'player-container';

  const lyricsDisplay = document.createElement('div');
  lyricsDisplay.id = 'lyrics-display';
  lyricsDisplay.textContent = '加载歌词中...';
  lyricsDisplay.style.fontSize = '20px';
  lyricsDisplay.style.height = '27em';

  const audio = document.createElement('audio');
  audio.controls = true;
  audio.src = audioUrl;

  playerContainer.appendChild(audio);
  playerContainer.appendChild(lyricsDisplay);

  const targetElem =
      document.querySelector("article.popover-hint") ||
      document.querySelector("div.markdown-body") ||
      document.body;
  targetElem.insertBefore(playerContainer, targetElem.firstChild);

  // --- 3. 动态 import ESM 版本 RabbitLyrics ---
  let RabbitLyricsConstructor;

  try {
    const module = await import(
      "https://unpkg.com/rabbit-lyrics@2.1.1/dist/rabbit-lyrics.esm.js"
    );

    RabbitLyricsConstructor = module.default;

  } catch (error) {
    console.error("加载 RabbitLyrics ESM 失败:", error);
    lyricsDisplay.textContent = `加载歌词组件失败: ${error.message}`;
    return;
  }

  // --- 4. 获取 LRC 歌词 ---
  let lrcContent = "";

  try {
    const response = await fetch(lyricUrl);
    if (!response.ok) {
      throw new Error(`HTTP 错误：${response.status}`);
    }
    lrcContent = await response.text();
  } catch (error) {
    console.error("加载歌词失败:", error);
    lyricsDisplay.textContent = `歌词加载失败: ${error.message}`;
    return;
  }

  // --- 5. 初始化 RabbitLyrics ---
  const lyrics = new RabbitLyricsConstructor(lyricsDisplay, audio, {
    lyrics: lrcContent,
    onUpdate: (data) => {

      lyricsDisplay.innerHTML = "";

      data.lines.forEach((line) => {
        const p = document.createElement("p");
        p.textContent = line.text;

        if (line === data.activeLine) {
          p.classList.add("active");
          p.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        lyricsDisplay.appendChild(p);
      });

      if (!data.activeLine && data.lines.length > 0) {
        lyricsDisplay.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
  });

  // --- 6. 播放前同步一次歌词 ---
  audio.addEventListener("canplaythrough", () => {
    if (lyrics.activeLine) {
      lyrics.update();
    }
    audio.play();
  });
};
