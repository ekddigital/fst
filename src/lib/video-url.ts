export type VideoPlatform =
  | "youtube"
  | "facebook"
  | "instagram"
  | "vimeo"
  | "tiktok"
  | "dailymotion"
  | "wistia"
  | "streamable";

export type VideoSourceKind = "local" | "remote-direct" | "embed";

export type ParsedVideoUrl =
  | { ok: true; kind: VideoSourceKind; platform: VideoPlatform | null; normalized: string; embedUrl?: string; directSrc?: string }
  | { ok: false; error: string };

const LOCAL_PATH = /^\/[a-zA-Z0-9/_.-]+$/;
const DIRECT_VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i;

const PLATFORM_LABELS: Record<VideoPlatform, string> = {
  youtube: "YouTube",
  facebook: "Facebook",
  instagram: "Instagram",
  vimeo: "Vimeo",
  tiktok: "TikTok",
  dailymotion: "Dailymotion",
  wistia: "Wistia",
  streamable: "Streamable",
};

function tryUrl(input: string): URL | null {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function extractYouTubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id || null;
  }
  if (!host.endsWith("youtube.com") && host !== "youtube-nocookie.com") return null;

  if (url.pathname.startsWith("/embed/")) {
    return url.pathname.split("/")[2] ?? null;
  }
  if (url.pathname.startsWith("/shorts/")) {
    return url.pathname.split("/")[2] ?? null;
  }
  if (url.pathname.startsWith("/live/")) {
    return url.pathname.split("/")[2] ?? null;
  }
  const v = url.searchParams.get("v");
  return v || null;
}

function extractFacebookHref(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "fb.watch") {
    return url.href;
  }
  if (host === "facebook.com" || host.endsWith(".facebook.com")) {
    if (url.pathname.includes("/videos/") || url.pathname.includes("/reel/") || url.searchParams.has("v")) {
      return url.href.split("?")[0] + (url.search ? url.search : "");
    }
    return url.href;
  }
  return null;
}

function extractInstagramShortcode(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "instagram.com") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const type = parts[0];
  if (type === "p" || type === "reel" || type === "reels" || type === "tv") {
    return parts[1] ?? null;
  }
  return null;
}

function extractVimeoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "player.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "video" && parts[1]) return parts[1];
  }
  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? id : null;
  }
  return null;
}

function extractTikTokId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    const match = url.pathname.match(/\/video\/(\d+)/);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractDailymotionId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host.includes("dailymotion.com")) {
    const embedMatch = url.pathname.match(/\/embed\/video\/([^/?]+)/);
    if (embedMatch?.[1]) return embedMatch[1];
    const videoMatch = url.pathname.match(/\/video\/([^/?_]+)/);
    if (videoMatch?.[1]) return videoMatch[1];
  }
  return null;
}

function extractWistiaId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (!host.includes("wistia.com")) return null;
  const mediasMatch = url.pathname.match(/\/medias\/([^/?]+)/);
  if (mediasMatch?.[1]) return mediasMatch[1];
  const embedMatch = url.pathname.match(/\/embed\/iframe\/([^/?]+)/);
  if (embedMatch?.[1]) return embedMatch[1];
  return null;
}

function extractStreamableId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "streamable.com") return null;
  const id = url.pathname.split("/").filter(Boolean)[0];
  return id || null;
}

function buildYouTubeEmbed(id: string): string {
  return `https://www.youtube.com/embed/${id}`;
}

function buildFacebookEmbed(href: string): string {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false&width=960`;
}

function buildInstagramEmbed(shortcode: string, pathType: string): string {
  const segment = pathType === "reel" || pathType === "reels" ? "reel" : "p";
  return `https://www.instagram.com/${segment}/${shortcode}/embed`;
}

function buildVimeoEmbed(id: string): string {
  return `https://player.vimeo.com/video/${id}`;
}

function buildTikTokEmbed(id: string): string {
  return `https://www.tiktok.com/embed/v2/${id}`;
}

function buildDailymotionEmbed(id: string): string {
  return `https://www.dailymotion.com/embed/video/${id}`;
}

function buildWistiaEmbed(id: string): string {
  return `https://fast.wistia.net/embed/iframe/${id}`;
}

function buildStreamableEmbed(id: string): string {
  return `https://streamable.com/e/${id}`;
}

