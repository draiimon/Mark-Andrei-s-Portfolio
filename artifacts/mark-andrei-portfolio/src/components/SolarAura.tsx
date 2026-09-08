import type { CSSProperties } from "react";

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
  const solarStyle = {
    ...style,
    "--solar-breathe-duration": `${Math.max(0.85, 5 - clampedMomentum * 0.3)}s`,
    "--solar-corona-duration": `${Math.max(0.5, 4.6 - clampedMomentum * 0.29)}s`,
    "--solar-core-duration": `${Math.max(0.46, 2.8 - clampedMomentum * 0.18)}s`,
    "--solar-orbit-duration": `${Math.max(0.7, 4.2 - clampedMomentum * 0.26)}s`,
    "--solar-orbit-duration-two": `${Math.max(0.82, 5.8 - clampedMomentum * 0.34)}s`,
    "--solar-orbit-duration-three": `${Math.max(1, 7.2 - clampedMomentum * 0.42)}s`,
  } as CSSProperties;

  return (
    <span
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