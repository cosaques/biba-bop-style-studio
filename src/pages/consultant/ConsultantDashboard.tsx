
import { Outlet } from "react-router-dom";
import { ConsultantSidebar } from "@/components/consultant/ConsultantSidebar";
import { ConsultantHeader } from "@/components/consultant/ConsultantHeader";

const ConsultantDashboard = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <ConsultantSidebar />
      
      <div className="flex-1">
        <ConsultantHeader />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ConsultantDashboard;
