import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import ParentDashboard from "@/pages/parent-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import FranchiseAdminDashboard from "@/pages/franchise-admin";
import SearchResults from "@/pages/search-results";
import ClassroomDetail from "@/pages/classroom-detail";
import type { User } from "@shared/models/auth";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-washi flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-3xl tracking-[0.15em] text-foreground mb-6">
          質數數學
        </h1>
        <div className="flex gap-2 justify-center">
          <div
            className="w-2.5 h-2.5 rounded-full bg-tiffany animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-tiffany animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-tiffany animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    const typedUser = user as User;
    if (typedUser.role === "admin") {
      return <AdminDashboard />;
    }
    if (typedUser.role === "franchise_admin") {
      return <FranchiseAdminDashboard />;
    }
    return <ParentDashboard />;
  }

  return <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/search" component={SearchResults} />
      <Route path="/classroom/:id" component={ClassroomDetail} />
      <Route path="/dashboard" component={ParentDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/franchise-admin" component={FranchiseAdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
