
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
import ConsultantClientLayout from "./pages/consultant/ConsultantClientLayout";
import ConsultantClient from "./pages/consultant/ConsultantClient";
import ConsultantClientMain from "./pages/consultant/ClientMain";
import ConsultantClientOutfits from "./pages/consultant/ClientOutfits";
import ConsultantClientWardrobe from "./pages/consultant/ClientWardrobe";
import OutfitCreator from "./pages/consultant/OutfitCreator";
import Messages from "./pages/shared/Messages";
import Conversation from "./pages/shared/Conversation";
import NotFound from "./pages/NotFound";
import AIDress from "./pages/experimental/AIDress";
import AdminImpersonation from "./pages/admin/AdminImpersonation";
import { UnreadCountProvider } from "./contexts/UnreadCountContext";

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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProfileProvider>
          <UnreadCountProvider>
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

                  {/* Admin Route - No protection needed, self-contained */}
                  <Route path="/admin" element={<AdminImpersonation />} />

                  {/* Experimental Routes */}
                  <Route path="/experimental/ai-dress" element={
                    <ProtectedRoute>
                      <AIDress />
                    </ProtectedRoute>
                  } />

                  {/* Routes Client */}
                  <Route path="/client/dashboard" element={
                    <ProtectedRoute requiredRole="client">
                      <ClientDashboard />
                    </ProtectedRoute>
                  }>
                    <Route index element={<ClientMain />} />
                    <Route path="outfits" element={<ClientOutfits />} />
                    <Route path="wardrobe" element={<ClientWardrobe />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="messages/:conversationId" element={<Conversation />} />
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
                    <Route path="messages" element={<Messages />} />
                    <Route path="messages/:conversationId" element={<Conversation />} />
                    <Route path="settings" element={<ConsultantSettings />} />
                  </Route>

                  {/* Consultant Client Layout - handles shared header and client data */}
                  <Route path="/consultant/client/:clientId" element={
                    <ProtectedRoute requiredRole="consultant">
                      <ConsultantClientLayout />
                    </ProtectedRoute>
                  }>
                    {/* Client pages with tabs */}
                    <Route path="" element={<ConsultantClient />}>
                      <Route index element={<ConsultantClientMain />} />
                      <Route path="outfits" element={<ConsultantClientOutfits />} />
                      <Route path="wardrobe" element={<ConsultantClientWardrobe />} />
                    </Route>

                    {/* Outfit creator - standalone without tabs */}
                    <Route path="outfits/create" element={<OutfitCreator />} />
                  </Route>

                  {/* Route 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </UnreadCountProvider>
        </UserProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
