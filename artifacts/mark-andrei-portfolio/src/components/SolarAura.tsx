import { useEffect, useRef, type CSSProperties } from "react";
import { isLowPowerDevice } from "@/lib/performance";

export type SolarAuraState = "idle" | "thinking" | "typing";

export default function SolarAura({
  small = false,
  state = "idle",
  className = "",
  showOrbits = true,
  momentum = 0,
  reactiveToBursts = false,
  style,
}: {
  small?: boolean;
  state?: SolarAuraState;
  className?: string;
  showOrbits?: boolean;
  momentum?: number;
  reactiveToBursts?: boolean;
  style?: CSSProperties;
}) {
  const clampedMomentum = Math.max(0, Math.min(14, momentum));
  const auraRef = useRef<HTMLSpanElement>(null);
  const momentumRef = useRef(clampedMomentum);
  const burstEnergyRef = useRef(0);
  const solarStyle = {
    ...style,
    "--solar-breathe-duration": "5s",
    "--solar-core-duration": "2.8s",
  } as CSSProperties;

  useEffect(() => {
    momentumRef.current = clampedMomentum;
  }, [clampedMomentum]);

  useEffect(() => {
    if (!reactiveToBursts) return;

    const handleBurst = (event: Event) => {
      const detail = (event as CustomEvent<{ strength?: number }>).detail;
      const strength = Math.max(0, Math.min(1, detail?.strength ?? 0.5));
      burstEnergyRef.current = Math.max(burstEnergyRef.current, strength);
    };

    window.addEventListener("portfolio:eclipse-burst", handleBurst);
    return () => window.removeEventListener("portfolio:eclipse-burst", handleBurst);
  }, [reactiveToBursts]);

  useEffect(() => {
    const aura = auraRef.current;
    if (!aura) return;

    let frame = 0;
    let lastTime = performance.now();
    let lastPaintTime = 0;
    let angle = 0;
    let velocity = 30;
    const lowPower = isLowPowerDevice();

    const animate = (time: number) => {
      if (lowPower && lastPaintTime && time - lastPaintTime < 32) {
        frame = requestAnimationFrame(animate);
        return;
      }
      const delta = Math.min(40, Math.max(0, time - lastTime));
      lastTime = time;
      lastPaintTime = time;

      // One rotating body with a soft velocity spring: clicks change the
      // target speed, while the current angle keeps moving continuously.
      // Bass/click bursts add a short-lived velocity kick so stronger hits
      // visibly spin the corona harder before it settles back down.
      const burstEnergy = burstEnergyRef.current;
      const targetVelocity = 30 + momentumRef.current * 12 + burstEnergy * 58;
      velocity += (targetVelocity - velocity) * (1 - Math.exp(-delta / 180));
      angle = (angle + (velocity * delta) / 1000) % 360;
      aura.style.setProperty("--solar-angle", `${angle}deg`);
      aura.style.setProperty("--solar-speed-energy", `${Math.min(1, velocity / 198)}`);
      aura.style.setProperty("--solar-burst-energy", burstEnergy.toFixed(3));
      burstEnergyRef.current = Math.max(0, burstEnergy - delta / 420);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
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