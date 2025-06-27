
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

interface ConsultantClientHeaderProps {
  client: ClientData;
  title: string;
}

export function ConsultantClientHeader({ client, title }: ConsultantClientHeaderProps) {
  const navigate = useNavigate();

  const getClientDisplayName = (client: ClientData) => {
    if (client.first_name || client.last_name) {
      return `${client.first_name || ''} ${client.last_name || ''}`.trim();
    }
    return client.email || 'Client sans nom';
  };

  const getClientInitials = (client: ClientData) => {
    if (client.first_name || client.last_name) {
      return `${client.first_name?.charAt(0) || ''}${client.last_name?.charAt(0) || ''}`;
    }
    return client.email?.charAt(0).toUpperCase() || 'C';
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center mb-6">
      <Button onClick={handleBackClick} variant="ghost" className="mr-4">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour
      </Button>
      <div>
        <h1 className="text-3xl font-bold text-bibabop-navy flex items-center">
          {client.profile_photo_url ? (
            <img
              src={client.profile_photo_url}
              alt={getClientDisplayName(client)}
              className="w-12 h-12 rounded-full mr-4 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full mr-4 bg-bibabop-lightpink flex items-center justify-center font-medium">
              {getClientInitials(client)}
            </div>
          )}
          {getClientDisplayName(client)}
        </h1>
        <p className="subtitle">{title}</p>
      </div>
    </div>
  );
}
