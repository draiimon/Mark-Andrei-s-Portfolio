import type { ReactNode } from "react";
import { useEffect } from "react";
import ClientTabMeta from "@/components/ClientTabMeta";
import GlobalBackgroundMusic from "@/components/GlobalBackgroundMusic";
import MoonCursor from "@/components/MoonCursor";
import { resolveMusicEmbed } from "@/lib/music";

export default function AppShell({ children }: { children: ReactNode }) {
  const music = resolveMusicEmbed("/uploads/music/1772698457967-vuu52gsd.mp3");

  useEffect(() => {
    const root = document.documentElement;
    let idleTimer: number | null = null;
    let scrollTimer: number | null = null;

    const clearTimer = (timer: number | null) => {
      if (timer !== null) window.clearTimeout(timer);
    };

    const scheduleIdle = () => {
      clearTimer(idleTimer);
      idleTimer = window.setTimeout(() => {
        root.dataset.floatingUiState = "idle";
      }, 30000);
    };

    const showControls = () => {
      root.dataset.floatingUiState = "visible";
      scheduleIdle();
    };

    const handleScroll = () => {
      root.dataset.floatingUiState = "scrolling";
      clearTimer(scrollTimer);
      clearTimer(idleTimer);
      scrollTimer = window.setTimeout(() => {
        showControls();
      }, 550);
    };

    const handlePointerMove = (event: PointerEvent) => {
      // A touch drag is page scrolling, not pointer activity. Let touchmove
      // keep the floating music control hidden instead of revealing it again.
      if (event.pointerType === "touch" || window.matchMedia("(pointer: coarse)").matches) return;
      showControls();
    };

    root.dataset.floatingUiState = "visible";
    scheduleIdle();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });
    window.addEventListener("pointerdown", showControls, { passive: true });
    window.addEventListener("touchstart", showControls, { passive: true });
    window.addEventListener("keydown", showControls);
    window.addEventListener("focusin", showControls);

    return () => {
      clearTimer(idleTimer);
      clearTimer(scrollTimer);
      delete root.dataset.floatingUiState;
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleScroll);
      window.removeEventListener("pointerdown", showControls);
      window.removeEventListener("touchstart", showControls);
      window.removeEventListener("keydown", showControls);
      window.removeEventListener("focusin", showControls);
    };
  }, []);

  return (
    <>
      <ClientTabMeta />
      <GlobalBackgroundMusic music={music} />
      <MoonCursor />
      {children}
    </>
  );
}