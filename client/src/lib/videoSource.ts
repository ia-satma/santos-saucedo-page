export function getVideoEmbedUrl(value: string, autoplay = false): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const youtube = url.hostname === "youtu.be" ? url.pathname.slice(1) : url.hostname.endsWith("youtube.com") ? url.searchParams.get("v") || url.pathname.match(/\/embed\/([^/]+)/)?.[1] : null;
    if (youtube && /^[A-Za-z0-9_-]{6,20}$/.test(youtube)) {
      const params = new URLSearchParams({ autoplay: autoplay ? "1" : "0", mute: "1", playsinline: "1", controls: "0", loop: "1", playlist: youtube, rel: "0" });
      return `https://www.youtube-nocookie.com/embed/${youtube}?${params}`;
    }
    const vimeo = url.hostname === "vimeo.com" ? url.pathname.match(/\/([0-9]+)$/)?.[1] : url.hostname === "player.vimeo.com" ? url.pathname.match(/\/video\/([0-9]+)/)?.[1] : null;
    if (vimeo) {
      const params = new URLSearchParams({ autoplay: autoplay ? "1" : "0", muted: "1", loop: "1", title: "0", byline: "0", portrait: "0" });
      return `https://player.vimeo.com/video/${vimeo}?${params}`;
    }
  } catch { return null; }
  return null;
}
