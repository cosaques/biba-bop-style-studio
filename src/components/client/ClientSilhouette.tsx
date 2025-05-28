
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ClientSilhouette() {
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
            src="/looks/look-0.png"
            alt="Silhouette personnalisée"
            className="max-h-96 object-contain"
          />
        </div>
      </CardContent>
    </Card>
  );
}
