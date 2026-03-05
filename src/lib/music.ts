export type ResolvedMusic = {
  src: string;
  kind: "embed" | "audio";
};

export function resolveMusicEmbed(url: string | null | undefined): ResolvedMusic | null {
  if (!url) return null;
  const raw = url.trim();
  if (!raw) return null;

  if (raw.startsWith("/") && /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(raw)) {
    return { src: raw, kind: "audio" };
  }

  try {
    const parsed = new URL(raw);
    const lowerPath = parsed.pathname.toLowerCase();

    if (/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(lowerPath)) {
      return { src: parsed.toString(), kind: "audio" };
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (!id) return null;
      return { src: `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&playsinline=1&rel=0`, kind: "embed" };
    }

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "").trim();
      if (!id) return null;
      return { src: `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&playsinline=1&rel=0`, kind: "embed" };
    }

    if (parsed.hostname.includes("spotify.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedType = parts[0];
      const embedId = parts[1];
      if (!embedType || !embedId) return null;
      return { src: `https://open.spotify.com/embed/${embedType}/${embedId}?autoplay=1`, kind: "embed" };
    }
  } catch {
    return null;
  }

  return null;
}
