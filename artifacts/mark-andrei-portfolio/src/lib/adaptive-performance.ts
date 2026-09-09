export type PerformanceTier = "lightweight" | "balanced" | "full";
type Connection = EventTarget & { effectiveType?: string; saveData?: boolean; downlink?: number };
export type PerformanceProfile = {
  tier: PerformanceTier; coarsePointer: MediaQueryList; constrainedNetwork: boolean;
  lowPower: boolean; mobile: boolean; android: boolean; mobilePreloadGate: boolean;
  reducedMotion: boolean; blurSupported: boolean;
};
let profile: PerformanceProfile | undefined;
const changeEvent = "portfolio:performance-change";
export function detectTier(memory?: number, cores?: number): PerformanceTier {
  if ((memory !== undefined && memory <= 2) || (cores !== undefined && cores <= 2)) return "lightweight";
  if ((memory !== undefined && memory <= 4) || (cores !== undefined && cores <= 4)) return "balanced";
  return memory === undefined && cores === undefined ? "balanced" : "full";
}
export function getPerformanceProfile(): PerformanceProfile {
  if (profile) return profile;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: Connection };
  const coarsePointer = matchMedia("(pointer: coarse)");
  const c = nav.connection;
  const constrainedNetwork = Boolean(c?.saveData) || /^(slow-2g|2g)$/.test(c?.effectiveType || "") || (c?.downlink !== undefined && c.downlink < 1);
  const tier = detectTier(nav.deviceMemory, nav.hardwareConcurrency || undefined);
  return profile = {
    tier, coarsePointer, constrainedNetwork, lowPower: tier === "lightweight",
    mobile: coarsePointer.matches, android: /Android/i.test(nav.userAgent),
    mobilePreloadGate: tier !== "full" || constrainedNetwork,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    blurSupported: typeof CSS !== "undefined" && (CSS.supports("backdrop-filter", "blur(1px)") || CSS.supports("-webkit-backdrop-filter", "blur(1px)")),
  };
}
export function effectBudget() {
  const { tier, reducedMotion } = getPerformanceProfile();
  return {
    frameMs: reducedMotion ? 100 : tier === "lightweight" ? 50 : tier === "balanced" ? 33 : 16,
    canvasDpr: tier === "lightweight" ? 1 : tier === "balanced" ? 1.5 : Math.min(devicePixelRatio || 1, 2),
    particles: tier === "lightweight" ? 180 : tier === "balanced" ? 650 : 2200,
  };
}
function publish() {
  const p = getPerformanceProfile(), root = document.documentElement;
  root.dataset.performanceTier = p.tier;
  root.dataset.networkConstrained = String(p.constrainedNetwork);
  root.dataset.reducedMotion = String(p.reducedMotion);
  root.dataset.blurSupported = String(p.blurSupported);
  delete root.dataset.mobileLite;
  window.dispatchEvent(new Event(changeEvent));
}
export function subscribePerformance(listener: () => void) {
  window.addEventListener(changeEvent, listener);
  return () => window.removeEventListener(changeEvent, listener);
}
export function initializePerformance() { getPerformanceProfile(); publish(); }
export function observePerformance() {
  let frame = 0, timer = 0, disposed = false, sampling = false, badWindows = 0, goodWindows = 0;
  let cooldownUntil = 0, promoted = false, longTaskTime = 0;
  const nav = navigator as Navigator & { connection?: Connection; deviceMemory?: number };
  const motion = matchMedia("(prefers-reduced-motion: reduce)"), input = matchMedia("(pointer: coarse)");
  let observer: PerformanceObserver | undefined;
  try {
    observer = new PerformanceObserver(list => { for (const e of list.getEntries()) longTaskTime += e.duration; });
    observer.observe({ type: "longtask", buffered: false });
  } catch { /* Unsupported observation requires no polyfill. */ }
  const sample = () => {
    if (disposed || document.hidden || sampling) return;
    sampling = true;
    let last = 0, started = 0, count = 0, slow = 0;
    longTaskTime = 0;
    const tick = (time: number) => {
      if (disposed || document.hidden) { sampling = false; return; }
      started ||= time;
      if (last) { count++; if (time - last > 35) slow++; }
      last = time;
      if (time - started < 1800) { frame = requestAnimationFrame(tick); return; }
      frame = 0; sampling = false;
      const p = getPerformanceProfile();
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      const pressure = memory ? memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8 : false;
      const bad = slow / Math.max(1, count) > 0.22 || longTaskTime > 450 || pressure;
      badWindows = bad ? badWindows + 1 : 0; goodWindows = bad ? 0 : goodWindows + 1;
      if (time > cooldownUntil && badWindows >= 2 && p.tier !== "lightweight") {
        p.tier = p.tier === "full" ? "balanced" : "lightweight"; p.lowPower = p.tier === "lightweight";
        cooldownUntil = time + 45000; promoted = true; badWindows = 0; publish();
      } else if (!promoted && goodWindows >= 2 && p.tier === "balanced" && nav.deviceMemory === undefined && (nav.hardwareConcurrency || 8) > 4) {
        p.tier = "full"; promoted = true; publish();
      }
      timer = window.setTimeout(sample, 12000);
    };
    frame = requestAnimationFrame(tick);
  };
  const visibility = () => {
    cancelAnimationFrame(frame); clearTimeout(timer); sampling = false;
    document.documentElement.dataset.pageVisibility = document.hidden ? "hidden" : "visible";
    if (!document.hidden) timer = window.setTimeout(sample, 1000);
  };
  const updatePreferences = () => {
    const tier = getPerformanceProfile().tier; profile = undefined;
    getPerformanceProfile().tier = tier; getPerformanceProfile().lowPower = tier === "lightweight"; publish();
  };
  motion.addEventListener?.("change", updatePreferences); input.addEventListener?.("change", updatePreferences);
  nav.connection?.addEventListener("change", updatePreferences);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("portfolio:visual-ready", sample, { once: true });
  return () => {
    disposed = true; cancelAnimationFrame(frame); clearTimeout(timer); observer?.disconnect();
    document.removeEventListener("visibilitychange", visibility); window.removeEventListener("portfolio:visual-ready", sample);
    motion.removeEventListener?.("change", updatePreferences); input.removeEventListener?.("change", updatePreferences);
    nav.connection?.removeEventListener("change", updatePreferences);
  };
}
