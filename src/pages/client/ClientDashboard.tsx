
import { Outlet } from "react-router-dom";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import { ClientHeader } from "@/components/client/ClientHeader";
import { useEffect } from "react";

const ClientDashboard = () => {
  useEffect(() => {
    console.log("ClientDashboard: Component mounted");
    
    return () => {
      console.log("ClientDashboard: Component unmounting");
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <ClientSidebar />
      
      <div className="flex-1">
        <ClientHeader />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
