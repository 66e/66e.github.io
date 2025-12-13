export default async function initPlayer(options) {
    // 加载 APlayer JS
    await import("https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js");
  
    // 加载 CSS
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css";
    document.head.appendChild(style);
    const { mount, audioIn } = options;

    // -------------------------
    // 创建 APlayer
    // -------------------------
    const apContainer = document.createElement("div");
    mount.appendChild(apContainer);

    const player = new APlayer({
        container: apContainer,
        audio: audioIn
    });

    // -------------------------
    // 创建歌词 UI（接管原生 LRC）
    // -------------------------
    const lyricBox = document.createElement("div");
    lyricBox.style.cssText = `
        max-height: 350px;
        overflow-y: auto;
        margin-top: 10px;
        padding: 10px;
        line-height: 1.8;
        font-size: 16px;
        user-select: none;
        border-radius: 8px;
    `;
    mount.appendChild(lyricBox);

    let parsedLyrics = [];
    let lyricLines = [];
    let userScrollLock = false;     // 用户主动滚动时禁止自动滚动
    let lockTimer = null;

    setupUserScrollDetector(lyricBox);

    // 初始化加载第一首歌词
    await loadAndApplyLyrics(player.list.index);

    // -------------------------
    // 切歌重新加载歌词
    // -------------------------
    player.on("loadstart", () => {
        const index = player.list.index;
        loadAndApplyLyrics(index);
    });

    // -------------------------
    // 播放进度 → 高亮同步
    // -------------------------
    player.on("timeupdate", () => {
        if (!parsedLyrics.length) return;
        syncHighlight(player.audio.currentTime);
    });

    // ================================================================
    // Functions
    // ================================================================

    /** 加载歌词 → 解析 → 渲染 */
    async function loadAndApplyLyrics(index) {
        const track = audioIn[index];

        // 1. 下载 LRC
        const lrcText = await fetchLrc(track.lrc);

        // 2. 转成结构化数据
        parsedLyrics = parseLrc(lrcText);

        // 3. 渲染歌词
        applyParsedLyrics(parsedLyrics);

        // 4. 重置滚动状态
        userScrollLock = false;
    }

    /** 下载 LRC 文本 */
    async function fetchLrc(url) {
        const res = await fetch(url);
        return await res.text();
    }

    /** 解析 LRC → [{time, text}] */
    function parseLrc(lrc) {
        const lines = lrc.split(/\r?\n/);
        const result = [];

        const timeReg = /\[(\d{1,2}):(\d{1,2}(?:\.\d{1,3})?)\]/;

        for (let line of lines) {
            const m = timeReg.exec(line);
            if (!m) continue;

            const min = parseInt(m[1], 10);
            const sec = parseFloat(m[2]);
            const time = min * 60 + sec;

            const text = line.replace(timeReg, "").trim();
            result.push({ time, text });
        }

        return result;
    }

    /** 渲染歌词 DOM */
    function applyParsedLyrics(list) {
        lyricBox.innerHTML = "";
        lyricLines = [];

        list.forEach(item => {
            const p = document.createElement("p");
            p.textContent = item.text;
            p.style.padding = "2px 0";
            p.style.transition = "color 0.2s";

            // ★ 让歌词点击跳转播放
            p.addEventListener("click", () => {
                player.seek(item.time);
            });

            lyricBox.appendChild(p);
            lyricLines.push(p);
        });
    }

    /** 高亮同步 + 自动滚动 */
    function syncHighlight(current) {
        if (!parsedLyrics.length) return;

        let i = 0;
        while (i < parsedLyrics.length - 1 && current >= parsedLyrics[i + 1].time) {
            i++;
        }

        lyricLines.forEach(line => line.style.color = "");
        const active = lyricLines[i];
        if (!active) return;

        active.style.color = "var(--aplayer-theme, #00a0e9)";

        // 如果用户正在滚动，则禁止自动滚动
        if (userScrollLock) return;

        lyricBox.scrollTo({
            top: active.offsetTop - lyricBox.clientHeight / 2,
            behavior: "smooth"
        });
    }

    /** 检测用户滚动，避免自动滚动干扰 */
    function setupUserScrollDetector(elem) {
        const onUserScroll = () => {
            userScrollLock = true;

            clearTimeout(lockTimer);
            lockTimer = setTimeout(() => {
                userScrollLock = false;
            }, 1500);
        };

        elem.addEventListener("wheel", onUserScroll);
        elem.addEventListener("touchmove", onUserScroll);
        elem.addEventListener("mousedown", onUserScroll);
        elem.addEventListener("scroll", onUserScroll);
    }
    // 返回销毁函数
    return () => {
        player.pause();         // 停止播放
        player.destroy();       // 销毁 aplayer
    };
}
