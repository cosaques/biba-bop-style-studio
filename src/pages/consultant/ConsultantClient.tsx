import { useState, useEffect } from "react";
import { useParams, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultantSidebar } from "@/components/consultant/ConsultantSidebar";
import { ConsultantHeader } from "@/components/consultant/ConsultantHeader";
import { ConsultantClientHeader } from "@/components/consultant/ConsultantClientHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ClientData {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_photo_url?: string;
  age?: number;
  height?: number;
  weight?: number;
  bust_size?: number;
  gender?: string;
}

const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/outfits')) return 'outfits';
    if (path.endsWith('/wardrobe')) return 'wardrobe';
    return 'silhouette';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    if (clientId && user) {
      fetchClientData();
    }
  }, [clientId, user]);

  const fetchClientData = async () => {
    try {
      setIsLoading(true);

      // First, verify that this client belongs to the current consultant
      const { data: relationship, error: relationshipError } = await supabase
        .from('consultant_clients')
        .select('client_id')
        .eq('consultant_id', user?.id)
        .eq('client_id', clientId)
        .single();

      if (relationshipError || !relationship) {
        throw new Error("Client not found or unauthorized");
      }

      // Fetch client profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Fetch client personal data
      const { data: clientProfileData, error: clientProfileError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', clientId)
        .maybeSingle();

      if (clientProfileError) {
        console.error('Error fetching client profile:', clientProfileError);
      }

      const clientData: ClientData = {
        id: profileData.id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        profile_photo_url: profileData.profile_photo_url,
        age: clientProfileData?.age,
        height: clientProfileData?.height,
        weight: clientProfileData?.weight,
        bust_size: clientProfileData?.bust_size,
        gender: clientProfileData?.gender,
      };

      setClient(clientData);
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du client",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getClientDisplayName = (client: ClientData) => {
    if (client.first_name || client.last_name) {
      return `${client.first_name || ''} ${client.last_name || ''}`.trim();
    }
    return client.email || 'Client sans nom';
  };

  const getClientInitials = (client: ClientData) => {
    if (client.first_name || client.last_name) {
      return `${client.first_name?.charAt(0) || ''}${client.last_name?.charAt(0) || ''}`;
    }
    return client.email?.charAt(0).toUpperCase() || 'C';
  };

  const handleTabChange = (value: string) => {
    if (value === 'silhouette') {
      navigate(`/consultant/client/${clientId}`);
    } else {
      navigate(`/consultant/client/${clientId}/${value}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <ConsultantSidebar />
        <div className="flex-1">
          <ConsultantHeader />
          <main className="p-6">
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-background">
        <ConsultantSidebar />
        <div className="flex-1">
          <ConsultantHeader />
          <main className="p-6">
            <h1 className="text-2xl font-bold">Client non trouvé</h1>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ConsultantSidebar />
      <div className="flex-1">
        <ConsultantHeader />
        <main className="p-6">
          <ConsultantClientHeader client={client} title="Fiche client détaillée" />

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="silhouette">Silhouette</TabsTrigger>
              <TabsTrigger value="outfits">Tenues</TabsTrigger>
              <TabsTrigger value="wardrobe">Garde-robe</TabsTrigger>
            </TabsList>

            <div className="animate-fade-in">
              <Outlet context={{ client }} />
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ClientDetail;
