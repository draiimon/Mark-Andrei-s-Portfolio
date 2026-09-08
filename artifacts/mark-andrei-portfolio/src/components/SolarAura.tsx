export type SolarAuraState = "idle" | "thinking" | "typing";

export default function SolarAura({
  small = false,
  state = "idle",
  className = "",
  showOrbits = true,
}: {
  small?: boolean;
  state?: SolarAuraState;
  className?: string;
  showOrbits?: boolean;
}) {
  return (
    <span
      className={`chat-aura ${small ? "chat-aura-small" : ""} ${className}`.trim()}
      data-aura-state={state}
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