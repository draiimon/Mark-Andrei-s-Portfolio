import { useEffect, useRef, useState } from "react";

type PingPongVideoProps = {
  forwardSrc: string;
  reverseSrc: string;
  className?: string;
};

export default function PingPongVideo({ forwardSrc, reverseSrc, className }: PingPongVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  const src = direction === "forward" ? forwardSrc : reverseSrc;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      void video.play().catch(() => undefined);
    };

    video.load();
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      play();
      return;
    }

    video.addEventListener("canplay", play, { once: true });
    return () => video.removeEventListener("canplay", play);
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      onEnded={() => setDirection((current) => (current === "forward" ? "reverse" : "forward"))}
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}