async function initModule(inputArray) {
  // 加载 APlayer JS
  await import("https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js");

  // 加载 CSS
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css";
  document.head.appendChild(style);

  // ------------------------
  // 1. 格式化数据结构
  // ------------------------
  const playlist = inputArray.audio.map(item => ({
    // APlayer 标准字段
    name: item.name,
    artist: item.artist,
    url: item.url,
    cover: item.cover,
    lrc: item.lrc,
    theme: item.theme,

    // 自定义部分（给 CustomLyrics 用）
    lrcExt: item.lrc
  }));

  // ------------------------
  // 2. 初始化 APlayer
  // ------------------------
  const div = document.body.appendChild(document.createElement("div"));
  const ap = new APlayer({
    container: div,
    audio: playlist,
    lrcType: 0    // 禁用 APlayer 自带歌词
  });

  // ------------------------
  // 3. CustomLyrics 模块
  // ------------------------
  const customLyrics = createCustomLyrics(); // ↓↓↓ 下面会定义

  // 挂载初始歌词
  customLyrics.loadLyrics(playlist[0].lrcExt);
  customLyrics.attachAudio(ap.audio);
  customLyrics.render();


  // ------------------------
  // 4. 切歌事件 — 必须重新绑定歌词
  // ------------------------
  ap.on('listswitch', index => {

    const item = playlist[index];

    customLyrics.loadLyrics(item.lrcExt);   // 换歌词
    customLyrics.attachAudio(ap.audio);     // 换 audio
    customLyrics.render();                  // 重新渲染 DOM
    customLyrics.resetScrollState();        // 非必须，视你之前的逻辑

  });


  // ============================================================
  // 5. 返回值（可选）供外部操作
  // ============================================================
  return {
    ap,
    playlist,
    customLyrics
  };
}



// ===================================================================
// 自定义歌词模块（最小精简版，只含必要功能）
// ===================================================================
function createCustomLyrics() {

  let audio = null;
  let lrcText = "";
  let parsed = [];
  let containerCL = document.getElementById("custom-lyrics");

  // 用户行为锁定滚动的开关
  let userBehavior = false;

  // ------------------------
  // 解析 LRC
  // ------------------------
  function parseLrc(text) {
    const lines = text.split("\n");
    const result = [];
    for (const l of lines) {
      const match = l.match(/\[(\d+):(\d+\.\d+)\](.*)/);
      if (match) {
        const t = parseInt(match[1]) * 60 + parseFloat(match[2]);
        result.push({ time: t, text: match[3] });
      }
    }
    return result;
  }

  // ------------------------
  // 渲染 DOM
  // ------------------------
  function render() {
    containerCL.innerHTML = "";
    parsed.forEach((line, i) => {
      const div = document.createElement("div");
      div.className = "lyric-line";
      div.dataset.index = i;
      div.textContent = line.text;
      containerCL.appendChild(div);
    });
  }

  // ------------------------
  // 自动滚动逻辑
  // ------------------------
  function update() {
    if (!audio || userBehavior) return;

    const ct = audio.currentTime;

    let idx = parsed.findIndex((l, i) =>
      ct >= l.time && (i === parsed.length - 1 || ct < parsed[i + 1].time)
    );

    if (idx === -1) return;

    const active = containerCL.querySelector(".lyric-line.active");
    if (active) active.classList.remove("active");

    const cur = containerCL.querySelector(`[data-index="${idx}"]`);
    if (cur) {
      cur.classList.add("active");
      cur.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }


  // ------------------------
  // 用户行为暂停滚动
  // ------------------------
  function bindUserBehaviorLock() {
    ["scroll", "mousemove", "touchstart", "touchmove"].forEach(evt => {
      containerCL.addEventListener(evt, () => {
        userBehavior = true;
      });
    });
  }
  bindUserBehaviorLock();

  function resetScrollState() {
    userBehavior = false;
  }


  // ------------------------
  // 公共 API
  // ------------------------
  return {

    loadLyrics(text) {
      lrcText = text || "";
      parsed = parseLrc(lrcText);
    },

    attachAudio(a) {
      audio = a;
      audio.addEventListener("timeupdate", update);
    },

    render,
    resetScrollState
  };
}

const targetElem =
  document.querySelector("article.popover-hint") ||
  document.body;

initModule({
  mount: targetElem,
  autoplay: true,
  lrcType: 0,
  audio: [
    {
      name: 'ライア',
      artist: 'Zwei',
      url: 'https://oss.mojidict.com/article/audio/dd16f7f0-8367-4d49-830a-3a66d0489982.mp3',
      cover: 'https://zweima.com/wp/wp-content/uploads/b2b99ccc4fe2b7d9e69f2b14b16b7a2e-1024x1024.jpg',
      lrc: 'https://qqvvv.github.io/9/%E3%83%A9%E3%82%A4%E3%82%A2.lrc',
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