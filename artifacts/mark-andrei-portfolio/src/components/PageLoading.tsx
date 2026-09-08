import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import SolarAura from "@/components/SolarAura";
import { prepareVisualFrame, releaseBootGate } from "@/lib/visual-ready";

type LoadingState = { route: string; status: "loading" | "ready" | "error"; error: string; retry: (() => void) | null };
type LoadingContext = {
  currentRoute: string;
  beginRoute: (route: string) => void;
  markPageReady: (route: string) => void;
  markPageError: (route: string, message: string, retry: () => void) => void;
};
const PageLoadingContext = createContext<LoadingContext | null>(null);
export function PageLoadingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadingState>({ route: window.location.pathname, status: "loading", error: "", retry: null });
  const currentRoute = useRef(state.route);
  const preparation = useRef<AbortController | null>(null);
  useEffect(() => () => preparation.current?.abort(), []);
  const beginRoute = useCallback((route: string) => {
    if (currentRoute.current === route) return;
    preparation.current?.abort(); currentRoute.current = route;
    setState({ route, status: "loading", error: "", retry: null });
  }, []);
  const markPageReady = useCallback((route: string) => {
    if (route !== currentRoute.current) return;
    preparation.current?.abort();
    const controller = new AbortController(); preparation.current = controller;
    const root = document.querySelector<HTMLElement>(".app-route-content");
    if (!root) return;
    void prepareVisualFrame(root, controller.signal).then(ready => {
      if (!ready || currentRoute.current !== route) return;
      setState({ route, status: "ready", error: "", retry: null });
      releaseBootGate();
    });
  }, []);
  const markPageError = useCallback((route: string, error: string, retry: () => void) => {
    if (route !== currentRoute.current) return;
    preparation.current?.abort();
    setState({ route, status: "error", error, retry }); releaseBootGate();
  }, []);
  const value = useMemo(() => ({ currentRoute: state.route, beginRoute, markPageReady, markPageError }), [state.route, beginRoute, markPageReady, markPageError]);
  const editor = /^\/(?:edit|admin)(?:\/|$)/.test(state.route);
  const active = state.status !== "ready";
  return <PageLoadingContext.Provider value={value}>
    <div className="app-route-content" data-route-loading={editor && active ? "true" : "false"} aria-busy={active}>{children}</div>
    {editor && <div className="global-page-loader edit-solar-reveal" data-active={active ? "true" : "false"} aria-hidden={!active}>
      {active && <>
        <div className="edit-solar-reveal-visual" aria-hidden="true"><span className="edit-solar-halo edit-solar-halo-one" /><span className="edit-solar-halo edit-solar-halo-two" /><SolarAura className="edit-solar-aura" showOrbits={false} /></div>
        <p className="edit-solar-reveal-label">MARK ANDREI / EDIT</p>
        <p className="edit-solar-reveal-status" role="status">{state.status === "error" ? state.error : "Preparing control center"}</p>
        {state.status === "error" && <button className="edit-solar-skip" onClick={() => state.retry?.()}>Try again</button>}
      </>}
    </div>}
  </PageLoadingContext.Provider>;
}
export function usePageLoading() {
  const context = useContext(PageLoadingContext);
  if (!context) throw new Error("usePageLoading must be used inside PageLoadingProvider");
  return context;
}
