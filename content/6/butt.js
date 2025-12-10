export default async function initPlayer(options = {}) {

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
    const playlist = options.playlist || [];

    if (!Array.isArray(playlist) || playlist.length === 0)
        throw new Error("playlist must be a non-empty array");

    // 转成 APlayer 数据结构
    const ap = new APlayer({
        container,
        fixed: false,
        audio: playlist.map(item => ({
            name: item.title,
            artist: item.artist,
            url: item.audio,
            cover: item.cover,
        })),
        lrcType: 0, // 不使用 APlayer 内置 LRC
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
        const item = playlist[index];
        if (!item.lrcExt) {
            currentExtLrc = [];
            renderLyrics();
            return;
        }

        const res = await fetch(item.lrcExt);
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
        updateHighlight(ap.audio.current.currentTime);
    });

    return ap;
}
