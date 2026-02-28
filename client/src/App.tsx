import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import LandingPage from "@/pages/Landing";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import WidgetsPage from "@/pages/Widgets";
import WidgetBuilder from "@/pages/WidgetBuilder";
import EmbedForm from "@/pages/EmbedForm";
import LeadsPage from "@/pages/Leads";
import LeadDetail from "@/pages/LeadDetail";
import TeamPage from "@/pages/Team";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/not-found";

import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { Loader2 } from "lucide-react";
import TechStackModal from "@/components/TechStackModal";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Mounted globally for all authenticated pages
  useRealtime();

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
    <div className="flex flex-col lg:flex-row h-screen bg-background overflow-hidden selection:bg-mongodb-green/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:pl-72 transition-all bg-mongodb-light-slate/30">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/embed/:id" component={EmbedForm} />

      {/* Protected Routes */}
      <Route path="/dashboard">
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
        <TechStackModal />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
