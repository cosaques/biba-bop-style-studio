
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultantSidebar } from "@/components/consultant/ConsultantSidebar";
import { ConsultantHeader } from "@/components/consultant/ConsultantHeader";
import { UserProfile, Outfit, outfitImages } from "@/types";
import { ArrowLeft } from "lucide-react";

// Données de démonstration
const mockClients: UserProfile[] = [
  {
    id: "client1",
    gender: "femme",
    age: 32,
    height: 168,
    weight: 62,
    bustSize: 90,
    silhouette: "public/looks/look-0.png",
    name: "Sophie Martin",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    id: "client2",
    gender: "homme",
    age: 42,
    height: 182,
    weight: 78,
    silhouette: "public/looks/look-0.png",
    name: "Thomas Dubois",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    id: "client3",
    gender: "femme",
    age: 28,
    height: 165,
    weight: 58,
    bustSize: 85,
    silhouette: "public/looks/look-0.png",
    name: "Amélie Petit",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&h=150&auto=format&fit=crop"
  }
];

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

  // Trouver le client correspondant à l'ID dans l'URL
  const client = mockClients.find(client => client.id === clientId);

  // Filtrer les tenues pour ce client
  const clientOutfits = mockOutfits.filter(outfit => outfit.clientId === clientId);

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
                <img
                  src={client.avatar}
                  alt={client.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                {client.name}
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
                        src={client.silhouette}
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
                      Détails utilisés pour générer la silhouette
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Nom</span>
                        <span>{client.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Genre</span>
                        <span>{client.gender === "femme" ? "Femme" : client.gender === "homme" ? "Homme" : "Autre"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Âge</span>
                        <span>{client.age} ans</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Taille</span>
                        <span>{client.height} cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Poids</span>
                        <span>{client.weight} kg</span>
                      </div>
                      {client.bustSize && (
                        <div className="flex justify-between">
                          <span className="font-medium">Tour de poitrine</span>
                          <span>{client.bustSize} cm</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Modifier les informations</Button>
                  </CardFooter>
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
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="aspect-square bg-bibabop-lightgrey rounded-md flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Vêtement {index + 1}</span>
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
