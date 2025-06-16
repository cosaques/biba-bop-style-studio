
import { useOutletContext } from "react-router-dom";
import ClientSilhouette from "./ClientSilhouette";

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

const ClientSilhouetteWrapper = () => {
  const { client } = useOutletContext<ContextType>();
  return <ClientSilhouette client={client} />;
};

export default ClientSilhouetteWrapper;
