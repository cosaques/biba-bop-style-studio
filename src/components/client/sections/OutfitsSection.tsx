
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
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

export function OutfitsSection() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOutfits = mockOutfits.filter(outfit =>
    outfit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher une tenue..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredOutfits.map((outfit) => (
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
    </div>
  );
}
