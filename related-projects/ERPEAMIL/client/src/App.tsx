import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ModernFinancialDashboard from "@/components/modern-financial-dashboard";
import NotFound from "@/pages/not-found";
import FinancialChatPage from "@/pages/financial-chat";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ModernFinancialDashboard} />
      <Route path="/financial-chat" component={FinancialChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <AnalyticsProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AnalyticsProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}

export default App;

export default App;
