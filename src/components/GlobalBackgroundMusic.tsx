"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ResolvedMusic } from "@/lib/music";

type GlobalBackgroundMusicProps = {
  music: ResolvedMusic | null;
};

export default function GlobalBackgroundMusic({ music }: GlobalBackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const srcRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const freqDataRef = useRef<Uint8Array | null>(null);
  const analyserEnabledRef = useRef(false);
  const userGestureRef = useRef(false);
  const vibeRef = useRef(0);
  const beatRef = useRef(0);
  const prevBassRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const setVibe = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    document.documentElement.style.setProperty("--music-vibe", clamped.toFixed(3));
  };
  const setBeat = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
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
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.82;
      sourceNodeRef.current.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
      freqDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      analyserEnabledRef.current = true;
    } catch {
      analyserRef.current = null;
      freqDataRef.current = null;
      analyserEnabledRef.current = false;
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
    const loop = () => {
      const audio = audioRef.current;
      const analyser = analyserRef.current;
      const freqData = freqDataRef.current;
      const active = Boolean(audio && !audio.paused);

      let target = 0;
      if (active && analyserEnabledRef.current && analyser && freqData) {
        analyser.getByteFrequencyData(freqData);
        const bassBins = Math.max(1, Math.floor(freqData.length * 0.11));
        let sum = 0;
        for (let i = 0; i < bassBins; i += 1) sum += freqData[i];
        const bass = sum / bassBins / 255;
        const scaled = Math.min(1, bass * (0.65 + volume * 0.8));
        target = Math.max(0.03, scaled);

        const rise = bass - prevBassRef.current;
        const threshold = 0.13 + (0.24 * (1 - volume));
        const hasPeak = bass > threshold && rise > 0.016;
        beatRef.current = hasPeak ? 1 : beatRef.current * 0.92;
        prevBassRef.current = prevBassRef.current * 0.58 + bass * 0.42;
      }

      vibeRef.current = vibeRef.current * 0.82 + target * 0.18;
      setVibe(vibeRef.current);
      setBeat(beatRef.current);
      rafRef.current = window.requestAnimationFrame(loop);
    };
    rafRef.current = window.requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (!music || music.kind !== "audio") return;

    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.loop = true;
      audio.preload = "auto";
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;

    if (srcRef.current !== music.src) {
      audio.src = music.src;
      srcRef.current = music.src;
      audio.load();
    }

    let retries = 0;
    let timer: number | null = null;

    const tryPlay = async (fromGesture = false) => {
      try {
        if (fromGesture) {
          userGestureRef.current = true;
        }
        await audio.play();
        setIsPlaying(true);
        if (userGestureRef.current && audioCtxRef.current?.state === "suspended") {
          await audioCtxRef.current.resume();
        }
        initAudioAnalysis();
        startVibeLoop();
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      } catch {
        setIsPlaying(false);
        stopVibeLoop();
        setVibe(0);
        setBeat(0);
        retries += 1;
        if (retries > 45 && timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
    };

    void tryPlay();
    timer = window.setInterval(() => {
      void tryPlay();
    }, 900);

    const resume = () => {
      userGestureRef.current = true;
      if (audioCtxRef.current?.state === "suspended") {
        void audioCtxRef.current.resume().then(() => {
          initAudioAnalysis();
        });
      }
      void tryPlay(true);
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
      setVibe(0);
      setBeat(0);
    };

    window.addEventListener("pointerdown", resume, { passive: true, capture: true });
    window.addEventListener("touchstart", resume, { passive: true, capture: true });
    window.addEventListener("click", resume, { passive: true, capture: true });
    window.addEventListener("keydown", resume);
    window.addEventListener("focus", resume);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      if (timer) window.clearInterval(timer);
      window.removeEventListener("pointerdown", resume, true);
      window.removeEventListener("touchstart", resume, true);
      window.removeEventListener("click", resume, true);
      window.removeEventListener("keydown", resume);
      window.removeEventListener("focus", resume);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      stopVibeLoop();
      vibeRef.current = 0;
      beatRef.current = 0;
      prevBassRef.current = 0;
      setVibe(0);
      setBeat(0);
    };
  }, [music]);

  useEffect(() => {
    if (audioRef.current) {
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
    setVibe(0);
    setBeat(0);
  }, [music]);

  useEffect(() => {
    return () => {
      stopVibeLoop();
      vibeRef.current = 0;
      beatRef.current = 0;
      prevBassRef.current = 0;
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
    if (!audio) return;
    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      setIsPlaying(false);
    }
  };

  const onVolumeChange = (value: number) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
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
    <aside className={`music-edge-controller ${isPlaying ? "is-playing" : ""}`}>
      <button
        type="button"
        onClick={() => void togglePlay()}
        className={`music-speaker-pill ${isPlaying ? "is-playing" : ""}`}
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        <span className="speaker-pill-bars" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`speaker-pill-bar ${isPlaying ? "is-playing" : ""}`} style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </span>
      </button>

      <button
        type="button"
        onClick={() => void togglePlay()}
        className={`music-edge-button ${isPlaying ? "is-playing" : ""}`}
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? <Pause className="music-edge-icon h-3.5 w-3.5" /> : <Play className="music-edge-icon h-3.5 w-3.5" />}
      </button>

      <div className="music-edge-volume">
        <Volume2 className={`music-volume-icon h-3.5 w-3.5 text-awsOrange ${isPlaying ? "is-playing" : ""}`} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          aria-label="Music volume"
        />
      </div>
    </aside>
  );
}
