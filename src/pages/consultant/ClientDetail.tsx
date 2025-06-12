
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultantSidebar } from "@/components/consultant/ConsultantSidebar";
import { ConsultantHeader } from "@/components/consultant/ConsultantHeader";
import { Outfit, outfitImages } from "@/types";
import { ArrowLeft } from "lucide-react";
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

// Données de démonstration pour les tenues (à remplacer plus tard)
const mockOutfits: Outfit[] = [
  {
    id: "outfit1",
    name: "Tenue Professionnelle",
    clientId: "client1",
    consultantId: "consultant1",
    date: "2025-04-12",
    clothingItems: ["item1", "item2", "item3"],
    comments: "Parfait pour une réunion importante.",
    image: outfitImages[3]
  },
  {
    id: "outfit2",
    name: "Sortie du Weekend",
    clientId: "client1",
    consultantId: "consultant1",
    date: "2025-04-14",
    clothingItems: ["item4", "item5"],
    comments: "Style décontracté mais élégant.",
    image: outfitImages[5]
  },
  {
    id: "outfit3",
    name: "Cocktail d'Entreprise",
    clientId: "client2",
    consultantId: "consultant1",
    date: "2025-04-16",
    clothingItems: ["item6", "item7", "item8"],
    comments: "Élégant et professionnel.",
    image: outfitImages[1]
  }
];

const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [activeTab, setActiveTab] = useState("silhouette");
  const [client, setClient] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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

  // Filtrer les tenues pour ce client (mock data for now)
  const clientOutfits = mockOutfits;

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
            <Button asChild className="mt-4">
              <Link to="/consultant/dashboard">Retour au tableau de bord</Link>
            </Button>
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
          <div className="flex items-center mb-6">
            <Button asChild variant="ghost" className="mr-4">
              <Link to="/consultant/dashboard">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-bibabop-navy flex items-center">
                {client.profile_photo_url ? (
                  <img
                    src={client.profile_photo_url}
                    alt={getClientDisplayName(client)}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full mr-4 bg-bibabop-lightpink flex items-center justify-center font-medium">
                    {getClientInitials(client)}
                  </div>
                )}
                {getClientDisplayName(client)}
              </h1>
              <p className="subtitle">Fiche client détaillée</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="silhouette">Silhouette</TabsTrigger>
              <TabsTrigger value="outfits">Tenues</TabsTrigger>
              <TabsTrigger value="wardrobe">Garde-robe</TabsTrigger>
            </TabsList>

            <TabsContent value="silhouette" className="animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Silhouette du client</CardTitle>
                    <CardDescription>
                      Silhouette personnalisée basée sur les informations fournies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="bg-bibabop-lightgrey rounded-md">
                      <img
                        src="/looks/look-0.png"
                        alt="Silhouette personnalisée"
                        className="max-h-96 object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>
                      Informations du profil client
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Nom</span>
                        <span>{getClientDisplayName(client)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Email</span>
                        <span>{client.email || 'Non renseigné'}</span>
                      </div>
                      {client.gender && (
                        <div className="flex justify-between">
                          <span className="font-medium">Genre</span>
                          <span>{client.gender === "femme" ? "Femme" : client.gender === "homme" ? "Homme" : "Autre"}</span>
                        </div>
                      )}
                      {client.age && (
                        <div className="flex justify-between">
                          <span className="font-medium">Âge</span>
                          <span>{client.age} ans</span>
                        </div>
                      )}
                      {client.height && (
                        <div className="flex justify-between">
                          <span className="font-medium">Taille</span>
                          <span>{client.height} cm</span>
                        </div>
                      )}
                      {client.weight && (
                        <div className="flex justify-between">
                          <span className="font-medium">Poids</span>
                          <span>{client.weight} kg</span>
                        </div>
                      )}
                      {client.gender === "femme" && client.bust_size && (
                        <div className="flex justify-between">
                          <span className="font-medium">Tour de poitrine</span>
                          <span>{client.bust_size} cm</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="outfits" className="animate-fade-in">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Carte pour créer une nouvelle tenue */}
                <Card className="border-dashed border-2">
                  <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                    <div className="w-16 h-16 mb-4 rounded-full bg-bibabop-navy flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                    </div>
                    <h3 className="text-xl font-medium mb-2">Nouvelle Tenue</h3>
                    <p className="text-center text-muted-foreground text-sm mb-4">
                      Créez une nouvelle tenue pour ce client
                    </p>
                    <Button asChild className="btn-primary">
                      <Link to={`/consultant/outfit-creator?clientId=${client.id}`}>
                        Créer une tenue
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Tenues existantes */}
                {clientOutfits.map((outfit) => (
                  <Card key={outfit.id} className="card-hover">
                    <CardHeader>
                      <CardTitle>{outfit.name}</CardTitle>
                      <CardDescription>
                        Créée le {new Date(outfit.date).toLocaleDateString("fr-FR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-auto bg-muted rounded-md flex items-center justify-center mb-2 overflow-hidden">
                        <img
                          src={outfit.image}
                          alt={outfit.name}
                          className="w-full h-auto object-contain max-h-[200px]"
                        />
                      </div>
                      {outfit.comments && (
                        <div className="mt-4 p-3 bg-bibabop-lightgrey rounded-md">
                          <p className="text-sm">{outfit.comments}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Modifier</Button>
                      <Button variant="outline">Partager</Button>
                    </CardFooter>
                  </Card>
                ))}

                {clientOutfits.length === 0 && (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">Aucune tenue créée pour ce client</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="wardrobe" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Garde-robe du client</CardTitle>
                  <CardDescription>
                    Vêtements disponibles pour créer des tenues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="aspect-square bg-muted rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                      <div className="w-12 h-12 mb-2 rounded-full bg-bibabop-navy flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                      </div>
                      <span className="text-sm font-medium">Ajouter</span>
                    </div>

                    {/* Placeholder pour les vêtements */}
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="aspect-square bg-bibabop-lightgrey rounded-md flex items-center justify-center">
                        <img
                          src={`/clothes/cloth-${index+1}.png`}
                          alt="Vetement"
                          className="w-full h-auto object-contain max-h-[200px]"
                        />
                      </div>
                    ))}
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="aspect-square bg-bibabop-lightgrey rounded-md flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Vêtement {index + 5}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="btn-primary">Gérer la garde-robe</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ClientDetail;
