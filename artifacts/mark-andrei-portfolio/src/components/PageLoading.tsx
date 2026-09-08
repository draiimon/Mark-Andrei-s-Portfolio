import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import SolarAura from "@/components/SolarAura";

type PageLoadingStatus = "loading" | "ready" | "error";

type PageLoadingState = {
  route: string;
  status: PageLoadingStatus;
  routeReady: boolean;
  message: string;
  error: string;
  retry: (() => void) | null;
};

type PageLoadingContextValue = {
  currentRoute: string;
  beginRoute: (route: string) => void;
  markPageReady: (route: string) => void;
  markPageError: (route: string, message: string, retry: () => void) => void;
};

const PageLoadingContext = createContext<PageLoadingContextValue | null>(null);

function GlobalPageLoader({
  state,
  onRetry,
  onSkip,
}: {
  state: PageLoadingState;
  onRetry: () => void;
  onSkip: () => void;
}) {
  const active = state.status !== "ready";
  const isError = state.status === "error";
  const isEditorRoute = /^\/(?:edit|admin)(?:\/|$)/.test(state.route);
  const contextLabel = isEditorRoute ? "MARK ANDREI / EDIT" : "MARK ANDREI / PORTFOLIO";
  const contextStatus = isEditorRoute ? "Entering control center" : "Preparing portfolio";

  return (
    <div
      className="global-page-loader edit-solar-reveal"
      data-active={active ? "true" : "false"}
      data-status={state.status}
      aria-hidden={!active}
    >
      <div className="edit-solar-reveal-visual" aria-hidden="true">
        <span className="edit-solar-halo edit-solar-halo-one" />
        <span className="edit-solar-halo edit-solar-halo-two" />
        <SolarAura className="edit-solar-aura" state={isError ? "thinking" : "idle"} showOrbits={false} />
      </div>
      <p className="edit-solar-reveal-label">{isError ? "Unable to enter / edit" : contextLabel}</p>
      <p className="edit-solar-reveal-status" role={isError ? "alert" : undefined}>
        {isError ? state.error : contextStatus}
      </p>
      <button
        type="button"
        className="edit-solar-skip"
        onClick={isError ? onRetry : onSkip}
        tabIndex={active ? 0 : -1}
      >
        {isError ? "Try again" : "Skip intro"}
      </button>
    </div>
  );
}

export function PageLoadingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PageLoadingState>({
    route: typeof window !== "undefined" ? window.location.pathname : "",
    status: "loading",
    routeReady: false,
    message: "Loading the essential experience…",
    error: "",
    retry: null,
  });
  const [minimumLoaderReady, setMinimumLoaderReady] = useState(false);
  const [loaderSkipped, setLoaderSkipped] = useState(false);

  useEffect(() => {
    setMinimumLoaderReady(false);
    setLoaderSkipped(false);
    const timer = window.setTimeout(() => setMinimumLoaderReady(true), 5000);
    return () => window.clearTimeout(timer);
  }, [state.route]);

  useEffect(() => {
    const releaseIntro = () => {
      setLoaderSkipped(true);
      setMinimumLoaderReady(true);
    };
    window.addEventListener("portfolio:enter-profile", releaseIntro);
    return () => window.removeEventListener("portfolio:enter-profile", releaseIntro);
  }, []);

  useEffect(() => {
    if (!minimumLoaderReady && !loaderSkipped) return;
    setState((current) => {
      if (!current.routeReady || current.status === "ready") return current;
      return { ...current, status: "ready", message: "", error: "", retry: null };
    });
  }, [loaderSkipped, minimumLoaderReady]);

  const beginRoute = useCallback((route: string) => {
    setState((current) => {
      if (current.route === route) return current;
      return {
        route,
        status: "loading",
        routeReady: false,
        message: "Loading the essential experience…",
        error: "",
        retry: null,
      };
    });
  }, []);

  const markPageReady = useCallback((route: string) => {
    setState((current) => {
      if (current.route !== route) return current;
      if (
        !minimumLoaderReady && !loaderSkipped
      ) {
        return { ...current, routeReady: true, status: "loading" };
      }
      return { ...current, routeReady: true, status: "ready", message: "", error: "", retry: null };
    });
  }, [loaderSkipped, minimumLoaderReady]);

  const markPageError = useCallback((route: string, message: string, retry: () => void) => {
    setState((current) => {
      if (current.route !== route) return current;
      return {
        ...current,
        status: "error",
        error: message,
        retry,
      };
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      currentRoute: state.route,
      beginRoute,
      markPageReady,
      markPageError,
    }),
    [beginRoute, markPageError, markPageReady, state.route],
  );

  const retryCurrentPage = () => {
    const retry = state.retry;
    if (!retry) return;
    setState((current) => ({
      ...current,
      status: "loading",
      routeReady: false,
      message: "Retrying the page…",
      error: "",
      retry: null,
    }));
    retry();
  };

  const skipIntro = () => {
    window.dispatchEvent(new Event("portfolio:enter-profile"));
  };

  const isEditorRoute = /^\/(?:edit|admin)(?:\/|$)/.test(state.route);

  return (
    <PageLoadingContext.Provider value={contextValue}>
      <div
        className="app-route-content"
        data-route-loading={state.status !== "ready" ? "true" : "false"}
      >
        {children}
      </div>
      {isEditorRoute && <GlobalPageLoader state={state} onRetry={retryCurrentPage} onSkip={skipIntro} />}
    </PageLoadingContext.Provider>
  );
}

export function usePageLoading() {
  const context = useContext(PageLoadingContext);
  if (!context) {
    throw new Error("usePageLoading must be used inside PageLoadingProvider");
  }
  return context;
}