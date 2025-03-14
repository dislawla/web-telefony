import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Contacts from "@/pages/contacts";
import Calls from "@/pages/calls";
import Messengers from "@/pages/messengers";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import TelephonySettings from "@/pages/settings/telephony";
import DatabaseSettings from "@/pages/settings/database";
import CRMSettings from "@/pages/settings/crm";
import Leads from "@/pages/leads";
import { ProtectedRoute } from "@/components/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/contacts" component={Contacts} />
      <ProtectedRoute path="/calls" component={Calls} />
      <ProtectedRoute path="/messengers" component={Messengers} />
      <ProtectedRoute path="/leads" component={Leads} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/settings/telephony" component={TelephonySettings} />
      <ProtectedRoute path="/settings/database" component={DatabaseSettings} />
      <ProtectedRoute path="/settings/crm" component={CRMSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;