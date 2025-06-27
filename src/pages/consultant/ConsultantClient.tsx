
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ConsultantClient = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/outfits')) return 'outfits';
    if (path.endsWith('/wardrobe')) return 'wardrobe';
    return 'silhouette';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (value: string) => {
    const clientId = location.pathname.split('/')[3]; // Extract clientId from path
    if (value === 'silhouette') {
      navigate(`/consultant/client/${clientId}`);
    } else {
      navigate(`/consultant/client/${clientId}/${value}`);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="silhouette">Silhouette</TabsTrigger>
        <TabsTrigger value="outfits">Tenues</TabsTrigger>
        <TabsTrigger value="wardrobe">Garde-robe</TabsTrigger>
      </TabsList>

      <Outlet />
    </Tabs>
  );
};

export default ConsultantClient;
