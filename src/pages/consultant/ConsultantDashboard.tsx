
import { Outlet } from "react-router-dom";
import { ConsultantSidebar } from "@/components/consultant/ConsultantSidebar";
import { ConsultantHeader } from "@/components/consultant/ConsultantHeader";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";

const ConsultantDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <ConsultantHeader />
      <ImpersonationBanner />
      <div className="flex">
        <ConsultantSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ConsultantDashboard;
