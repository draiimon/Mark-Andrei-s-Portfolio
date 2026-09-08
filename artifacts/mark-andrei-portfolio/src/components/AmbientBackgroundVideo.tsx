import { useEffect, useRef } from "react";

export default function AmbientBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.preload = "metadata";

    const resume = () => {
      if (document.hidden) return;
      void video.play().catch(() => {
        // Autoplay can still be blocked by an older browser. The posterless
        // background is decorative, so the content remains fully usable.
      });
    };
    const pauseWhileHidden = () => {
      if (document.hidden) video.pause();
      else resume();
    };

    document.addEventListener("visibilitychange", pauseWhileHidden);
    window.addEventListener("pageshow", resume);

    return () => {
      document.removeEventListener("visibilitychange", pauseWhileHidden);
      window.removeEventListener("pageshow", resume);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="site-video-background"
      src="/assets/solar-eclipse-background-pingpong.mp4"
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}