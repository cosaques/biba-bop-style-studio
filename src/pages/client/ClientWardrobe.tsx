
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClothingItem } from "@/types";

// Mock data for clothing items with actual images
const mockClothes: ClothingItem[] = [
  {
    id: "item1",
    userId: "client1",
    image: "/clothes/cloth-1.png",
    type: "haut",
    color: "bleu",
    season: "toutes",
    enhanced: true
  },
  {
    id: "item2",
    userId: "client1",
    image: "/clothes/cloth-2.png",
    type: "bas",
    color: "noir",
    season: "toutes",
    enhanced: true
  },
  {
    id: "item3",
    userId: "client1",
    image: "/clothes/cloth-3.png",
    type: "haut",
    color: "gris",
    season: "hiver",
    enhanced: true
  },
  {
    id: "item4",
    userId: "client1",
    image: "/clothes/cloth-4.png",
    type: "chaussures",
    color: "marron",
    season: "toutes",
    enhanced: false
  },
  {
    id: "item5",
    userId: "client1",
    image: "/clothes/cloth-5.png",
    type: "robe",
    color: "rouge",
    season: "été",
    enhanced: true
  }
];

export default function ClientWardrobe() {
  const [filter, setFilter] = useState("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newItemType, setNewItemType] = useState("");
  const [newItemColor, setNewItemColor] = useState("");
  const [newItemSeason, setNewItemSeason] = useState("toutes");
  const [isUploading, setIsUploading] = useState(false);

  const filteredClothes = mockClothes.filter((item) => {
    const matchesFilter = filter === "tous" || item.type === filter;
    const matchesSearch = item.type.includes(searchTerm.toLowerCase()) ||
      item.color.includes(searchTerm.toLowerCase()) ||
      (item.season && item.season.includes(searchTerm.toLowerCase()));
    return matchesFilter && (searchTerm ? matchesSearch : true);
  });

  const clothingTypes = ["haut", "bas", "robe", "chaussures", "accessoire"];

  const handleUpload = () => {
    setIsUploading(true);
    // Simuler le téléchargement et le traitement de l'image
    setTimeout(() => {
      setIsUploading(false);
      setIsUploadDialogOpen(false);
      // Réinitialiser les champs du formulaire
      setNewItemType("");
      setNewItemColor("");
      setNewItemSeason("toutes");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bibabop-navy">Ma Garde-robe</h1>
          <p className="subtitle">Gérez vos vêtements pour créer des tenues personnalisées</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-2/3">
            <Input
              placeholder="Rechercher par type, couleur, saison..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full md:w-1/3 flex justify-end">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary w-full md:w-auto">
                  Ajouter un vêtement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau vêtement</DialogTitle>
                  <DialogDescription>
                    Téléchargez une photo et fournissez des détails sur votre vêtement
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="image" className="text-right">
                      Image
                    </Label>
                    <div className="col-span-3">
                      <div className="h-32 bg-muted rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <span className="text-sm">Cliquez pour télécharger</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select value={newItemType} onValueChange={setNewItemType}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {clothingTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="color" className="text-right">
                      Couleur
                    </Label>
                    <Input
                      id="color"
                      value={newItemColor}
                      onChange={(e) => setNewItemColor(e.target.value)}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="season" className="text-right">
                      Saison
                    </Label>
                    <Select value={newItemSeason} onValueChange={setNewItemSeason}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionnez une saison" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="toutes">Toutes les saisons</SelectItem>
                        <SelectItem value="printemps">Printemps</SelectItem>
                        <SelectItem value="été">Été</SelectItem>
                        <SelectItem value="automne">Automne</SelectItem>
                        <SelectItem value="hiver">Hiver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    className="btn-primary"
                    onClick={handleUpload}
                    disabled={!newItemType || !newItemColor || isUploading}
                  >
                    {isUploading ? "Traitement en cours..." : "Télécharger"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="tous" value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="tous">Tous</TabsTrigger>
            <TabsTrigger value="haut">Hauts</TabsTrigger>
            <TabsTrigger value="bas">Bas</TabsTrigger>
            <TabsTrigger value="robe">Robes</TabsTrigger>
            <TabsTrigger value="chaussures">Chaussures</TabsTrigger>
            <TabsTrigger value="accessoire">Accessoires</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="animate-fade-in">
            {filteredClothes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                  </div>
                  <h3 className="text-xl font-medium mb-2">Aucun vêtement trouvé</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {searchTerm
                      ? `Aucun résultat pour "${searchTerm}". Essayez une autre recherche.`
                      : "Vous n'avez pas encore ajouté de vêtements dans cette catégorie."}
                  </p>
                  <Button className="btn-primary mt-6" onClick={() => setIsUploadDialogOpen(true)}>
                    Ajouter un vêtement
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredClothes.map((item) => (
                  <Card key={item.id} className="card-hover">
                    <CardHeader className="p-0">
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={item.image}
                          alt={`${item.color} ${item.type}`}
                          className="w-full h-full object-cover"
                        />
                        {item.enhanced && (
                          <div className="absolute top-2 right-2 bg-bibabop-navy text-white text-xs px-2 py-1 rounded-full">
                            Amélioré
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <h3 className="font-medium">{item.color.charAt(0).toUpperCase() + item.color.slice(1)} {item.type.charAt(0).toUpperCase() + item.type.slice(1)}</h3>
                      <p className="text-sm text-muted-foreground">
                        Saison: {item.season?.charAt(0).toUpperCase() + (item.season?.slice(1) || '')}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Button variant="outline" size="sm">Modifier</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        Supprimer
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
