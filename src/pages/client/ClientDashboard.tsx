
import { Outlet } from "react-router-dom";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import { ClientHeader } from "@/components/client/ClientHeader";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";

const ClientDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <ImpersonationBanner />
      <div className="flex">
        <ClientSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
