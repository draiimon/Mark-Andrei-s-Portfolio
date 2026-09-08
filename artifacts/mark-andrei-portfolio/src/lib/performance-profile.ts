export { getPerformanceProfile, type PerformanceProfile } from "./adaptive-performance";
import { getPerformanceProfile } from "./adaptive-performance";
export const shouldUseMobilePreloadGate = () => getPerformanceProfile().mobilePreloadGate;
