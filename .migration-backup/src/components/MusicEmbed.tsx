"use client";

import { useState } from "react";

type MusicEmbedProps = {
  src: string;
};

function withBust(url: string) {
  const hasQuery = url.includes("?");
  return `${url}${hasQuery ? "&" : "?"}t=${Date.now()}`;
}

export default function MusicEmbed({ src }: MusicEmbedProps) {
  const [frameSrc, setFrameSrc] = useState(src);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setFrameSrc(withBust(src))}
        className="rounded-md border border-amber-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-400 hover:bg-amber-400/10"
      >
        Start music
      </button>
      <div className="music-frame">
        <iframe
          src={frameSrc}
          title="Music Player"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
