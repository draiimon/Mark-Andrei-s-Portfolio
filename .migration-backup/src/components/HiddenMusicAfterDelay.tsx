"use client";

import { useEffect, useState } from "react";

type HiddenMusicAfterDelayProps = {
  src: string;
  kind: "embed" | "audio";
  delayMs?: number;
};

export default function HiddenMusicAfterDelay({ src, kind, delayMs = 2000 }: HiddenMusicAfterDelayProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!ready) return null;

  if (kind === "audio") {
    return (
      <audio
        src={src}
        autoPlay
        loop
        preload="auto"
        className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px opacity-0"
        aria-hidden="true"
      />
    );
  }

  return (
    <iframe
      src={src}
      title="Music Player"
      loading="eager"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px opacity-0"
      aria-hidden="true"
    />
  );
}
