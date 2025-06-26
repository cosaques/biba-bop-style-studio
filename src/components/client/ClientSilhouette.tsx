
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientSilhouetteProps {
  gender?: string;
}

export function ClientSilhouette({ gender }: ClientSilhouetteProps) {
  const silhouetteImage = gender === "homme" 
    ? "/lovable-uploads/c41f5023-8d50-47f0-bab9-e9b90648d156.png"
    : "/looks/look-0.png";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ma Silhouette</CardTitle>
        <CardDescription>
          Votre silhouette personnalisée basée sur vos informations
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="bg-bibabop-lightgrey rounded-md">
          <img
            src={silhouetteImage}
            alt="Silhouette personnalisée"
            className="max-h-96 object-contain"
          />
        </div>
      </CardContent>
    </Card>
  );
}
