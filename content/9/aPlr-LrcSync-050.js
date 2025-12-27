import initPlayer from "./aPlr-LrcSync-Mdl-050.js";

export async function initModule() {
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