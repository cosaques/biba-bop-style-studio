
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import { ClientHeader } from "@/components/client/ClientHeader";
import { ClientSettings } from "@/components/client/ClientSettings";
import { ClientInformationsEdit } from "@/components/client/ClientInformationsEdit";
import { useClientProfile } from "@/hooks/useClientProfile";
import { Outfit, outfitImages } from "@/types";

// Données fictives pour la démo
const mockOutfits: Outfit[] = [
  {
    id: "outfit1",
    name: "Tenue Professionnelle",
    clientId: "client1",
    consultantId: "consultant1",
    date: "2025-04-12",
    clothingItems: ["item1", "item2", "item3"],
    comments: "Parfait pour une réunion importante.",
    image: outfitImages[4]
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
  }
];

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("silhouette");
  const [showEditForm, setShowEditForm] = useState(false);
  const { profile, loading } = useClientProfile();

  const renderGenderDisplay = (gender?: string | null) => {
    if (!gender) return "Non renseigné";
    
    switch(gender) {
      case "homme": return "Homme";
      case "femme": return "Femme";
      case "autre": return "Autre";
      default: return "Non renseigné";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <ClientSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ClientSidebar />

      <div className="flex-1">
        <ClientHeader />

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-bibabop-navy">Bienvenue sur votre espace</h1>
            <p className="subtitle">Explorez vos tenues et gérez votre garde-robe personnelle</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="silhouette">Ma Silhouette</TabsTrigger>
              <TabsTrigger value="outfits">Mes Tenues</TabsTrigger>
              <TabsTrigger value="wardrobe">Ma Garde-robe</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            <TabsContent value="silhouette" className="animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ma Silhouette</CardTitle>
                    <CardDescription>
                      Votre silhouette personnalisée basée sur vos informations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="bg-bibabop-lightgrey rounded-md">
                      <img
                        src="looks/look-0.png"
                        alt="Silhouette personnalisée"
                        className="max-h-96 object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mes Informations</CardTitle>
                    <CardDescription>
                      Détails utilisés pour générer votre silhouette
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {showEditForm ? (
                      <ClientInformationsEdit onClose={() => setShowEditForm(false)} />
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Genre</span>
                          <span>{renderGenderDisplay(profile?.gender)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Âge</span>
                          <span>{profile?.age ? `${profile.age} ans` : "Non renseigné"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Taille</span>
                          <span>{profile?.height ? `${profile.height} cm` : "Non renseigné"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Poids</span>
                          <span>{profile?.weight ? `${profile.weight} kg` : "Non renseigné"}</span>
                        </div>
                        {profile?.bust_size && (
                          <div className="flex justify-between">
                            <span className="font-medium">Tour de poitrine</span>
                            <span>{profile.bust_size} cm</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  {!showEditForm && (
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowEditForm(true)}
                      >
                        Modifier mes informations
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="outfits" className="animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                {mockOutfits.map((outfit) => (
                  <Card key={outfit.id} className="card-hover">
                    <CardHeader>
                      <CardTitle>{outfit.name}</CardTitle>
                      <CardDescription>
                        Créé le {new Date(outfit.date).toLocaleDateString("fr-FR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-auto bg-muted rounded-md flex items-center justify-center mb-4 overflow-hidden">
                        <img
                          src={outfit.image}
                          alt={outfit.name}
                          className="w-full h-auto object-contain max-h-[200px]"
                        />
                      </div>
                      {outfit.comments && (
                        <div className="mt-4 p-3 bg-bibabop-lightgrey rounded-md">
                          <p className="text-sm font-medium mb-1">Commentaires du conseiller en image:</p>
                          <p className="text-sm">{outfit.comments}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Voir les détails
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wardrobe" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Ma Garde-robe</CardTitle>
                  <CardDescription>
                    Ajoutez des photos de vos vêtements pour créer des tenues
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
                          src={`clothes/cloth-${index+1}.png`}
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
                  <Link to="/client/wardrobe">
                    <Button className="btn-primary">Gérer ma garde-robe</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="animate-fade-in">
              <ClientSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
