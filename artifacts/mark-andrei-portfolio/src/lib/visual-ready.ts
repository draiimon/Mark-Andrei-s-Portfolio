// These are failure bounds, never minimum loader durations.
function bounded<T>(promise: Promise<T>, ms: number): Promise<T | undefined> {
  return new Promise(resolve => {
    const timer = window.setTimeout(() => resolve(undefined), ms);
    promise.then(value => { clearTimeout(timer); resolve(value); }, () => { clearTimeout(timer); resolve(undefined); });
  });
}
export async function prepareVisualFrame(root: HTMLElement, signal?: AbortSignal) {
  const images = Array.from(root.querySelectorAll<HTMLImageElement>("img")).filter(image => {
    const box = image.getBoundingClientRect(); return box.top < innerHeight && box.bottom > 0 && box.width > 0;
  });
  await Promise.all([
    bounded(document.fonts?.ready || Promise.resolve(), 3500),
    ...images.map(image => bounded(image.decode ? image.decode() : Promise.resolve(), 3500)),
  ]);
  if (signal?.aborted) return false;
  await new Promise<void>(resolve => {
    let previous = "", stable = 0, frame = 0;
    const timer = window.setTimeout(() => finish(), 1800);
    const finish = () => { clearTimeout(timer); cancelAnimationFrame(frame); signal?.removeEventListener("abort", finish); resolve(); };
    signal?.addEventListener("abort", finish, { once: true });
    const check = () => {
      if (signal?.aborted || document.hidden) return finish();
      const signature = `${root.scrollWidth}:${root.scrollHeight}:${innerWidth}:${innerHeight}`;
      stable = signature === previous ? stable + 1 : 0; previous = signature;
      if (stable >= 2) return finish();
      frame = requestAnimationFrame(check);
    };
    frame = requestAnimationFrame(check);
  });
  return !signal?.aborted;
}
export function releaseBootGate() {
  document.documentElement.dataset.visualReady = "true";
  document.getElementById("boot-gate")?.remove();
  window.dispatchEvent(new Event("portfolio:visual-ready"));
  performance.mark("portfolio-visual-ready");
}
