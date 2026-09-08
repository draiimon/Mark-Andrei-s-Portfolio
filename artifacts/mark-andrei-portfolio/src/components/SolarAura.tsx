import { effectBudget, getPerformanceProfile } from "@/lib/adaptive-performance";
import { useEffect, useRef, type CSSProperties } from "react";

export type SolarAuraState = "idle" | "thinking" | "typing";

export default function SolarAura({
  small = false,
  state = "idle",
  className = "",
  showOrbits = true,
  momentum = 0,
  style,
}: {
  small?: boolean;
  state?: SolarAuraState;
  className?: string;
  showOrbits?: boolean;
  momentum?: number;
  style?: CSSProperties;
}) {
  const clampedMomentum = Math.max(0, Math.min(14, momentum));
  const auraRef = useRef<HTMLSpanElement>(null);
  const momentumRef = useRef(clampedMomentum);
  const solarStyle = {
    ...style,
    "--solar-angle": "0deg",
    "--solar-breathe-duration": "5s",
    "--solar-core-duration": "2.8s",
  } as CSSProperties;

  useEffect(() => {
    momentumRef.current = clampedMomentum;
  }, [clampedMomentum]);

  useEffect(() => {
    const aura = auraRef.current;
    if (!aura) return;

    let frame = 0;
    let lastTime = performance.now();
    let angle = 0;
    let velocity = 30;
    let visible = true;
    let lastPaint = 0;


    const animate = (time: number) => {
      if (!visible || document.hidden || getPerformanceProfile().reducedMotion) {
        frame = 0;
        return;
      }
      if (lastPaint && time - lastPaint < effectBudget().frameMs) {
        frame = requestAnimationFrame(animate);
        return;
      }
      lastPaint = time;
      const delta = Math.min(100, Math.max(0, time - lastTime));
      lastTime = time;

      // One rotating body with a soft velocity spring: clicks change the
      // target speed, while the current angle keeps moving continuously.
      const targetVelocity = 30 + momentumRef.current * 12;
      velocity += (targetVelocity - velocity) * (1 - Math.exp(-delta / 180));
      angle = (angle + (velocity * delta) / 1000) % 360;
      aura.style.setProperty("--solar-angle", `${angle}deg`);
      aura.style.setProperty("--solar-speed-energy", `${Math.min(1, velocity / 198)}`);
      frame = requestAnimationFrame(animate);
    };

    const updateRunning = () => {
      if (visible && !document.hidden && !frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(animate);
      } else if ((!visible || document.hidden) && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateRunning();
    }, { rootMargin: "96px" });

    observer?.observe(aura);
    document.addEventListener("visibilitychange", updateRunning);
    updateRunning();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", updateRunning);
    };
  }, []);

  return (
    <span
      ref={auraRef}
      className={`chat-aura ${small ? "chat-aura-small" : ""} ${className}`.trim()}
      data-aura-state={state}
      data-aura-momentum={clampedMomentum}
      style={solarStyle}
      aria-hidden="true"
    >
      {showOrbits && (
        <>
          <span />
          <span />
          <span />
        </>
      )}
    </span>
  );
}