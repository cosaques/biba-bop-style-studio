
import { Outlet } from "react-router-dom";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import { ClientHeader } from "@/components/client/ClientHeader";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";

const ClientDashboard = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <ClientSidebar />
      <ImpersonationBanner />
      <div className="flex-1">
        <ClientHeader />
        <main className="relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
