"use client";

import { useEffect, useRef, useState } from "react";

type BackgroundAudioProps = {
  src: string;
};

export default function BackgroundAudio({ src }: BackgroundAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 1;

    let retries = 0;
    let timer: number | null = null;

    const tryPlay = async () => {
      try {
        await audio.play();
        setNeedsInteraction(false);
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      } catch {
        retries += 1;
        if (retries >= 3) {
          setNeedsInteraction(true);
        }
        if (retries > 30 && timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
    };

    void tryPlay();
    timer = window.setInterval(() => {
      void tryPlay();
    }, 1500);

    const onFocus = () => {
      void tryPlay();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void tryPlay();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timer) window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [src]);

  if (!needsInteraction) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        if (!audioRef.current) return;
        try {
          await audioRef.current.play();
          setNeedsInteraction(false);
        } catch {
          setNeedsInteraction(true);
        }
      }}
      className="fixed bottom-4 right-4 z-50 rounded-md border border-amber-400/70 bg-black/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-300 backdrop-blur"
    >
      Enable sound
    </button>
  );
}
