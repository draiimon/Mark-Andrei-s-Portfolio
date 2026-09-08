import { useEffect, useRef, useState } from "react";
import { getPerformanceProfile, subscribePerformance } from "@/lib/adaptive-performance";
export default function AmbientBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [motion, setMotion] = useState(false);
  useEffect(() => {
    let disposed = false;
    const update = () => {
      if (disposed) return;
      const p = getPerformanceProfile();
      setMotion(!p.constrainedNetwork && !p.reducedMotion && p.tier !== "lightweight" && !document.hidden && document.documentElement.dataset.visualReady === "true");
    };
    const unsubscribe = subscribePerformance(update);
    window.addEventListener("portfolio:visual-ready", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => { disposed = true; unsubscribe(); window.removeEventListener("portfolio:visual-ready", update); document.removeEventListener("visibilitychange", update); };
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (motion) void video.play().catch(() => {});
    else video.pause();
  }, [motion]);
  return <>
    <img className="site-video-background site-background-poster" src="/assets/eclipse-poster-640.webp"
      srcSet="/assets/eclipse-poster-640.webp 640w, /assets/eclipse-poster-1600.webp 1600w" sizes="100vw"
      width="1600" height="900" alt="" decoding="async" fetchPriority="high" aria-hidden="true" />
    {motion && <video ref={videoRef} className="site-video-background" src="/assets/solar-eclipse-background-pingpong.mp4"
      autoPlay loop muted playsInline preload="none" tabIndex={-1} aria-hidden="true" />}
  </>;
}
