
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-bibabop-navy">Tenues du client</h2>
          <p className="text-muted-foreground">Gérez les tenues créées pour ce client</p>
        </div>
        <Button asChild className="btn-primary">
          <Link to={`/consultant/client/${clientId}/outfits/create`}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une tenue
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenues existantes</CardTitle>
          <CardDescription>
            Liste des tenues créées pour ce client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune tenue créée pour le moment</p>
            <p className="text-sm mt-2">Commencez par créer votre première tenue pour ce client</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientOutfits;
