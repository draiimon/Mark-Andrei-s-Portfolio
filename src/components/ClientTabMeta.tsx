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

    async function loadMeta() {
      try {
        const res = await fetch("/api/public/site-meta", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as SiteMeta;
        if (cancelled) return;

        if (data.tabTitle && data.tabTitle.trim()) {
          document.title = data.tabTitle.trim();
        }

        if (data.faviconUrl && data.faviconUrl.trim()) {
          const href = data.faviconUrl.trim();
          upsertIcon("icon", href);
          upsertIcon("shortcut icon", href);
          upsertIcon("apple-touch-icon", href);
        }
      } catch {
        // Best effort only; keep defaults on failure.
      }
    }

    void loadMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
