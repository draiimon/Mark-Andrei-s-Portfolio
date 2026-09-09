import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ResolvedMusic } from "@/lib/music";
import { isLowPowerDevice, shouldUseMobileLiteStyles } from "@/lib/performance";

type GlobalBackgroundMusicProps = {
  music: ResolvedMusic | null;
};

const MUSIC_VISUAL_STRENGTH = 0.5;
const EDITOR_ROUTE_RE = /^\/(?:edit|admin)(?:\/|$)/;

export default function GlobalBackgroundMusic({ music }: GlobalBackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const srcRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const analyserEnabledRef = useRef(false);
  const userGestureRef = useRef(false);
  const vibeRef = useRef(0);
  const beatRef = useRef(0);
  const prevBassRef = useRef(0);
  const renderedVibeRef = useRef(0);
  const renderedBeatRef = useRef(0);
  const lastRenderTsRef = useRef(0);
  const isMobileRef = useRef(false);
  const lowPowerRef = useRef(false);
  const sampleTickRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.01);

  const setVibe = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    renderedVibeRef.current = clamped;
    document.documentElement.style.setProperty("--music-vibe", clamped.toFixed(3));
  };
  const setBeat = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    renderedBeatRef.current = clamped;
    document.documentElement.style.setProperty("--music-beat", clamped.toFixed(3));
  };

  const stopVibeLoop = () => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const initAudioAnalysis = () => {
    const audio = audioRef.current;
    if (!audio || analyserRef.current || !userGestureRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state !== "running") return;

      if (!sourceNodeRef.current) {
        sourceNodeRef.current = ctx.createMediaElementSource(audio);
      }

      const analyser = ctx.createAnalyser();
      const outputGain = ctx.createGain();
      analyser.fftSize = lowPowerRef.current ? 128 : 512;
      analyser.smoothingTimeConstant = lowPowerRef.current ? 0.9 : 0.82;
      outputGain.gain.value = audio.volume;
      sourceNodeRef.current.connect(analyser);
      analyser.connect(outputGain);
      outputGain.connect(ctx.destination);
      analyserRef.current = analyser;
      outputGainRef.current = outputGain;
      freqDataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      analyserEnabledRef.current = true;
      // Keep the analyzer fed with the full signal while outputGain controls
      // the audible level independently.
      audio.volume = 1;
    } catch {
      analyserRef.current = null;
      freqDataRef.current = null;
      analyserEnabledRef.current = false;
    }
  };

  const ensureAudioContext = async () => {
    if (!userGestureRef.current) return;

    const AudioCtx =
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }

    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }
  };

  const teardownAudioAnalysis = async () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {}
      analyserRef.current = null;
    }
    if (outputGainRef.current) {
      try {
        outputGainRef.current.disconnect();
      } catch {}
      outputGainRef.current = null;
    }
    analyserEnabledRef.current = false;
    freqDataRef.current = null;

    if (audioCtxRef.current) {
      try {
        await audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
  };

  const startVibeLoop = () => {
    if (rafRef.current) return;
    const loop = (ts: number) => {
      const frameInterval = lowPowerRef.current ? 66 : isMobileRef.current ? 40 : 16;
      if (lastRenderTsRef.current && ts - lastRenderTsRef.current < frameInterval) {
        rafRef.current = window.requestAnimationFrame(loop);
        return;
      }
      lastRenderTsRef.current = ts;
      if (document.hidden) {
        rafRef.current = null;
        return;
      }

      const audio = audioRef.current;
      const analyser = analyserRef.current;
      const freqData = freqDataRef.current;
      const active = Boolean(audio && !audio.paused);

      let target = 0;
      if (active && analyserEnabledRef.current && analyser && freqData) {
        sampleTickRef.current += 1;
        if (lowPowerRef.current && sampleTickRef.current % 3 !== 0) {
          rafRef.current = window.requestAnimationFrame(loop);
          return;
        }
        analyser.getByteFrequencyData(freqData);
        const bassBins = Math.max(1, Math.floor(freqData.length * (lowPowerRef.current ? 0.08 : 0.11)));
        let sum = 0;
        for (let i = 0; i < bassBins; i += 1) sum += freqData[i];
        const bass = sum / bassBins / 255;
        const scaled = Math.min(1, bass * (0.65 + volume * 0.8));
        target = Math.max(0.03, scaled);

        const rise = bass - prevBassRef.current;
        const threshold = lowPowerRef.current ? 0.2 + (0.2 * (1 - volume)) : 0.13 + (0.24 * (1 - volume));
        const hasPeak = bass > threshold && rise > (lowPowerRef.current ? 0.026 : 0.016);
        beatRef.current = hasPeak ? 1 : beatRef.current * (lowPowerRef.current ? 0.95 : 0.92);
        prevBassRef.current = prevBassRef.current * 0.58 + bass * 0.42;
      } else if (active && EDITOR_ROUTE_RE.test(window.location.pathname)) {
        // Autoplay can start the audio element before the browser permits a
        // Web Audio analyser. Keep the Edit ambience alive with a restrained
        // musical fallback until the first interaction unlocks real analysis.
        const phase = audio?.currentTime ?? ts / 1000;
        const pulse = (Math.sin(phase * Math.PI * 3.2 - 0.8) + 1) / 2;
        target = 0.06 + pulse * 0.28;
        beatRef.current = pulse > 0.86 ? 0.72 : beatRef.current * 0.9;
      }

      const vibeSmooth = isMobileRef.current ? 0.9 : 0.82;
      vibeRef.current = vibeRef.current * vibeSmooth + target * (1 - vibeSmooth);

        const nextVibe = vibeRef.current * MUSIC_VISUAL_STRENGTH;
        const nextBeat = beatRef.current * MUSIC_VISUAL_STRENGTH;
        if (Math.abs(nextVibe - renderedVibeRef.current) > 0.008) {
          setVibe(nextVibe);
      }
      if (Math.abs(nextBeat - renderedBeatRef.current) > 0.01) {
        setBeat(nextBeat);
      }
      rafRef.current = window.requestAnimationFrame(loop);
    };
    rafRef.current = window.requestAnimationFrame(loop);
  };

  useEffect(() => {
    const updateMobileFlag = () => {
      isMobileRef.current = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
       lowPowerRef.current = isLowPowerDevice();
       if (shouldUseMobileLiteStyles()) {
        document.documentElement.setAttribute("data-mobile-lite", "true");
      } else {
        document.documentElement.removeAttribute("data-mobile-lite");
      }
    };
    updateMobileFlag();
    window.addEventListener("resize", updateMobileFlag);
    return () => {
      window.removeEventListener("resize", updateMobileFlag);
      document.documentElement.removeAttribute("data-mobile-lite");
    };
  }, []);

  useEffect(() => {
    if (!music || music.kind !== "audio") return;

    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.loop = true;
      audio.preload = "none";
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;

    const ensureAudioSource = () => {
      if (srcRef.current === music.src) return;
      audio.preload = "auto";
      audio.src = music.src;
      srcRef.current = music.src;
      audio.load();
    };

    const tryPlay = async (fromGesture = false) => {
      try {
        if (fromGesture) {
          userGestureRef.current = true;
          await ensureAudioContext();
        }
        ensureAudioSource();
        await audio.play();
        setIsPlaying(true);
        if (isEditorRoute && !userGestureRef.current) {
          // The media element is already audible; this lets the analyzer
          // attempt to attach immediately while the fallback covers browsers
          // that keep AudioContext suspended during autoplay.
          userGestureRef.current = true;
        }
        if (userGestureRef.current && audioCtxRef.current?.state === "suspended") {
          await audioCtxRef.current.resume();
        }
        initAudioAnalysis();
        startVibeLoop();
      } catch {
        setIsPlaying(false);
        stopVibeLoop();
        setVibe(0);
        setBeat(0);
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      if (userGestureRef.current) {
        initAudioAnalysis();
      }
      startVibeLoop();
    };
    const onPause = () => {
      setIsPlaying(false);
      stopVibeLoop();
      vibeRef.current = 0;
      beatRef.current = 0;
      prevBassRef.current = 0;
      lastRenderTsRef.current = 0;
      setVibe(0);
      setBeat(0);
    };
    const isEditorRoute = EDITOR_ROUTE_RE.test(window.location.pathname);
    const handleEnterProfile = () => {
      void tryPlay(true);
    };
    const handleEditorInteraction = () => {
      void tryPlay(true);
    };
    const onVisibilityChange = () => {
      if (!document.hidden && !audio.paused) startVibeLoop();
    };

    if (isEditorRoute) {
      // Attempt autoplay for the editor. Browsers that block unprompted audio
      // will resume it on the first real interaction and unlock analysis.
      void tryPlay();
      window.addEventListener("pointerdown", handleEditorInteraction, { once: true, passive: true });
      window.addEventListener("keydown", handleEditorInteraction, { once: true });
    }
    window.addEventListener("portfolio:enter-profile", handleEnterProfile);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("portfolio:enter-profile", handleEnterProfile);
      if (isEditorRoute) {
        window.removeEventListener("pointerdown", handleEditorInteraction);
        window.removeEventListener("keydown", handleEditorInteraction);
      }
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopVibeLoop();
      vibeRef.current = 0;
      beatRef.current = 0;
      prevBassRef.current = 0;
      lastRenderTsRef.current = 0;
      setVibe(0);
      setBeat(0);
    };
  }, [music]);

  useEffect(() => {
    if (outputGainRef.current) {
      outputGainRef.current.gain.value = volume;
    } else if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!music || music.kind === "audio") return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopVibeLoop();
    vibeRef.current = 0;
    beatRef.current = 0;
    prevBassRef.current = 0;
    lastRenderTsRef.current = 0;
    setVibe(0);
    setBeat(0);
  }, [music]);

  useEffect(() => {
    return () => {
      stopVibeLoop();
      vibeRef.current = 0;
      beatRef.current = 0;
      prevBassRef.current = 0;
      lastRenderTsRef.current = 0;
      setVibe(0);
      setBeat(0);
      if (!audioRef.current) return;
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
      srcRef.current = null;
      void teardownAudioAnalysis();
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !music || music.kind !== "audio") return;
    try {
      if (audio.paused) {
        userGestureRef.current = true;
        await ensureAudioContext();
        if (srcRef.current !== music.src) {
          audio.preload = "auto";
          audio.src = music.src;
          srcRef.current = music.src;
          audio.load();
        }
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      setIsPlaying(false);
    }
  };

  if (!music) return null;

  if (music.kind === "embed") {
    return (
      <section aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0">
        <iframe
          src={music.src}
          title="Background music"
          loading="eager"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="h-full w-full"
        />
      </section>
    );
  }

  return (
    <aside className={`music-edge-controller music-edge-controller-solar ${isPlaying ? "is-playing" : ""}`}>
      <button
        type="button"
        onClick={() => void togglePlay()}
        className={`music-edge-button ${isPlaying ? "is-playing" : ""}`}
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? <Pause className="music-edge-icon h-3.5 w-3.5" /> : <Play className="music-edge-icon h-3.5 w-3.5" />}
      </button>
    </aside>
  );
}
