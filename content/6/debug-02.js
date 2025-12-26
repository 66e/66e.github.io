async function initModule() {
  const target =
    document.querySelector("article.popover-hint") ||
    document.querySelector("div.markdown-body") ||
    document.body;

  /* ---------------- UI ---------------- */

  const input = document.createElement("input");
  input.style.width = "100%";
  input.value = "https://qqvvv.github.io/9/3.mdx";

  const textarea = document.createElement("textarea");
  textarea.style.width = "100%";
  textarea.style.height = "200px";

  const playerWrap = document.createElement("div");
  const playerMount = document.createElement("div");
  const lyricsMount = document.createElement("div");

  playerWrap.append(playerMount, lyricsMount);
  target.prepend(playerWrap, textarea, input);

  let destroyPlayer = null;

  async function reload(mdText) {
    destroyPlayer?.();
    const { destroy } = await initPlayer({
      mount: playerMount,
      lyricsMount,
      mdText
    });
    destroyPlayer = destroy;
  }

  input.addEventListener("keydown", async e => {
    if (e.key !== "Enter") return;
    const md = await (await fetch(input.value)).text();
    textarea.value = md;
    reload(md);
  });

  textarea.addEventListener("input", () => {
    reload(textarea.value);
  });
}

/* ============================================================
 * Player + Lyrics
 * ============================================================ */

async function initPlayer({ mount, lyricsMount, mdText }) {
  await import("https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js");

  if (!document.querySelector("#aplayer-css")) {
    const css = document.createElement("link");
    css.id = "aplayer-css";
    css.rel = "stylesheet";
    css.href =
      "https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css";
    document.head.appendChild(css);
  }

  const { audioList } = parseMdonLite(mdText);
  if (!audioList.length) throw new Error("No tracks");

  mount.innerHTML = "";
  lyricsMount.innerHTML = "";

  const ap = new APlayer({
    container: mount,
    audio: audioList,
    autoplay: false,
    lrcType: 0
  });

  /* ---------------- Lyrics View ---------------- */

  const lyricBox = createLyricsView();
  lyricsMount.appendChild(lyricBox.el);

  let lyrics = [];
  let active = -1;

  async function loadLyrics() {
    lyricBox.clear();
    lyrics = [];
    active = -1;

    const index = ap.list.index;
    const item = audioList[index];
    if (!item?.lrc) return;

    const text = await (await fetch(item.lrc)).text();
    lyrics = parseLrc(text);
    lyricBox.setLines(lyrics);
  }

  function sync() {
    if (!lyrics.length) return;

    const t = ap.audio.currentTime;
    for (let i = 0; i < lyrics.length; i++) {
      if (
        i === lyrics.length - 1 ||
        (t >= lyrics[i].time && t < lyrics[i + 1].time)
      ) {
        if (i !== active) {
          active = i;
          lyricBox.highlight(i);
        }
        break;
      }
    }
  }

  lyricBox.onLineClick(i => {
    const line = lyrics[i];
    if (line) ap.seek(line.time);
  });

  ap.on("timeupdate", sync);
  ap.on("listswitch", () => {
    Promise.resolve().then(loadLyrics);
  });

  await loadLyrics();

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
 * mdonLite
 * ============================================================ */

function parseMdonLite(md) {
  const lines = md.split(/\r?\n/);
  const list = [];
  let cur = null;
  let field = null;

  for (const l of lines) {
    if (l.startsWith("## ")) {
      if (cur?.audio) list.push(cur);
      cur = { name: l.slice(3).trim() };
      field = null;
      continue;
    }
    if (l.startsWith("### ") && cur) {
      field = l.slice(4).trim();
      cur[field] = "";
      continue;
    }
    if (cur && field && l.trim()) {
      cur[field] += l.trim();
    }
  }
  if (cur?.audio) list.push(cur);

  return {
    audioList: list.map(t => ({
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
  const out = [];
  const re = /\[(\d+):(\d+(?:\.\d+)?)\](.*)/;

  text.split(/\r?\n/).forEach(l => {
    const m = re.exec(l);
    if (!m) return;
    out.push({
      time: +m[1] * 60 + +m[2],
      text: m[3].trim()
    });
  });

  return out.sort((a, b) => a.time - b.time);
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

  function highlight(i) {
    if (active) active.style.color = "";
    const p = ps[i];
    if (!p) return;

    p.style.color = "#f55";
    active = p;

    requestAnimationFrame(() => {
      const top =
        p.offsetTop - el.clientHeight * 0.45 + p.clientHeight / 2;
      el.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
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
