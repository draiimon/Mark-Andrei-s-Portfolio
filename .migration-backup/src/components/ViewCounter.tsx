"use client";

import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

type ViewCounterProps = {
  initialViews: number;
};

export default function ViewCounter({ initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    let alive = true;

    fetch("/api/public/views", {
      method: "POST",
      cache: "no-store",
      keepalive: true
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { viewCount?: number };
      })
      .then((data) => {
        if (!alive || !data || typeof data.viewCount !== "number") return;
        setViews(data.viewCount);
      })
      .catch(() => {
        // keep initial fallback when request fails
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
      <Eye className="h-3.5 w-3.5 text-amber-400" />
      {views.toLocaleString()} views
    </p>
  );
}
