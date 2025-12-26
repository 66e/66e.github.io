async function initModule() {
  const targetElem =
    document.querySelector("article.popover-hint") ||
    document.querySelector("div.markdown-body") ||
    document.body;

  /* ===========================
   * 控制条（永远可见）
   * =========================== */

  const controlBar = document.createElement("div");
  controlBar.style.marginBottom = "0.5em";

  const input = document.createElement("input");
  input.type = "text";
  input.value = "https://qqvvv.github.io/9/3.markdown";
  input.style.width = "60%";

  const btnLoad = document.createElement("button");
  btnLoad.textContent = "Load";

  const btnToggle = document.createElement("button");
  btnToggle.textContent = "≡";
  btnToggle.style.marginLeft = "0.5em";

  controlBar.append(input, btnLoad, btnToggle);

  /* ===========================
   * 编辑面板（可隐藏）
   * =========================== */

  const editorPanel = document.createElement("div");

  const textarea = document.createElement("textarea");
  textarea.style.width = "100%";
  textarea.style.height = "200px";

  editorPanel.appendChild(textarea);

  /* ===========================
   * 播放器 + 歌词外壳
   * =========================== */

  const playerWrap = document.createElement("div");
  const playerMount = document.createElement("div"); // APlayer 专用
  const lyricsMount = document.createElement("div"); // 歌词专用

  playerWrap.append(playerMount, lyricsMount);

  targetElem.prepend(playerWrap);
  targetElem.prepend(editorPanel);
  targetElem.prepend(controlBar);

  /* ===========================
   * 实例管理
   * =========================== */

  let destroyPlayer = null;
  let panelVisible = true;

  async function reloadPlayer(mdText) {
    destroyPlayer?.();

    const { destroy } = await initPlayer({
      mount: playerMount,
      lyricsMount,
      mdText
    });

    destroyPlayer = destroy;

    editorPanel.style.display = "none";
    panelVisible = false;
  }

  async function loadFromInput() {
    const res = await fetch(input.value.trim());
    const mdText = await res.text();
    textarea.value = mdText;
    reloadPlayer(mdText);
  }

  input.onkeydown = e => e.key === "Enter" && loadFromInput();
  btnLoad.onclick = loadFromInput;

  btnToggle.onclick = () => {
    panelVisible = !panelVisible;
    editorPanel.style.display = panelVisible ? "" : "none";
  };

  let timer = null;
  textarea.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => reloadPlayer(textarea.value), 500);
  };

  return {
    destroy() {
      destroyPlayer?.();
      controlBar.remove();
      editorPanel.remove();
      playerWrap.remove();
    }
  };
}

/* ============================================================
 * Player
 * ============================================================ */

async function initPlayer({ mount, lyricsMount, mdText }) {
  await import("https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js");

  if (!document.querySelector("#aplayer-css")) {
    const css = document.createElement("link");
    css.id = "aplayer-css";
    css.rel = "stylesheet";
    css.href = "https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css";
    document.head.appendChild(css);
  }

  const { audioList, autoplay } = parseMdonLite(mdText);

  const ap = new APlayer({
    container: mount,
    audio: audioList,
    autoplay: false,
    lrcType: 3
  });

  const lyricBox = createLyricsView();
  lyricsMount.innerHTML = "";
  lyricsMount.appendChild(lyricBox.el);

  let currentLyrics = [];
  let activeIndex = -1;

  async function loadLyrics(index) {
    activeIndex = -1;
    lyricBox.clear();

    const item = audioList[index];
    if (!item?.lrc) return;

    const text = await (await fetch(item.lrc)).text();
    currentLyrics = parseLrc(text);
    lyricBox.setLines(currentLyrics);
  }

  function syncHighlight() {
    if (!currentLyrics.length) return;

    const t = ap.audio.currentTime;
    for (let i = 0; i < currentLyrics.length; i++) {
      if (
        i === currentLyrics.length - 1 ||
        (t >= currentLyrics[i].time && t < currentLyrics[i + 1].time)
      ) {
        if (i !== activeIndex) {
          activeIndex = i;
          lyricBox.highlight(i);
        }
        break;
      }
    }
  }

  lyricBox.onLineClick(i => {
    const line = currentLyrics[i];
    if (line) ap.seek(line.time);
  });

  ap.on("timeupdate", syncHighlight);
  ap.on("listswitch", loadLyrics);

  await loadLyrics(ap.list.index);

  if (autoplay) ap.on("canplay", () => ap.play());

  return {
    destroy() {
      ap.destroy();
      lyricBox.destroy();
      mount.innerHTML = "";
      lyricsMount.innerHTML = "";
    }
  };
}

/* ============================================================
 * mdonLite parser
 * ============================================================ */

function parseMdonLite(md) {
  const lines = md.split(/\r?\n/);

  const audioList = [];
  let current = null;
  let field = null;
  let autoplay = false;

  for (const line of lines) {
    if (line.startsWith("## autoplay")) continue;

    if (line === "true") autoplay = true;

    if (line.startsWith("## ")) {
      if (current?.audio) audioList.push(current);
      current = { name: line.slice(3).trim() };
      field = null;
      continue;
    }

    if (line.startsWith("### ") && current) {
      field = line.slice(4).trim();
      current[field] = "";
      continue;
    }

    if (current && field && line.trim()) {
      current[field] += line.trim();
    }
  }

  if (current?.audio) audioList.push(current);

  return {
    autoplay,
    audioList: audioList.map(t => ({
      name: t.trackName || t.name || "",
      artist: t.trackArtist || "",
      url: t.audio || "",
      cover: t.cover || "",
      lrc: t.lrc || ""
    }))
  };
}

/* ============================================================
 * LRC
 * ============================================================ */

function parseLrc(text) {
  const lines = [];
  const re = /\[(\d+):(\d+(?:\.\d+)?)\](.*)/;

  text.split(/\r?\n/).forEach(line => {
    const m = re.exec(line);
    if (!m) return;

    lines.push({
      time: parseInt(m[1]) * 60 + parseFloat(m[2]),
      text: m[3].trim()
    });
  });

  return lines.sort((a, b) => a.time - b.time);
}

/* ============================================================
 * Lyrics View
 * ============================================================ */

function createLyricsView() {
  const el = document.createElement("div");
  el.style.maxHeight = "20em";
  el.style.overflowY = "auto";
  el.style.marginTop = "1em";

  let ps = [];
  let active = null;
  let onClick = null;

  function setLines(lines) {
    el.innerHTML = "";
    ps = lines.map((l, i) => {
      const p = document.createElement("p");
      p.textContent = l.text;
      p.onclick = () => onClick?.(i);
      el.appendChild(p);
      return p;
    });
  }

  function highlight(index) {
    if (active) active.style.color = "";
    const p = ps[index];
    if (!p) return;

    p.style.color = "#f55";
    active = p;

    const target =
      p.offsetTop -
      el.clientHeight * 0.45 +
      p.clientHeight / 2;

    el.scrollTo({
      top: Math.max(0, target),
      behavior: "smooth"
    });
  }

  return {
    el,
    setLines,
    highlight,
    onLineClick(fn) {
      onClick = fn;
    },
    clear() {
      el.innerHTML = "";
      ps = [];
      active = null;
    },
    destroy() {
      el.remove();
    }
  };
}

initModule();