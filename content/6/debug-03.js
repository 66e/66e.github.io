async function initModule() {
  const targetElem =
    document.querySelector("article.popover-hint") ||
    document.querySelector("div.markdown-body") ||
    document.body;

  /* ---------------------------
   * UI
   * --------------------------- */

  const input = document.createElement("input");
  input.style.width = "100%";
  input.value = "https://fastly.jsdelivr.net/gh/qqvvv/qqvvv.github.io/content/9/3.md";

  const textarea = document.createElement("textarea");
  textarea.style.width = "100%";
  textarea.style.height = "200px";

  const mount = document.createElement("div");

  targetElem.prepend(mount);
  targetElem.prepend(textarea);
  targetElem.prepend(input);

  let destroyPlayer = null;

  async function reload(mdText) {
    if (destroyPlayer) {
      destroyPlayer();
      destroyPlayer = null;
    }

    const { destroy } = await initPlayer({
      mount,
      mdText
    });

    destroyPlayer = destroy;
  }

  input.addEventListener("keydown", async e => {
    if (e.key !== "Enter") return;
    const res = await fetch(input.value);
    const md = await res.text();
    textarea.value = md;
    reload(md);
  });

  textarea.addEventListener("input", () => {
    reload(textarea.value);
  });

  return {
    destroy() {
      if (destroyPlayer) destroyPlayer();
      input.remove();
      textarea.remove();
      mount.remove();
    }
  };
}

/* ============================================================
 * Player
 * ============================================================ */

async function initPlayer({ mount, mdText }) {
  await import("https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js");

  if (!document.querySelector("#aplayer-css")) {
    const link = document.createElement("link");
    link.id = "aplayer-css";
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css";
    document.head.appendChild(link);
  }

  const audioList = parseMdonLite(mdText);
  if (!audioList.length) throw new Error("No tracks");

  mount.innerHTML = "";

  const ap = new APlayer({
    container: mount,
    audio: audioList,
    lrcType: 3
  });

  /* ---------------------------
   * Lyrics
   * --------------------------- */

  const lyricBox = createLyricsView();
  mount.appendChild(lyricBox.el);

  let lyrics = [];
  let activeIndex = -1;

  async function loadLyrics(index) {
    activeIndex = -1;
    lyricBox.clear();

    const item = audioList[index];
    if (!item?.lrc) return;

    const res = await fetch(item.lrc);
    const text = await res.text();
    lyrics = parseLrc(text);
    lyricBox.setLines(lyrics);
  }

  function sync() {
    if (!lyrics.length) return;
    const t = ap.audio.currentTime;

    if (t <= lyrics[0].time) {
      if (activeIndex !== 0) {
        activeIndex = 0;
        lyricBox.highlight(0);
      }
      return;
    }

    for (let i = 0; i < lyrics.length - 1; i++) {
      if (t >= lyrics[i].time && t < lyrics[i + 1].time) {
        if (i !== activeIndex) {
          activeIndex = i;
          lyricBox.highlight(i);
        }
        break;
      }
    }
  }

  ap.on("play", sync);
  ap.on("timeupdate", sync);
  ap.on("listswitch", ({ index }) => loadLyrics(index));

  await loadLyrics(ap.list.index);

  return {
    destroy() {
      ap.pause();
      ap.off("play");
      ap.off("timeupdate");
      ap.off("listswitch");
      ap.destroy();
      lyricBox.destroy();
      mount.innerHTML = "";
    }
  };
}

/* ============================================================
 * mdonLite
 * ============================================================ */

function parseMdonLite(md) {
  const lines = md.split(/\r?\n/);
  const tracks = [];
  let cur = null;
  let field = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (cur?.audio) tracks.push(cur);
      cur = { name: line.slice(3).trim() };
      field = null;
      continue;
    }
    if (line.startsWith("### ") && cur) {
      field = line.slice(4).trim();
      continue;
    }
    if (cur && field && line.trim()) {
      cur[field] = line.trim();
    }
  }
  if (cur?.audio) tracks.push(cur);

  return tracks.map(t => ({
    name: t.name,
    artist: t.artist || "",
    url: t.audio,
    cover: t.cover || "",
    lrc: t.lrc || ""
  }));
}

/* ============================================================
 * LRC
 * ============================================================ */

function parseLrc(text) {
  const out = [];
  const r = /\[(\d+):(\d+(?:\.\d+)?)\](.*)/;

  text.split(/\r?\n/).forEach(l => {
    const m = r.exec(l);
    if (!m) return;
    out.push({
      time: +m[1] * 60 + +m[2],
      text: m[3].trim()
    });
  });

  return out.sort((a, b) => a.time - b.time);
}

/* ============================================================
 * Lyrics View (no magic offset)
 * ============================================================ */

function createLyricsView() {
  const el = document.createElement("div");
  el.style.maxHeight = "20em";
  el.style.overflowY = "auto";

  let ps = [];
  let active = null;

  function setLines(lines) {
    el.innerHTML = "";
    ps = lines.map((l, i) => {
      const p = document.createElement("p");
      p.textContent = l.text;
      p.addEventListener("click", () => {
        window.__aplayer?.seek(l.time);
      });
      el.appendChild(p);
      return p;
    });
  }

  function highlight(i) {
    if (active) active.style.color = "";
    const p = ps[i];
    if (!p) return;

    p.style.color = "#f55";
    active = p;

    const lineRect = p.getBoundingClientRect();
    const boxRect = el.getBoundingClientRect();

    const target =
      lineRect.top -
      boxRect.top +
      el.scrollTop -
      el.clientHeight / 2 +
      lineRect.height / 2;

    el.scrollTo({ top: target, behavior: "smooth" });
  }

  return {
    el,
    setLines,
    highlight,
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
