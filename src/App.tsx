
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientMain from "./pages/client/ClientMain";
import ClientOutfits from "./pages/client/ClientOutfits";
import ClientWardrobe from "./pages/client/ClientWardrobe";
import ClientSettingsPage from "./pages/client/ClientSettings";
import Onboarding from "./pages/client/Onboarding";
import ConsultantDashboard from "./pages/consultant/ConsultantDashboard";
import ClientDetail from "./pages/consultant/ClientDetail";
import OutfitCreator from "./pages/consultant/OutfitCreator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/:role" element={<Register />} />

            {/* Routes Client */}
            <Route path="/client/dashboard" element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<ClientMain />} />
              <Route path="outfits" element={<ClientOutfits />} />
              <Route path="wardrobe" element={<ClientWardrobe />} />
              <Route path="settings" element={<ClientSettingsPage />} />
            </Route>
            
            <Route path="/client/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />

            {/* Routes Conseiller en Image */}
            <Route path="/consultant/dashboard" element={
              <ProtectedRoute>
                <ConsultantDashboard />
              </ProtectedRoute>
            } />
            <Route path="/consultant/client/:clientId" element={
              <ProtectedRoute>
                <ClientDetail />
              </ProtectedRoute>
            } />
            <Route path="/consultant/outfit-creator" element={
              <ProtectedRoute>
                <OutfitCreator />
              </ProtectedRoute>
            } />

            {/* Route 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
