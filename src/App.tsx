import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PasswordReset from "./pages/auth/PasswordReset";
import InviteAccept from "./pages/auth/InviteAccept";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientMain from "./pages/client/ClientMain";
import ClientOutfits from "./pages/client/ClientOutfits";
import ClientWardrobe from "./pages/client/ClientWardrobe";
import ClientSettingsPage from "./pages/client/ClientSettings";
import ClientOnboarding from "./pages/client/ClientOnboarding";
import ConsultantDashboard from "./pages/consultant/ConsultantDashboard";
import ConsultantMain from "./pages/consultant/ConsultantMain";
import ConsultantSettings from "./pages/consultant/ConsultantSettings";
import ClientDetail from "./pages/consultant/ClientDetail";
import OutfitCreator from "./pages/consultant/OutfitCreator";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent refetching on window focus that might cause remounting
      refetchOnWindowFocus: false,
      // Keep data in cache longer to prevent unnecessary refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

console.log("App.tsx: App component loading");

const App = () => {
  useEffect(() => {
    console.log("App.tsx: App component mounted");
    
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log("App.tsx: Page is about to unload/reload");
    };
    
    const handleUnload = () => {
      console.log("App.tsx: Page is unloading");
    };
    
    const handleVisibilityChange = () => {
      console.log("App.tsx: Page visibility changed to:", document.visibilityState);
      // Don't trigger any actions on visibility change that might cause remounting
    };
    
    const handleFocus = () => {
      console.log("App.tsx: Window gained focus");
    };
    
    const handleBlur = () => {
      console.log("App.tsx: Window lost focus");
    };

    // Add specific handling for page navigation to prevent unwanted reloads
    const handlePopState = (event: PopStateEvent) => {
      console.log("App.tsx: Browser navigation detected:", event);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('popstate', handlePopState);

    return () => {
      console.log("App.tsx: App component unmounting");
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProfileProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register/:role" element={<Register />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                <Route path="/invite/:token" element={<InviteAccept />} />

                {/* Routes Client */}
                <Route path="/client/dashboard" element={
                  <ProtectedRoute requiredRole="client">
                    <ClientDashboard />
                  </ProtectedRoute>
                }>
                  <Route index element={<ClientMain />} />
                  <Route path="outfits" element={<ClientOutfits />} />
                  <Route path="wardrobe" element={<ClientWardrobe />} />
                  <Route path="settings" element={<ClientSettingsPage />} />
                </Route>

                <Route path="/client/onboarding" element={
                  <ProtectedRoute requiredRole="client">
                    <ClientOnboarding />
                  </ProtectedRoute>
                } />

                {/* Routes Conseiller en Image */}
                <Route path="/consultant/dashboard" element={
                  <ProtectedRoute requiredRole="consultant">
                    <ConsultantDashboard />
                  </ProtectedRoute>
                }>
                  <Route index element={<ConsultantMain />} />
                  <Route path="settings" element={<ConsultantSettings />} />
                </Route>

                <Route path="/consultant/client/:clientId" element={
                  <ProtectedRoute requiredRole="consultant">
                    <ClientDetail />
                  </ProtectedRoute>
                } />
                <Route path="/consultant/outfit-creator" element={
                  <ProtectedRoute requiredRole="consultant">
                    <OutfitCreator />
                  </ProtectedRoute>
                } />

                {/* Route 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </UserProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
