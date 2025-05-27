import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ConsultantSidebar } from "@/components/consultant/ConsultantSidebar";
import { ConsultantHeader } from "@/components/consultant/ConsultantHeader";
import { ClothingItem, UserProfile } from "@/types";

// Données fictives pour la démo
const mockClient: UserProfile = {
  id: "client1",
  gender: "femme",
  age: 32,
  height: 168,
  weight: 62,
  bustSize: 90,
  silhouette: "/looks/look-0.png"
};

const mockClothes: ClothingItem[] = [
  {
    id: "item1",
    userId: "client1",
    image: "/clothes/cloth-1.png",
    type: "haut",
    color: "blanc"
  },
  {
    id: "item2",
    userId: "client1",
    image: "/clothes/cloth-2.png",
    type: "bas",
    color: "bleu"
  },
  {
    id: "item3",
    userId: "client1",
    image: "/clothes/cloth-4.png",
    type: "haut",
    color: "marron"
  },
  {
    id: "item4",
    userId: "client1",
    image: "/clothes/cloth-5.png",
    type: "chaussures",
    color: "marron"
  }
];

// Catalogue externe de vêtements
const externalCatalog: ClothingItem[] = [
  {
    id: "ext1",
    userId: "external",
    image: "/clothes/cloth-3.png",
    type: "bas",
    color: "gris"
  },
  {
    id: "ext2",
    userId: "external",
    image: "/clothes/cloth-6.png",
    type: "accessoire",
    color: "marron"
  },
  {
    id: "ext3",
    userId: "external",
    image: "/clothes/cloth-7.png",
    type: "accessoire",
    color: "beige"
  }
];

