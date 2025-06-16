
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Outfit, outfitImages } from "@/types";

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

const ClientOutfits = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const clientOutfits = mockOutfits;

  return (
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
            <Link to={`/consultant/outfit-creator?clientId=${clientId}`}>
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
  );
};

export default ClientOutfits;
