
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export function WardrobeSection() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ma Garde-robe</CardTitle>
        <CardDescription>
          Ajoutez des photos de vos vêtements pour créer des tenues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un vêtement..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

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
        <Link to="/client/wardrobe">
          <Button className="btn-primary">Gérer ma garde-robe</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
