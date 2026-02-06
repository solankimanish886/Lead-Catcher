import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import WidgetsPage from "@/pages/Widgets";
import WidgetBuilder from "@/pages/WidgetBuilder";
import EmbedForm from "@/pages/EmbedForm";
import LeadsPage from "@/pages/Leads";
import LeadDetail from "@/pages/LeadDetail";
import TeamPage from "@/pages/Team";
import NotFound from "@/pages/not-found";

import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/embed/:id" component={EmbedForm} />

      {/* Protected Routes */}
      <Route path="/">
        <AuthenticatedLayout>
          <Dashboard />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/widgets">
        <AuthenticatedLayout>
          <WidgetsPage />
        </AuthenticatedLayout>
      </Route>

      {/* Widget Builder - Separate layout or full screen? Let's use full screen no sidebar for focus */}
      <Route path="/widgets/new">
        <AuthenticatedLayout>
            <WidgetBuilder />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/widgets/:id/edit">
        <AuthenticatedLayout>
            <WidgetBuilder />
        </AuthenticatedLayout>
      </Route>

      <Route path="/leads">
        <AuthenticatedLayout>
          <LeadsPage />
        </AuthenticatedLayout>
      </Route>

      <Route path="/leads/:id">
        <AuthenticatedLayout>
          <LeadDetail />
        </AuthenticatedLayout>
      </Route>

      <Route path="/team">
        <AuthenticatedLayout>
          <TeamPage />
        </AuthenticatedLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
