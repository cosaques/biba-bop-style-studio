
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultantSidebar } from "@/components/consultant/ConsultantSidebar";
import { ConsultantHeader } from "@/components/consultant/ConsultantHeader";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserProfile, outfitImages } from "@/types";

// Données fictives pour la démo
const mockClients: UserProfile[] = [
  {
    id: "client1",
    gender: "femme",
    age: 32,
    height: 168,
    weight: 62,
    bustSize: 90,
    silhouette: "/looks/look-0.png",
    name: "Sophie Martin",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    id: "client2",
    gender: "homme",
    age: 42,
    height: 182,
    weight: 78,
    silhouette: "/looks/look-0.png",
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
    silhouette: "/looks/look-0.png",
    name: "Amélie Petit",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&h=150&auto=format&fit=crop"
  }
];

const ConsultantDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("clients");

  const filteredClients = mockClients.filter((client) =>
    client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Exemple de tenues récentes à afficher
  const recentOutfits = [
    {
      name: "Tenue Professionnelle",
      client: "Sophie Martin",
      clientId: "client1",
      date: new Date().toLocaleDateString("fr-FR"),
      image: outfitImages[3]
    },
    {
      name: "Sortie Weekend",
      client: "Amélie Petit",
      clientId: "client3",
      date: new Date(Date.now() - 86400000).toLocaleDateString("fr-FR"), // -1 jour
      image: outfitImages[6]
    },
    {
      name: "Style décontracté",
      client: "Thomas Dubois",
      clientId: "client2",
      date: new Date(Date.now() - 172800000).toLocaleDateString("fr-FR"), // -2 jours
      image: outfitImages[9]
    }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <ConsultantSidebar />

      <div className="flex-1">
        <ConsultantHeader />

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-bibabop-navy">Tableau de bord du conseiller en image</h1>
            <p className="subtitle">Gérez vos clients et créez des tenues professionnelles</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="clients">Mes Clients</TabsTrigger>
              <TabsTrigger value="outfits">Tenues Récentes</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Mes Clients</CardTitle>
                  <CardDescription>
                    Liste de tous vos clients et leurs profils
                  </CardDescription>
                  <div className="mt-4">
                    <Input
                      placeholder="Rechercher un client..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
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
                        <Button className="btn-primary">Ajouter un client</Button>
                      </CardContent>
                    </Card>

                    {/* Liste des clients */}
                    {filteredClients.map((client) => (
                      <Card key={client.id} className="card-hover">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center">
                            <Avatar className="h-12 w-12 mr-3">
                              <AvatarImage src={client.avatar} alt={client.name || `Client ${client.id}`} />
                              <AvatarFallback>{client.name?.charAt(0) || client.id.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {client.name || `Client ${client.id.replace("client", "")}`}
                          </CardTitle>
                          <CardDescription>
                            {client.gender === "femme" ? "Femme" : "Homme"}, {client.age} ans
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p>Taille: {client.height} cm</p>
                            <p>Poids: {client.weight} kg</p>
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outfits" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Tenues Récentes</CardTitle>
                  <CardDescription>
                    Les dernières tenues que vous avez créées pour vos clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentOutfits.map((outfit, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{outfit.name}</CardTitle>
                          <CardDescription>
                            Pour {outfit.client} • Créée le {outfit.date}
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
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="outline">Modifier</Button>
                          <Button variant="outline" asChild>
                            <Link to={`/consultant/client/${outfit.clientId}`}>Voir client</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                  <CardDescription>
                    Aperçu de votre activité et engagement des clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Clients</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-bibabop-navy">{mockClients.length}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Tenues Créées</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-bibabop-navy">8</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Retours Clients</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-bibabop-navy">92%</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-medium mb-4">Activité Récente</h3>
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex items-center p-4 bg-bibabop-lightgrey rounded-md">
                          <Avatar className="w-10 h-10 mr-4">
                            <AvatarImage src={mockClients[index % mockClients.length].avatar} alt="Avatar client" />
                            <AvatarFallback>{mockClients[index % mockClients.length].name?.charAt(0) || "C"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{mockClients[index % mockClients.length].name || `Client ${index + 1}`} a donné un retour</p>
                            <p className="text-sm text-muted-foreground">Il y a {index + 1} jour{index > 0 ? 's' : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ConsultantDashboard;
