
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

const ClientMain = () => {
  const { client } = useOutletContext<ContextType>();

  const getClientDisplayName = (client: ClientData) => {
    if (client.first_name || client.last_name) {
      return `${client.first_name || ''} ${client.last_name || ''}`.trim();
    }
    return client.email || 'Client sans nom';
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Silhouette du client</CardTitle>
          <CardDescription>
            Silhouette personnalisée basée sur les informations fournies
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="bg-bibabop-lightgrey rounded-md">
            <img
              src="/looks/look-0.png"
              alt="Silhouette personnalisée"
              className="max-h-96 object-contain"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Informations du profil client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Nom</span>
              <span>{getClientDisplayName(client)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email</span>
              <span>{client.email || 'Non renseigné'}</span>
            </div>
            {client.gender && (
              <div className="flex justify-between">
                <span className="font-medium">Genre</span>
                <span>{client.gender === "femme" ? "Femme" : client.gender === "homme" ? "Homme" : "Autre"}</span>
              </div>
            )}
            {client.age && (
              <div className="flex justify-between">
                <span className="font-medium">Âge</span>
                <span>{client.age} ans</span>
              </div>
            )}
            {client.height && (
              <div className="flex justify-between">
                <span className="font-medium">Taille</span>
                <span>{client.height} cm</span>
              </div>
            )}
            {client.weight && (
              <div className="flex justify-between">
                <span className="font-medium">Poids</span>
                <span>{client.weight} kg</span>
              </div>
            )}
            {client.gender === "femme" && client.bust_size && (
              <div className="flex justify-between">
                <span className="font-medium">Tour de poitrine</span>
                <span>{client.bust_size} cm</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientMain;
