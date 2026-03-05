"use client";

import { Cloud } from "lucide-react";
import { useEffect, useState } from "react";

type PreProfileIntroProps = {
  brand: string;
  onDone?: () => void;
};

export default function PreProfileIntro({ brand, onDone }: PreProfileIntroProps) {
  const [phase, setPhase] = useState<"idle" | "loading" | "fade" | "hidden">("idle");
  const begin = () => {
    setPhase((p) => (p === "idle" ? "loading" : p));
  };

  useEffect(() => {
    const prevRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    return () => {
      window.history.scrollRestoration = prevRestoration;
    };
  }, []);

  useEffect(() => {
    if (phase === "hidden") {
      onDone?.();
    }
  }, [phase, onDone]);

  useEffect(() => {
    if (phase !== "loading") return;
    const fadeTimer = window.setTimeout(() => setPhase("fade"), 900);
    return () => window.clearTimeout(fadeTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fade") return;
    const hideTimer = window.setTimeout(() => setPhase("hidden"), 300);
    return () => window.clearTimeout(hideTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "idle") return;

    const onPointer = () => begin();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") begin();
    };

    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`pre-intro ${phase === "fade" ? "pre-intro-fade" : ""} ${phase === "idle" ? "pre-intro-clickable" : ""}`}
      onWheelCapture={(e) => {
        if (phase === "idle") e.preventDefault();
      }}
      onTouchMove={(e) => {
        if (phase === "idle") e.preventDefault();
      }}
      onPointerDown={begin}
    >
      <div className="pre-intro-core">
        <p className="pre-intro-kicker">{phase === "loading" || phase === "fade" ? "Loading profile" : "Enter profile"}</p>
        <p className={`pre-intro-brand ${phase === "idle" ? "pre-intro-brand-pulse" : ""}`}>
          <Cloud className="h-5 w-5 text-amber-500" />
          <span className="pre-intro-brand-wave whitespace-nowrap">
            {brand.split("").map((ch, idx) => (
              <span
                key={`${ch}-${idx}`}
                className="brand-letter"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </span>
        </p>
        <div className="pre-intro-status">
          <span className={`pre-intro-line ${phase !== "idle" ? "pre-intro-progress" : "pre-intro-line-idle"}`} />
        </div>
      </div>
    </div>
  );
}
