type NavigatorWithPerformanceHints = Navigator & {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

export function isLowPowerDevice() {
  if (typeof navigator === "undefined") return false;

  const device = navigator as NavigatorWithPerformanceHints;
  const memory = device.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency || 8;
  const connection = device.connection;

  return (
    memory <= 3 ||
    cores <= 4 ||
    connection?.saveData === true ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g"
  );
}

export function shouldUseMobileLiteStyles() {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent) && isLowPowerDevice();
}

export function runWhenIdle(callback: () => void, timeout = 2000) {
  if (typeof window === "undefined") return () => undefined;

  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof idleWindow.requestIdleCallback === "function" && typeof idleWindow.cancelIdleCallback === "function") {
    const id = idleWindow.requestIdleCallback(callback, { timeout });
    return () => idleWindow.cancelIdleCallback(id);
  }

  const id = window.setTimeout(callback, Math.min(timeout, 1500));
  return () => window.clearTimeout(id);
}