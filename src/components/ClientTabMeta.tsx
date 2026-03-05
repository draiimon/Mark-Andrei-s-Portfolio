"use client";

import { useEffect } from "react";

type SiteMeta = {
  tabTitle: string | null;
  faviconUrl: string | null;
};

function upsertIcon(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export default function ClientTabMeta() {
  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;

    const clearTick = () => {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
    };

    const runTypingLoop = (rawTitle: string) => {
      const text = rawTitle.trim();
      if (!text) return;

      let index = 0;
      let deleting = false;

      const tick = () => {
        if (cancelled) return;

        if (!deleting) {
          index = Math.min(index + 1, text.length);
        } else {
          index = Math.max(index - 1, 0);
        }

        document.title = text.slice(0, index);

        let delay = deleting ? 75 : 115;
        if (!deleting && index === text.length) {
          deleting = true;
          delay = 700;
        } else if (deleting && index === 0) {
          deleting = false;
          delay = 320;
        }

        timer = window.setTimeout(tick, delay);
      };

      tick();
    };

    async function loadMeta() {
      try {
        const res = await fetch("/api/public/site-meta", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as SiteMeta;
        if (cancelled) return;

        clearTick();
        runTypingLoop(data.tabTitle?.trim() || document.title || "To the clouds.");

        if (data.faviconUrl && data.faviconUrl.trim()) {
          const href = data.faviconUrl.trim();
          upsertIcon("icon", href);
          upsertIcon("shortcut icon", href);
          upsertIcon("apple-touch-icon", href);
        }
      } catch {
        clearTick();
        runTypingLoop(document.title || "To the clouds.");
      }
    }

    void loadMeta();
    return () => {
      cancelled = true;
      clearTick();
    };
  }, []);

  return null;
}
