import { Cloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { prepareVisualFrame } from "@/lib/visual-ready";

type PreProfileIntroProps = {
  brand: string;
  onDone?: () => void;
};

export default function PreProfileIntro({ brand, onDone }: PreProfileIntroProps) {
  const [phase, setPhase] = useState<"idle" | "loading" | "fade" | "hidden">("idle");
  const hasEnteredRef = useRef(false);

  const begin = () => {
    if (hasEnteredRef.current) return;
    hasEnteredRef.current = true;
    window.dispatchEvent(new Event("portfolio:enter-profile"));
    setPhase("loading");
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
    const root = document.documentElement;
    if (phase === "hidden") {
      root.removeAttribute("data-pre-intro");
    } else {
      root.setAttribute("data-pre-intro", "active");
    }
    return () => {
      root.removeAttribute("data-pre-intro");
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "loading") return;
    const controller = new AbortController();
    void prepareVisualFrame(document.body, controller.signal).then(ready => { if (ready) setPhase("fade"); });
    return () => controller.abort();
  }, [phase]);

  useEffect(() => {
    if (phase !== "fade") return;
    const hideTimer = window.setTimeout(() => setPhase("hidden"), 420);
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

  // Keep the glass above the entire page, outside animated/filtered page layers.
  return createPortal(
    <div
      className={`pre-intro ${phase === "fade" ? "pre-intro-fade" : ""} ${phase === "idle" ? "pre-intro-clickable" : ""}`}
      data-phase={phase}
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
          <span className="pre-intro-brand-wave whitespace-normal">
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
    </div>,
    document.body,
  );
}