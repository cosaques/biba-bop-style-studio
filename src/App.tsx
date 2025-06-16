
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
import { useEffect, useRef } from "react";

// Create a stable query client instance outside the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

console.log("App.tsx: Module loaded, creating query client");

const App = () => {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(Date.now());
  
  renderCountRef.current += 1;
  
  console.log("App.tsx: App component render", {
    renderCount: renderCountRef.current,
    timeSinceMount: Date.now() - mountTimeRef.current,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    console.log("App.tsx: App component mounted/effect triggered", {
      renderCount: renderCountRef.current,
      timestamp: new Date().toISOString()
    });
    
    // Track all events that might cause remounting
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log("App.tsx: BeforeUnload event - page reloading/closing");
    };
    
    const handleUnload = () => {
      console.log("App.tsx: Unload event - page unloading");
    };
    
    const handleVisibilityChange = () => {
      console.log("App.tsx: Visibility change", {
        visibilityState: document.visibilityState,
        hidden: document.hidden,
        timestamp: new Date().toISOString()
      });
    };
    
    const handleFocus = () => {
      console.log("App.tsx: Window focus gained", {
        timestamp: new Date().toISOString()
      });
    };
    
    const handleBlur = () => {
      console.log("App.tsx: Window focus lost", {
        timestamp: new Date().toISOString()
      });
    };

    const handlePopState = (event: PopStateEvent) => {
      console.log("App.tsx: PopState event (navigation)", {
        state: event.state,
        timestamp: new Date().toISOString()
      });
    };

    const handleHashChange = () => {
      console.log("App.tsx: Hash change event", {
        hash: window.location.hash,
        timestamp: new Date().toISOString()
      });
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      console.log("App.tsx: PageShow event", {
        persisted: event.persisted,
        timestamp: new Date().toISOString()
      });
    };

    const handlePageHide = (event: PageTransitionEvent) => {
      console.log("App.tsx: PageHide event", {
        persisted: event.persisted,
        timestamp: new Date().toISOString()
      });
    };

    // Add all event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      console.log("App.tsx: App component unmounting/cleanup", {
        renderCount: renderCountRef.current,
        timestamp: new Date().toISOString()
      });
      
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
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
