import { useOutletContext, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ClientData {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_photo_url?: string;
  age?: number;
  height?: number;
  weight?: number;
  bust_size?: number;
  gender?: string;
}

interface ContextType {
  client: ClientData;
}

const ClientOutfits = () => {
  const { client } = useOutletContext<ContextType>();
  const { clientId } = useParams();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tenues existantes</CardTitle>
          <CardDescription>
            Liste des tenues créées pour ce client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* New Outfit Creation Card */}
            <Card className="border-dashed border-2 hover:bg-muted/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 rounded-full bg-bibabop-navy flex items-center justify-center text-white mb-4">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nouvelle Tenue</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Créez une nouvelle tenue pour ce client
                </p>
                <Button asChild className="btn-primary">
                  <Link to={`/consultant/client/${clientId}/outfits/create`}>
                    Créer une tenue
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Existing outfits would go here */}
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune tenue créée pour le moment</p>
              <p className="text-sm mt-2">Commencez par créer votre première tenue pour ce client</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientOutfits;
