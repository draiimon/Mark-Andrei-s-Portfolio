"use client";

import { useEffect } from "react";

type MusicAutoplayKickstarterProps = {
  targetId: string;
};

export default function MusicAutoplayKickstarter({ targetId }: MusicAutoplayKickstarterProps) {
  useEffect(() => {
    const audio = document.getElementById(targetId) as HTMLAudioElement | null;
    if (!audio) return;

    let retries = 0;
    let timer: number | null = null;

    const tryPlay = async () => {
      try {
        await audio.play();
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      } catch {
        retries += 1;
        if (retries > 40 && timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
    };

    void tryPlay();
    timer = window.setInterval(() => {
      void tryPlay();
    }, 1200);

    const resume = () => {
      void tryPlay();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void tryPlay();
      }
    };

    window.addEventListener("focus", resume);
    window.addEventListener("pointerdown", resume, { passive: true });
    window.addEventListener("keydown", resume);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timer) window.clearInterval(timer);
      window.removeEventListener("focus", resume);
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [targetId]);

  return null;
}
