document.addEventListener('DOMContentLoaded', async () => {
    // 音乐和歌词的URL
    const audioUrl = 'https://oss.mojidict.com/article/audio/dd16f7f0-8367-4d49-830a-3a66d0489982.mp3';
    const lyricUrl = 'https://66e.github.io/9/%E3%83%A9%E3%82%A4%E3%82%A2.md';

    // --- 1. 动态生成 HTML 结构 ---
    const playerContainer = document.createElement('div');
    playerContainer.id = 'player-container';

    const lyricsDisplay = document.createElement('div');
    lyricsDisplay.id = 'lyrics-display';
    lyricsDisplay.textContent = '加载歌词中...'; // 初始提示

    const audio = document.createElement('audio');
    audio.controls = true; // 显示播放器控件
    audio.src = audioUrl;  // 设置音频源

    // 将元素添加到容器中
    playerContainer.appendChild(lyricsDisplay);
    playerContainer.appendChild(audio);

    // 将容器添加到 body 中
    document.body.appendChild(playerContainer);

    // --- 2. 动态加载 RabbitLyrics 库 ---
    // 创建 script 标签
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/rabbit-lyrics';
    script.type = 'text/javascript';

    // 使用 Promise 等待脚本加载完成
    const loadScriptPromise = new Promise((resolve, reject) => {
      script.onload = () => {
        // 检查 RabbitLyrics 是否已通过 UMD 挂载到全局
        if (window['rabbit-lyrics'] && window['rabbit-lyrics'].default) {
          resolve(window['rabbit-lyrics'].default);
        } else {
          reject(new Error("RabbitLyrics 库加载成功但未正确导出。"));
        }
      };
      script.onerror = () => reject(new Error("RabbitLyrics 脚本加载失败。"));
    });

    // 将 script 标签添加到 head 中开始加载
    document.head.appendChild(script);

    // --- 3. 初始化播放器和歌词 ---
    try {
      const RabbitLyricsConstructor = await loadScriptPromise; // 等待库加载完成并获取构造函数

      // 加载歌词文件
      const response = await fetch(lyricUrl);
      if (!response.ok) {
        throw new Error(`HTTP 错误！状态：${response.status}`);
      }
      const lrcContent = await response.text();

      // 实例化 RabbitLyrics
      const lyrics = new RabbitLyricsConstructor(
        lyricsDisplay, // 第一个参数：歌词容器 DOM 元素
        audio,         // 第二个参数：音频 DOM 元素
        {              // 第三个参数：options 对象
          lyrics: lrcContent,
          onUpdate: (data) => {
            // 当歌词更新时触发
            lyricsDisplay.innerHTML = ''; // 清空旧歌词

            // 遍历所有歌词行，并添加到 display 区域
            data.lines.forEach((line) => {
              const p = document.createElement('p');
              p.textContent = line.text;
              // 如果是当前正在播放的歌词，添加 active 类
              if (line === data.activeLine) {
                p.classList.add('active');
                // 滚动到当前歌词，确保其可见
                p.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              lyricsDisplay.appendChild(p);
            });

            // 如果没有 activeLine，可能是在歌曲开始或结束时
            if (!data.activeLine && data.lines.length > 0) {
              lyricsDisplay.scrollTo({ top: 0, behavior: 'smooth' });
            }
          },
          // 可以添加其他回调，如 onPlay, onPause 等
        }
      );

      // 可选：确保歌词在音频准备好后立即同步一次，以防在播放前显示初始歌词
      audio.addEventListener('canplaythrough', () => {
        if (lyrics.activeLine) {
            lyrics.update(); // 强制更新一次歌词显示
        }
        console.log('音频已准备好播放');
      });

      console.log("纯JS：RabbitLyrics 实例已成功创建并开始工作！");

    } catch (error) {
      console.error('纯JS：加载歌词或初始化 RabbitLyrics 失败:', error);
      lyricsDisplay.textContent = `歌词加载失败: ${error.message}`;
    }
  });