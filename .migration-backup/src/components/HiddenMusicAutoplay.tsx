"use client";

type HiddenMusicAutoplayProps = {
  src: string;
  kind: "embed" | "audio";
};

export default function HiddenMusicAutoplay({ src, kind }: HiddenMusicAutoplayProps) {
  if (kind === "audio") {
    return (
      <audio
        src={src}
        autoPlay
        loop
        preload="auto"
        className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px opacity-0"
        aria-hidden="true"
      />
    );
  }

  return (
    <iframe
      src={src}
      title="Background music"
      loading="eager"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px opacity-0"
      aria-hidden="true"
    />
  );
}
