import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import ClientTabMeta from "@/components/ClientTabMeta";
import GlobalBackgroundMusic from "@/components/GlobalBackgroundMusic";
import MoonCursor from "@/components/MoonCursor";
import { PageLoadingProvider } from "@/components/PageLoading";
import { resolveMusicEmbed } from "@/lib/music";
import { getPerformanceProfile } from "@/lib/performance-profile";

export default function AppShell({ children }: { children: ReactNode }) {
  const music = resolveMusicEmbed("/uploads/music/1772698457967-vuu52gsd.mp3");
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);

  useEffect(() => {
    const root = document.documentElement;
    let idleTimer: number | null = null;
    let scrollTimer: number | null = null;
    const { coarsePointer, constrainedNetwork, lowPower } = getPerformanceProfile();
    let lastPointerMove = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (lowPower) root.dataset.mobileLite = "true";
    else delete root.dataset.mobileLite;
    root.dataset.performanceTier = lowPower ? "lite" : "full";
    if (constrainedNetwork) root.dataset.networkConstrained = "true";
    if (reducedMotion) root.dataset.reducedMotion = "true";

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
      if (event.pointerType === "touch" || coarsePointer.matches) return;
      const now = performance.now();
      if (now - lastPointerMove < 100) return;
      lastPointerMove = now;
      showControls();
    };

    const handleVisibility = () => {
      root.dataset.pageVisibility = document.hidden ? "hidden" : "visible";
    };

    root.dataset.floatingUiState = "visible";
    handleVisibility();
    scheduleIdle();

    window.addEventListener("scroll", handleScroll, { passive: true });
    if (!coarsePointer.matches) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
    }
    window.addEventListener("pointerdown", showControls, { passive: true });
    window.addEventListener("keydown", showControls);
    window.addEventListener("focusin", showControls);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimer(idleTimer);
      clearTimer(scrollTimer);
      delete root.dataset.floatingUiState;
      delete root.dataset.pageVisibility;
      delete root.dataset.performanceTier;
      delete root.dataset.networkConstrained;
      delete root.dataset.reducedMotion;
      delete root.dataset.mobileLite;
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", showControls);
      window.removeEventListener("keydown", showControls);
      window.removeEventListener("focusin", showControls);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isEditorRoute = /^\/(?:edit|admin)(?:\/|$)/.test(window.location.pathname);

    if (isEditorRoute) {
      root.dataset.editorRoute = "true";
    } else {
      delete root.dataset.editorRoute;
    }

    return () => {
      delete root.dataset.editorRoute;
    };
  }, []);

  return (
    <PageLoadingProvider>
      <ClientTabMeta />
      <GlobalBackgroundMusic music={music} />
      <MoonCursor />
      {children}
      {offline && (
        <div className="offline-status" role="status" aria-live="polite">
          Offline — showing the saved portfolio
        </div>
      )}
    </PageLoadingProvider>
  );
}