export function parseVideoUrl(input: string): ParsedVideoUrl {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Video URL or path is required." };
  }

  if (trimmed.startsWith("/")) {
    if (!LOCAL_PATH.test(trimmed)) {
      return { ok: false, error: "Local path must start with / and contain only letters, numbers, slashes, dots, dashes, or underscores." };
    }
    if (trimmed.includes("..")) {
      return { ok: false, error: "Local path cannot contain .." };
    }
    return { ok: true, kind: "local", platform: null, normalized: trimmed, directSrc: trimmed };
  }

  const url = tryUrl(trimmed);
  if (!url || !/^https?:$/i.test(url.protocol)) {
    return { ok: false, error: "Enter a valid URL (https://...) or local path (/videos/...)." };
  }

  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    const normalized = `https://www.youtube.com/watch?v=${youtubeId}`;
    return {
      ok: true,
      kind: "embed",
      platform: "youtube",
      normalized,
      embedUrl: buildYouTubeEmbed(youtubeId),
    };
  }

  const facebookHref = extractFacebookHref(url);
  if (facebookHref) {
    return {
      ok: true,
      kind: "embed",
      platform: "facebook",
      normalized: facebookHref,
      embedUrl: buildFacebookEmbed(facebookHref),
    };
  }

  const instagramShortcode = extractInstagramShortcode(url);
  if (instagramShortcode) {
    const pathType = url.pathname.split("/").filter(Boolean)[0] ?? "p";
    const normalized = `https://www.instagram.com/${pathType === "reels" ? "reel" : pathType}/${instagramShortcode}/`;
    return {
      ok: true,
      kind: "embed",
      platform: "instagram",
      normalized,
      embedUrl: buildInstagramEmbed(instagramShortcode, pathType),
    };
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return {
      ok: true,
      kind: "embed",
      platform: "vimeo",
      normalized: `https://vimeo.com/${vimeoId}`,
      embedUrl: buildVimeoEmbed(vimeoId),
    };
  }

  const tiktokId = extractTikTokId(url);
  if (tiktokId) {
    return {
      ok: true,
      kind: "embed",
      platform: "tiktok",
      normalized: `https://www.tiktok.com/video/${tiktokId}`,
      embedUrl: buildTikTokEmbed(tiktokId),
    };
  }

  const dailymotionId = extractDailymotionId(url);
  if (dailymotionId) {
    return {
      ok: true,
      kind: "embed",
      platform: "dailymotion",
      normalized: `https://www.dailymotion.com/video/${dailymotionId}`,
      embedUrl: buildDailymotionEmbed(dailymotionId),
    };
  }

  const wistiaId = extractWistiaId(url);
  if (wistiaId) {
    return {
      ok: true,
      kind: "embed",
      platform: "wistia",
      normalized: `https://fast.wistia.net/embed/iframe/${wistiaId}`,
      embedUrl: buildWistiaEmbed(wistiaId),
    };
  }

  const streamableId = extractStreamableId(url);
  if (streamableId) {
    return {
      ok: true,
      kind: "embed",
      platform: "streamable",
      normalized: `https://streamable.com/${streamableId}`,
      embedUrl: buildStreamableEmbed(streamableId),
    };
  }

  if (DIRECT_VIDEO_EXT.test(url.pathname) || DIRECT_VIDEO_EXT.test(trimmed)) {
    const normalized = url.href.split("#")[0] ?? url.href;
    return { ok: true, kind: "remote-direct", platform: null, normalized, directSrc: normalized };
  }

  return {
    ok: false,
    error:
      "Unsupported video URL. Use YouTube, Facebook, Instagram, Vimeo, TikTok, Dailymotion, Wistia, Streamable, a direct .mp4/.webm link, or a local path like /videos/lesson.mp4.",
  };
}

export function normalizeVideoUrl(input: string): string | null {
  const parsed = parseVideoUrl(input);
  return parsed.ok ? parsed.normalized : null;
}

export function getVideoEmbedInfo(input: string): ParsedVideoUrl & { ok: true } | null {
  const parsed = parseVideoUrl(input);
  return parsed.ok ? parsed : null;
}

export function getPlatformLabel(platform: VideoPlatform | null): string | null {
  if (!platform) return null;
  return PLATFORM_LABELS[platform];
}

export type VideoInputMode = "upload" | "external" | "local";

export function detectVideoInputMode(videoUrl: string): VideoInputMode {
  if (!videoUrl.trim()) return "upload";
  if (videoUrl.trim().startsWith("/")) return "local";
  const parsed = parseVideoUrl(videoUrl);
  if (parsed.ok && parsed.kind === "embed") return "external";
  if (parsed.ok && parsed.kind === "remote-direct") return "external";
  return "local";
}
