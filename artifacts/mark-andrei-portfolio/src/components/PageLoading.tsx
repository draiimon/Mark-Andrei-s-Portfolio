import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import SolarAura from "@/components/SolarAura";

type PageLoadingStatus = "loading" | "ready" | "error";

type PageLoadingState = {
  route: string;
  status: PageLoadingStatus;
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
}: {
  state: PageLoadingState;
  onRetry: () => void;
}) {
  const active = state.status !== "ready";
  const isError = state.status === "error";

  return (
    <div
      className="global-page-loader"
      data-active={active ? "true" : "false"}
      data-status={state.status}
      aria-hidden={!active}
    >
      <div className="global-page-loader-panel" role={active ? "status" : undefined} aria-live="polite">
        <div className="global-page-loader-mark" aria-hidden="true">
          <span className="global-page-loader-progress-ring" />
          <span className="edit-login-mark global-page-loader-eclipse-shell">
            <span className="edit-login-aura-bounce">
              <SolarAura small className="edit-login-aura" state={isError ? "thinking" : "idle"} showOrbits={false} />
            </span>
          </span>
        </div>
        {isError && (
          <div className="global-page-loader-error" role="alert">
            <p>{state.error}</p>
            <button
              type="button"
              className="global-page-loader-retry"
              onClick={onRetry}
              tabIndex={active ? 0 : -1}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PageLoadingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PageLoadingState>({
    route: "",
    status: "loading",
    message: "Loading the essential experience…",
    error: "",
    retry: null,
  });

  const beginRoute = useCallback((route: string) => {
    setState((current) => {
      if (current.route === route) return current;
      return {
        route,
        status: "loading",
        message: "Loading the essential experience…",
        error: "",
        retry: null,
      };
    });
  }, []);

  const markPageReady = useCallback((route: string) => {
    setState((current) => {
      if (current.route !== route) return current;
      return { ...current, status: "ready", message: "", error: "", retry: null };
    });
  }, []);

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
      message: "Retrying the page…",
      error: "",
      retry: null,
    }));
    retry();
  };

  const browserPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isEditorRoute = /^\/(?:edit|admin)(?:\/|$)/.test(state.route || browserPath);
  const showGlobalLoader = !isEditorRoute;

  return (
    <PageLoadingContext.Provider value={contextValue}>
      <div
        className="app-route-content"
        data-route-loading={showGlobalLoader && state.status !== "ready" ? "true" : "false"}
      >
        {children}
      </div>
      {showGlobalLoader && <GlobalPageLoader state={state} onRetry={retryCurrentPage} />}
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