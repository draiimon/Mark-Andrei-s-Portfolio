export type ResolvedMusic = {
  src: string;
  kind: "embed" | "audio";
};

function normalizeInputUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/") || /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (/^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function buildStreamSrc(url: string): string {
  return `/api/stream?url=${encodeURIComponent(url)}`;
}

function extractYouTubeId(parsed: URL): string | null {
  const host = parsed.hostname.toLowerCase();
  if (host.includes("youtu.be")) {
    return parsed.pathname.split("/").filter(Boolean)[0] || null;
  }

  if (!host.includes("youtube.com") && !host.includes("youtube-nocookie.com")) return null;

  const v = parsed.searchParams.get("v");
  if (v) return v;

  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length >= 2 && ["embed", "shorts", "live", "v"].includes(parts[0].toLowerCase())) {
    return parts[1];
  }

  return null;
}

function buildSpotifyEmbed(parsed: URL): string | null {
  const host = parsed.hostname.toLowerCase();
  if (!host.includes("spotify.com")) return null;

  const parts = parsed.pathname.split("/").filter(Boolean);
  const normalized = parts[0]?.startsWith("intl-") ? parts.slice(1) : parts;
  const type = normalized[0];
  const id = normalized[1];
  if (!type || !id) return null;

  if (!["track", "album", "playlist", "artist", "episode", "show"].includes(type)) return null;
  return `https://open.spotify.com/embed/${type}/${id}?autoplay=1`;
}

export function resolveMusicEmbed(url: string | null | undefined): ResolvedMusic | null {
  if (!url) return null;
  const raw = normalizeInputUrl(url);
  if (!raw) return null;

  const spotifyUriMatch = raw.match(/^spotify:(track|album|playlist|artist|episode|show):([A-Za-z0-9]+)$/i);
  if (spotifyUriMatch) {
    const type = spotifyUriMatch[1].toLowerCase();
    const id = spotifyUriMatch[2];
    return { src: `https://open.spotify.com/embed/${type}/${id}?autoplay=1`, kind: "embed" };
  }

  if (raw.startsWith("/") && /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(raw)) {
    return { src: raw, kind: "audio" };
  }

  try {
    const parsed = new URL(raw);
    const lowerPath = parsed.pathname.toLowerCase();

    if (/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(lowerPath)) {
      return { src: parsed.toString(), kind: "audio" };
    }

    const youtubeId = extractYouTubeId(parsed);
    if (youtubeId) {
      return { src: buildStreamSrc(`https://www.youtube.com/watch?v=${youtubeId}`), kind: "audio" };
    }

    const spotifyEmbed = buildSpotifyEmbed(parsed);
    if (spotifyEmbed) {
      return { src: spotifyEmbed, kind: "embed" };
    }

    if (parsed.hostname.toLowerCase().includes("soundcloud.com")) {
      return {
        src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(parsed.toString())}&auto_play=true`,
        kind: "embed"
      };
    }

    // Best-effort fallback for any URL via server proxy (helps with CORS on direct audio links).
    return { src: buildStreamSrc(parsed.toString()), kind: "audio" };
  } catch {
    // If it's an invalid URL but might be a valid relative path without extension
    return { src: raw, kind: "audio" };
  }
}
