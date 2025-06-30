
import { Outlet } from "react-router-dom";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import { ClientHeader } from "@/components/client/ClientHeader";

const ClientDashboard = () => {
  return (
    <div className="flex min-h-screen max-h-screen bg-background">
      <ClientSidebar />
      
      <div className="flex-1 flex flex-col min-h-0">
        <ClientHeader />
        <main className="flex-1 min-h-0 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
