
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ClientInviteModal } from "@/components/consultant/ClientInviteModal";
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

const ConsultantMain = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('consultant_clients')
        .select(`
          client_id,
          profiles!consultant_clients_client_id_fkey (
            id,
            first_name,
            last_name,
            email,
            profile_photo_url,
            client_profiles!client_profiles_user_id_fkey (
              age,
              height,
              weight,
              bust_size,
              gender
            )
          )
        `)
        .eq('consultant_id', user?.id);

      if (error) {
        throw error;
      }

      const clientsData = data?.map((item: any) => ({
        id: item.profiles.id,
        first_name: item.profiles.first_name,
        last_name: item.profiles.last_name,
        email: item.profiles.email,
        profile_photo_url: item.profiles.profile_photo_url,
        age: item.profiles.client_profiles?.age,
        height: item.profiles.client_profiles?.height,
        weight: item.profiles.client_profiles?.weight,
        bust_size: item.profiles.client_profiles?.bust_size,
        gender: item.profiles.client_profiles?.gender,
      })) || [];

      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des clients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
    const email = client.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || email.includes(query);
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-bibabop-navy">Mon espace personnel</h1>
            <p className="subtitle">Gérez vos clients et créez des tenues professionnelles</p>
          </div>
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bibabop-navy">Mon espace personnel</h1>
          <p className="subtitle">Gérez vos clients et créez des tenues professionnelles</p>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Carte pour ajouter un client */}
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <div className="w-16 h-16 mb-4 rounded-full bg-bibabop-navy flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Nouveau Client</h3>
              <p className="text-center text-muted-foreground text-sm mb-4">
                Ajoutez un nouveau client à votre portefeuille
              </p>
              <Button
                className="btn-primary"
                onClick={() => setShowInviteModal(true)}
              >
                Ajouter un client
              </Button>
            </CardContent>
          </Card>

          {/* Liste des clients */}
          {filteredClients.map((client) => (
            <Card key={client.id} className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={client.profile_photo_url || undefined} alt={getClientDisplayName(client)} />
                    <AvatarFallback>{getClientInitials(client)}</AvatarFallback>
                  </Avatar>
                  {getClientDisplayName(client)}
                </CardTitle>
                <CardDescription>
                  {client.gender === "femme" ? "Femme" : client.gender === "homme" ? "Homme" : "Non spécifié"}
                  {client.age && `, ${client.age} ans`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mt-2 text-sm text-muted-foreground">
                  {client.height && <p>Taille: {client.height} cm</p>}
                  {client.weight && <p>Poids: {client.weight} kg</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link to={`/consultant/client/${client.id}`}>Détails</Link>
                </Button>
                <Button className="btn-primary" asChild>
                  <Link to={`/consultant/outfit-creator?clientId=${client.id}`}>Créer une tenue</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}

          {filteredClients.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">
                {searchQuery ? "Aucun client trouvé pour cette recherche" : "Aucun client dans votre portefeuille"}
              </p>
            </div>
          )}
        </div>

        <ClientInviteModal
          open={showInviteModal}
          onOpenChange={setShowInviteModal}
        />
      </div>
    </div>
  );
};

export default ConsultantMain;
