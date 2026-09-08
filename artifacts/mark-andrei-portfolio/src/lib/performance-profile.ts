type NetworkInformationLike = {
  effectiveType?: string;
  saveData?: boolean;
};

export type PerformanceProfile = {
  coarsePointer: MediaQueryList;
  constrainedNetwork: boolean;
  lowPower: boolean;
  mobile: boolean;
  android: boolean;
  mobilePreloadGate: boolean;
};

export function getPerformanceProfile(): PerformanceProfile {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      coarsePointer: { matches: false } as MediaQueryList,
      constrainedNetwork: false,
      lowPower: false,
      mobile: false,
      android: false,
      mobilePreloadGate: false,
    };
  }

  const coarsePointer = window.matchMedia("(pointer: coarse)");
  const userAgent = navigator.userAgent || "";
  const android = /Android/i.test(userAgent);
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent) || coarsePointer.matches;
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency || 8;
  const constrainedNetwork =
    Boolean(connection?.saveData) ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g";
  const lowPower =
    constrainedNetwork ||
    (coarsePointer.matches &&
      (android
        ? (memory ?? 4) <= 4 || cores <= 4
        : (memory ?? 8) <= 4 || cores <= 4));

  return {
    coarsePointer,
    constrainedNetwork,
    lowPower,
    mobile,
    android,
    mobilePreloadGate: mobile && (android || lowPower),
  };
}

export function shouldUseMobilePreloadGate() {
  return getPerformanceProfile().mobilePreloadGate;
}