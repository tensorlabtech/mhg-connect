export type VideoEmbed = {
  embedUrl: string;
  provider: "vimeo" | "youtube";
  thumbnailUrl: string | null;
};

const youtubeId = /^[A-Za-z0-9_-]{11}$/;

/** Nhận diện link YouTube/Vimeo để phát ngay trên trang; link khác trả về null. */
export function parseVideoEmbed(value: string): VideoEmbed | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const match = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/.exec(url.pathname);
      id = match?.[1] ?? null;
    }
  }
  if (id && youtubeId.test(id)) {
    const start = Number.parseInt(url.searchParams.get("t") ?? "", 10);
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}${
        Number.isFinite(start) && start > 0 ? `?start=${start}` : ""
      }`,
      provider: "youtube",
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const match = /\/(?:video\/)?(\d{6,12})(?:$|[/?#])/.exec(url.pathname);
    if (match)
      return {
        embedUrl: `https://player.vimeo.com/video/${match[1]}`,
        provider: "vimeo",
        thumbnailUrl: null,
      };
  }
  return null;
}
