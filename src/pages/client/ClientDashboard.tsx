
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import { ClientHeader } from "@/components/client/ClientHeader";
import { UserProfile, Outfit } from "@/types";

// Données fictives pour la démo
const mockProfile: UserProfile = {
  id: "client1",
  gender: "femme",
  age: 32,
  height: 168,
  weight: 62,
  bustSize: 90,
  silhouette: "https://placehold.co/300x600/1A2A4A/F8F5E6?text=Silhouette"
};

const mockOutfits: Outfit[] = [
  {
    id: "outfit1",
    name: "Tenue Professionnelle",
    clientId: "client1",
    consultantId: "consultant1",
    date: "2025-04-12",
    clothingItems: ["item1", "item2", "item3"],
    comments: "Parfait pour une réunion importante."
  },
  {
    id: "outfit2",
    name: "Sortie du Weekend",
    clientId: "client1",
    consultantId: "consultant1",
    date: "2025-04-14",
    clothingItems: ["item4", "item5"],
    comments: "Style décontracté mais élégant."
  }
];

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("silhouette");

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
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="silhouette">Ma Silhouette</TabsTrigger>
              <TabsTrigger value="outfits">Mes Tenues</TabsTrigger>
              <TabsTrigger value="wardrobe">Ma Garde-robe</TabsTrigger>
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
                    <img 
                      src={mockProfile.silhouette} 
                      alt="Silhouette personnalisée" 
                      className="max-h-96 object-contain"
                    />
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
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Genre</span>
                        <span>{mockProfile.gender === "femme" ? "Femme" : mockProfile.gender === "homme" ? "Homme" : "Autre"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Âge</span>
                        <span>{mockProfile.age} ans</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Taille</span>
                        <span>{mockProfile.height} cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Poids</span>
                        <span>{mockProfile.weight} kg</span>
                      </div>
                      {mockProfile.bustSize && (
                        <div className="flex justify-between">
                          <span className="font-medium">Tour de poitrine</span>
                          <span>{mockProfile.bustSize} cm</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Modifier mes informations</Button>
                  </CardFooter>
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
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-4">
                        <span className="text-muted-foreground">Aperçu de la tenue</span>
                      </div>
                      {outfit.comments && (
                        <div className="mt-4 p-3 bg-bibabop-lightgrey rounded-md">
                          <p className="text-sm font-medium mb-1">Commentaires du consultant:</p>
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
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="aspect-square bg-bibabop-lightgrey rounded-md flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Vêtement {index + 1}</span>
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
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
