import { useEffect, useRef } from "react";

type CursorPoint = {
  x: number;
  y: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function MoonCursor() {
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current: CursorPoint = { ...target };
    let active = false;
    let frame = 0;

    document.documentElement.classList.add("has-moon-cursor");

    const onMove = (event: PointerEvent) => {
      if (!active) {
        current.x = event.clientX;
        current.y = event.clientY;
      }
      target.x = event.clientX;
      target.y = event.clientY;
      active = true;
      if (!frame) frame = window.requestAnimationFrame(animate);
    };

    const onLeave = () => {
      active = false;
      cursor.style.opacity = "0";
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const animate = () => {
      const deltaX = target.x - current.x;
      const deltaY = target.y - current.y;
      current.x += deltaX * 0.58;
      current.y += deltaY * 0.58;
      if (Math.abs(deltaX) < 0.2) current.x = target.x;
      if (Math.abs(deltaY) < 0.2) current.y = target.y;

      const speed = Math.min(1, Math.hypot(deltaX, deltaY) / 32);
      const tilt = clamp(deltaX * 0.38, -14, 14);
      const scale = 1 + speed * 0.11;

      cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%) rotate(${tilt}deg) scale(${scale})`;
      cursor.style.opacity = active ? `${0.72 + speed * 0.28}` : "0";
      cursor.style.setProperty("--cursor-speed", speed.toFixed(3));
      if (Math.abs(deltaX) >= 0.2 || Math.abs(deltaY) >= 0.2) {
        frame = window.requestAnimationFrame(animate);
      } else {
        frame = 0;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("has-moon-cursor");
    };
  }, []);

  return (
    <span ref={cursorRef} className="moon-cursor" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}