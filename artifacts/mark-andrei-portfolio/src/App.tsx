import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import AppShell from "@/components/AppShell";
import { PageLoadingProvider, usePageLoading } from "@/components/PageLoading";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/app/home/page";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";

const EditPage = lazy(() => import("@/app/edit/page"));

function Router() {
  const [location] = useLocation();
  const { beginRoute, markPageReady } = usePageLoading();

  useEffect(() => {
    beginRoute(location);
    const readyTimer = window.setTimeout(() => markPageReady(location), 0);
    return () => window.clearTimeout(readyTimer);
  }, [beginRoute, location, markPageReady]);

  return (
    <RoutedErrorBoundary>
      <Suspense fallback={null}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/home" component={Home} />
          <Route path="/edit" component={EditPage} />
          <Route path="/admin" component={EditPage} />
          <Route path="/admin/dashboard" component={EditPage} />
          <Route>
            <Home />
          </Route>
        </Switch>
      </Suspense>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <ErrorBoundary>
      <PageLoadingProvider>
        <AppShell>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
        </AppShell>
        <Toaster />
      </PageLoadingProvider>
    </ErrorBoundary>
  );
}

export default App;
