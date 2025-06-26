
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientProfile } from "@/hooks/useClientProfile";

export function ClientSilhouette() {
  const { profile, loading } = useClientProfile();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const silhouetteImage = profile.gender === "homme"
    ? "/looks/m-look-0.png"
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
