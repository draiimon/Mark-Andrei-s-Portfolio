export type SolarAuraState = "idle" | "thinking" | "typing";

export default function SolarAura({
  small = false,
  state = "idle",
  className = "",
}: {
  small?: boolean;
  state?: SolarAuraState;
  className?: string;
}) {
  return (
    <span
      className={`chat-aura ${small ? "chat-aura-small" : ""} ${className}`.trim()}
      data-aura-state={state}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </span>
  );
}