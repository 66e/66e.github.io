// APlayerLyricsModule.js  —— 完整 export 模块
export default async function initPlayer(options) {
    const {
        mount = document.body,
        audio,
        lrc,
        cover,
        autoplay,
        title = "",
        artist = ""
    } = options;

    // -------------------------------------------------------
    // ① 动态加载 APlayer CSS（SPA 安全，不重复加载）
    // -------------------------------------------------------
    function loadCss() {
        if (document.getElementById("aplayer-css")) return;

        const link = document.createElement("link");
        link.id = "aplayer-css";
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css";
        document.head.appendChild(link);
    }

    // -------------------------------------------------------
    // ② 动态加载 APlayer JS（ESM 安全）
    // -------------------------------------------------------
    async function loadAPlayer() {
        if (window.APlayer) return window.APlayer;

        await import("https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js");
        return window.APlayer;
    }

    loadCss();
    const APlayer = await loadAPlayer();

    // -------------------------------------------------------
    // ③ 创建容器 (player + lyrics)
    // -------------------------------------------------------
    const wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    wrapper.style.maxWidth = "800px";
    wrapper.style.margin = "0 auto";

    const playerDiv = document.createElement("div");
    const lyricsDiv = document.createElement("div");

    lyricsDiv.style.height = "27em";
    lyricsDiv.style.overflowY = "auto";
    lyricsDiv.style.padding = "10px";
    lyricsDiv.style.fontSize = "18px";
    lyricsDiv.style.lineHeight = "1.5";
    lyricsDiv.style.border = "1px solid #ddd";
    lyricsDiv.style.marginTop = "8px";
    lyricsDiv.style.borderRadius = "8px";

    wrapper.appendChild(playerDiv);
    wrapper.appendChild(lyricsDiv);
    mount.appendChild(wrapper);

    // -------------------------------------------------------
    // ④ 获取 LRC 文本
    // -------------------------------------------------------
    const lrcText = await fetch(lrc).then(r => r.text());

    // -------------------------------------------------------
    // ⑤ 初始化 APlayer
    // -------------------------------------------------------
    const ap = new APlayer({
        container: playerDiv,
        autoplay: autoplay,
        audio: [{
            name: title,
            artist: artist,
            url: audio,
            cover: cover,
        }],
        lrcType: 0 // ❗禁用 APlayer 内置 LRC
    });

    const audioEl = ap.audio;

    // -------------------------------------------------------
    // ⑥ 自定义歌词系统（高亮/多行/点击跳转）
    // -------------------------------------------------------
    class CustomLyrics {
    constructor(container, lrcText, audio) {
        this.container = container;
        this.audio = audio;
        this.lines = this.parseLRC(lrcText);

        this.userBehavior = false;     // 用户正在手动滚动
        this.resumeTimer = null;       // 恢复自动滚动的计时器

        this.render();
        this.bind();
    }

    parseLRC(lrc) {
        const lines = [];
        const regex = /\[(\d{2}):(\d{2}\.\d{2})\](.*)/;

        lrc.split(/\r?\n/).forEach(line => {
            const m = regex.exec(line);
            if (!m) return;

            const time = parseInt(m[1]) * 60 + parseFloat(m[2]);
            const text = m[3].trim();

            lines.push({ time, text });
        });

        return lines.sort((a, b) => a.time - b.time);
    }

    render() {
        this.container.innerHTML = "";
        this.lines.forEach((line, i) => {
            const p = document.createElement("p");
            p.textContent = line.text;
            p.dataset.index = i;
            p.dataset.time = line.time;
            this.container.appendChild(p);
        });
    }

    bind() {
        // timeupdate → 高亮 + 自动滚动
        this.audio.addEventListener("timeupdate", () => this.highlight());

        // 点击跳转
        this.container.addEventListener("click", e => {
            const t = e.target.dataset.time;
            if (t) {
                this.audio.currentTime = parseFloat(t);
            }
        });

        // 用户主动滚动的各种事件
        const userEvents = [ "wheel", "scroll", "touchstart", "touchmove", "mousedown" ];
        userEvents.forEach(evt => {
            this.container.addEventListener(evt, () => this.onUserScroll(), { passive: true });
        });
    }

    onUserScroll() {
        // 标记用户正在操作
        this.userBehavior = true;

        // 重置恢复计时器
        clearTimeout(this.resumeTimer);

        // 用户停止操作 1 秒后恢复自动滚动
        this.resumeTimer = setTimeout(() => {
            this.userBehavior = false;
        }, 1000);
    }

    highlight() {
        const cur = this.audio.currentTime;

        let activeIdx = 0;
        for (let i = 0; i < this.lines.length; i++) {
            if (cur >= this.lines[i].time) activeIdx = i;
            else break;
        }

        // 高亮
        const nodes = Array.from(this.container.children);
        nodes.forEach(n => n.classList.remove("active"));
        nodes.forEach(p => p.style.color = "#333");
        nodes.forEach(p => p.style.fontWeight = "normal");
        nodes.forEach(p => p.style.fontSize = "18px");

        const activeP = nodes[activeIdx];
        if (!activeP) return;

        activeP.classList.add("active");
        activeP.style.color = "#42b983";
        activeP.style.fontWeight = "bold";
        activeP.style.fontSize = "24px";

        // ⭐ 若用户正在滚动/拖拽 → 不自动滚动
        if (this.userBehavior) return;

        // ⭐ 自动滚动
        activeP.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}


    // -------------------------------------------------------
    // ⑦ 启用歌词组件
    // -------------------------------------------------------
    new CustomLyrics(lyricsDiv, lrcText, audioEl);

    // 返回播放器实例
    return { ap, audio: audioEl, wrapper };
}
