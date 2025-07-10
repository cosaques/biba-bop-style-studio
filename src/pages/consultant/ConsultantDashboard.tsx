
import { Outlet } from "react-router-dom";
import { ConsultantSidebar } from "@/components/consultant/ConsultantSidebar";
import { ConsultantHeader } from "@/components/consultant/ConsultantHeader";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";

const ConsultantDashboard = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <ConsultantSidebar />

      <div className="flex-1">
        <ConsultantHeader />
        <ImpersonationBanner />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ConsultantDashboard;
