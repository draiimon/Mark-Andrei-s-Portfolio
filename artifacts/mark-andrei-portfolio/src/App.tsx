import { type ReactNode } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import AppShell from "@/components/AppShell";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/app/home/page";
import EditPage from "@/app/edit/page";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";

function Router() {
  return (
    <RoutedErrorBoundary>
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
      <AppShell>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
      </AppShell>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