const OutfitCreator = () => {
  const [selectedClothes, setSelectedClothes] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [activeTab, setActiveTab] = useState("wardrobe");
  const [filter, setFilter] = useState("tous");
  const [isSaving, setIsSaving] = useState(false);

  const handleItemSelect = (itemId: string) => {
    if (selectedClothes.includes(itemId)) {
      setSelectedClothes(selectedClothes.filter(id => id !== itemId));
    } else {
      setSelectedClothes([...selectedClothes, itemId]);
    }
  };

  const handleSaveOutfit = () => {
    setIsSaving(true);
    // Simuler la sauvegarde de la tenue
    setTimeout(() => {
      setIsSaving(false);
      alert("Tenue enregistrée et partagée avec le client!");
      // Réinitialiser
      setSelectedClothes([]);
      setComments("");
    }, 1500);
  };

  const filteredWardrobe = mockClothes.filter(
    item => filter === "tous" || item.type === filter
  );

  const filteredCatalog = externalCatalog.filter(
    item => filter === "tous" || item.type === filter
  );

  return (
    <div className="flex min-h-screen bg-background">
      <ConsultantSidebar />

      <div className="flex-1">
        <ConsultantHeader />

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-bibabop-navy">Création de Tenue</h1>
            <p className="subtitle">Créez une tenue personnalisée pour votre client</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Panel de gauche: silhouette et tenue */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Silhouette du Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="relative min-h-[400px] w-full bg-bibabop-lightgrey rounded-md flex items-center justify-center">
                      <img
                        src={mockClient.silhouette}
                        alt="Silhouette du client"
                        className="max-h-[600px] w-auto object-contain"
                      />

                      {/* Vêtements sélectionnés qui seraient positionnés sur la silhouette */}
                      {selectedClothes.map(itemId => {
                        const item = [...mockClothes, ...externalCatalog].find(i => i.id === itemId);
                        if (!item) return null;

                        let positionClass = "";
                        if (item.type === "haut") positionClass = "top-1/4 -translate-y-[40px]";
                        if (item.type === "bas") positionClass = "top-1/2 -translate-y-[50px]";
                        if (item.type === "chaussures") positionClass = "bottom-0 translate-y-[15px]";
                        if (item.type === "accessoire") positionClass = "top-10 right-10";

                        // 🎯 Taille spécifique par type
                        let tailleClass = "";
                        if (item.type === "haut") tailleClass = "w-40 h-auto";         // haut → grand
                        if (item.type === "bas") tailleClass = "w-28";          // bas → un peu plus petit
                        if (item.type === "chaussures") tailleClass = "w-28 h-28";   // chaussures → plus petit
                        if (item.type === "accessoire") tailleClass = "w-20 h-20";   // accessoire → encore plus petit

                        return (
                          <div
                            key={itemId}
                            className={`absolute ${tailleClass} ${positionClass} cursor-move`}
                            style={{ opacity: 0.8 }}
                          >
                            <img
                              src={item.image}
                              alt={item.type}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        );
                      })}

                    </div>

                    <div className="mt-6 w-full">
                      <h3 className="font-medium mb-2">Commentaires sur la tenue</h3>
                      <Textarea
                        placeholder="Ajoutez vos commentaires et conseils pour le client..."
                        className="min-h-[100px]"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                      />
                    </div>

                    <Button
                      className="btn-primary w-full mt-4"
                      onClick={handleSaveOutfit}
                      disabled={selectedClothes.length === 0 || isSaving}
                    >
                      {isSaving ? "Enregistrement..." : "Enregistrer et partager"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Panel de droite: sélection des vêtements */}
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Sélection des Vêtements</CardTitle>
                    <TabsList className="grid grid-cols-2 w-48 mb-4">
                      <TabsTrigger value="wardrobe">Garde-robe</TabsTrigger>
                      <TabsTrigger value="catalog">Catalogue</TabsTrigger>
                    </TabsList>
                    <Tabs value={filter} onValueChange={setFilter}>
                      <TabsList className="grid grid-cols-5 mb-4">
                        <TabsTrigger value="tous">Tous</TabsTrigger>
                        <TabsTrigger value="haut">Hauts</TabsTrigger>
                        <TabsTrigger value="bas">Bas</TabsTrigger>
                        <TabsTrigger value="chaussures">Chaussures</TabsTrigger>
                        <TabsTrigger value="accessoire">Accessoires</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardHeader>

                  <CardContent>
                    {activeTab === "wardrobe" && (
                      <TabsContent value="wardrobe" className="mt-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {filteredWardrobe.map((item) => (
                            <div
                              key={item.id}
                              className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${selectedClothes.includes(item.id)
                                ? 'ring-2 ring-bibabop-gold'
                                : 'hover:shadow-md'
                                }`}
                              onClick={() => handleItemSelect(item.id)}
                            >
                              <div className="aspect-square bg-bibabop-lightgrey relative flex items-center justify-center">
                                <img
                                  src={item.image}
                                  alt={`${item.color} ${item.type}`}
                                  className="max-w-full max-h-full object-contain"
                                />

                                {selectedClothes.includes(item.id) && (
                                  <div className="absolute top-2 right-2 bg-bibabop-gold text-white w-6 h-6 rounded-full flex items-center justify-center">
                                    ✓
                                  </div>
                                )}
                              </div>
                              <div className="p-2">
                                <p className="font-medium">{item.color} {item.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}

                    {activeTab === "catalog" && (
                      <TabsContent value="catalog" className="mt-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {filteredCatalog.map((item) => (
                            <div
                              key={item.id}
                              className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${selectedClothes.includes(item.id)
                                ? 'ring-2 ring-bibabop-gold'
                                : 'hover:shadow-md'
                                }`}
                              onClick={() => handleItemSelect(item.id)}
                            >
                              <div className="aspect-square bg-bibabop-lightgrey relative flex items-center justify-center">
                                <img
                                  src={item.image}
                                  alt={`${item.color} ${item.type}`}
                                  className="max-w-full max-h-full object-contain"
                                />

                                {selectedClothes.includes(item.id) && (
                                  <div className="absolute top-2 right-2 bg-bibabop-gold text-white w-6 h-6 rounded-full flex items-center justify-center">
                                    ✓
                                  </div>
                                )}
                              </div>
                              <div className="p-2">
                                <p className="font-medium">{item.color} {item.type}</p>
                                <p className="text-xs text-muted-foreground">Catalogue externe</p>
                              </div>
                            </div>
                          ))}

                          {/* Option pour ajouter un vêtement au catalogue */}
                          <div className="border border-dashed rounded-lg overflow-hidden cursor-pointer hover:bg-muted/50 transition-all">
                            <div className="aspect-square flex flex-col items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-bibabop-navy flex items-center justify-center text-white mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                              </div>
                              <p className="font-medium">Ajouter au catalogue</p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    )}
                  </CardContent>
                </Card>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OutfitCreator;
