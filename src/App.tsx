import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "@/contexts/AuthContext";
import UserProfileProvider from "@/contexts/UserProfileContext";
import LandingPage from "@/pages/LandingPage";
import ClientDashboard from "@/pages/client/ClientDashboard";
import ConsultantDashboard from "@/pages/consultant/ConsultantDashboard";
import RequireAuth from "@/components/shared/RequireAuth";
import Settings from "@/pages/shared/Settings";
import Wardrobe from "@/pages/client/Wardrobe";
import Outfits from "@/pages/client/Outfits";
import Messages from "@/pages/shared/Messages";
import Conversation from "@/pages/shared/Conversation";
import { OutfitDetail } from "@/pages/client/OutfitDetail";
import { OutfitCreate } from "@/pages/client/OutfitCreate";
import { OutfitEdit } from "@/pages/client/OutfitEdit";
import { ConsultantList } from "@/pages/Landing/ConsultantList";
import { ClientList } from "@/pages/consultant/ClientList";
import { ClientDetail } from "@/pages/consultant/ClientDetail";
import { UnreadCountProvider } from '@/contexts/UnreadCountContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <UserProfileProvider>
            <UnreadCountProvider>
              <div className="min-h-screen bg-background">
                <Toaster />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/consultants" element={<ConsultantList />} />

                  {/* Client routes */}
                  <Route path="/client/dashboard" element={<RequireAuth role="client"><ClientDashboard /></RequireAuth>} />
                  <Route path="/client/dashboard/settings" element={<RequireAuth role="client"><Settings /></RequireAuth>} />
                  <Route path="/client/dashboard/wardrobe" element={<RequireAuth role="client"><Wardrobe /></RequireAuth>} />
                  <Route path="/client/dashboard/outfits" element={<RequireAuth role="client"><Outfits /></RequireAuth>} />
                  <Route path="/client/dashboard/outfits/:outfitId" element={<RequireAuth role="client"><OutfitDetail /></RequireAuth>} />
                  <Route path="/client/dashboard/outfits/create" element={<RequireAuth role="client"><OutfitCreate /></RequireAuth>} />
                  <Route path="/client/dashboard/outfits/:outfitId/edit" element={<RequireAuth role="client"><OutfitEdit /></RequireAuth>} />
                  <Route path="/client/dashboard/messages" element={<RequireAuth role="client"><Messages /></RequireAuth>} />
                  <Route path="/client/dashboard/messages/:conversationId" element={<RequireAuth role="client"><Conversation /></RequireAuth>} />

                  {/* Consultant routes */}
                  <Route path="/consultant/dashboard" element={<RequireAuth role="consultant"><ConsultantDashboard /></RequireAuth>} />
                  <Route path="/consultant/dashboard/settings" element={<RequireAuth role="consultant"><Settings /></RequireAuth>} />
                  <Route path="/consultant/dashboard/clients" element={<RequireAuth role="consultant"><ClientList /></RequireAuth>} />
                  <Route path="/consultant/dashboard/clients/:clientId" element={<RequireAuth role="consultant"><ClientDetail /></RequireAuth>} />
                  <Route path="/consultant/dashboard/messages" element={<RequireAuth role="consultant"><Messages /></RequireAuth>} />
                  <Route path="/consultant/dashboard/messages/:conversationId" element={<RequireAuth role="consultant"><Conversation /></RequireAuth>} />
                </Routes>
              </div>
            </UnreadCountProvider>
          </UserProfileProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
