
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ClientDashboard from "./pages/client/ClientDashboard";
import Onboarding from "./pages/client/Onboarding";
import WardrobeManager from "./pages/client/WardrobeManager";
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
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/:role" element={<Register />} />

            {/* Routes Client */}
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/onboarding" element={<Onboarding />} />
            <Route path="/client/wardrobe" element={<WardrobeManager />} />

            {/* Routes Conseiller en Image */}
            <Route path="/consultant/dashboard" element={<ConsultantDashboard />} />
            <Route path="/consultant/client/:clientId" element={<ClientDetail />} />
            <Route path="/consultant/outfit-creator" element={<OutfitCreator />} />

            {/* Route 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
