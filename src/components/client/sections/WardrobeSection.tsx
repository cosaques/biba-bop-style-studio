import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export function WardrobeSection() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for clothing items
  const clothingItems = [
    { id: 1, name: "Chemise bleue", type: "haut", image: "/clothes/cloth-1.png" },
    { id: 2, name: "Pantalon noir", type: "bas", image: "/clothes/cloth-2.png" },
    { id: 3, name: "Veste grise", type: "haut", image: "/clothes/cloth-3.png" },
    { id: 4, name: "Chaussures marron", type: "chaussures", image: "/clothes/cloth-4.png" },
  ];

  const filteredItems = clothingItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un vêtement..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add clothing button */}
      <div className="flex justify-end">
        <Link to="/client/wardrobe">
          <Button className="btn-primary">Ajouter un vêtement</Button>
        </Link>
      </div>

      {/* Clothing items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Add clothing card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="aspect-square bg-muted rounded-md flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 mb-2 rounded-full bg-bibabop-navy flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </div>
            <span className="text-sm font-medium">Ajouter un vêtement</span>
          </CardContent>
        </Card>

        {/* Existing clothing items */}
        {filteredItems.map((item) => (
          <Card key={item.id} className="card-hover">
            <CardContent className="aspect-square p-4">
              <div className="w-full h-full bg-bibabop-lightgrey rounded-md flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-auto object-contain max-h-full"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start p-4 pt-2">
              <h3 className="font-medium text-sm">{item.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && searchTerm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">Aucun vêtement trouvé</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Aucun résultat pour "{searchTerm}". Essayez une autre recherche.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
