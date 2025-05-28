
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ClientInformationsEdit } from "@/components/client/ClientInformationsEdit";
import { ProfilePhotoUpload } from "@/components/client/ProfilePhotoUpload";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useUserProfile } from "@/hooks/useUserProfile";

export function SilhouetteSection() {
  const [showEditForm, setShowEditForm] = useState(false);
  const { profile: clientProfile, loading, refetch: refetchClientProfile } = useClientProfile();
  const { profile: userProfile, updateProfile, refetch: refetchUserProfile } = useUserProfile();

  const renderGenderDisplay = (gender?: string | null) => {
    if (!gender) return "Non renseigné";

    switch(gender) {
      case "homme": return "Homme";
      case "femme": return "Femme";
      case "autre": return "Autre";
      default: return "Non renseigné";
    }
  };

  const handlePhotoUpdate = (url: string | null) => {
    updateProfile({ profile_photo_url: url });
  };

  const handleFormClose = () => {
    setShowEditForm(false);
    // Refetch both profiles to ensure we have the latest data
    refetchClientProfile();
    refetchUserProfile();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Mes Informations</CardTitle>
          <CardDescription>
            Détails utilisés pour générer votre silhouette
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showEditForm ? (
            <ClientInformationsEdit onClose={handleFormClose} />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                  {userProfile?.profile_photo_url ? (
                    <img
                      src={userProfile.profile_photo_url}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground text-sm text-center">
                      Pas de photo
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center mb-4">
                <ProfilePhotoUpload
                  currentPhotoUrl={userProfile?.profile_photo_url}
                  onPhotoUpdate={handlePhotoUpdate}
                  className="text-sm"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Genre</span>
                  <span>{renderGenderDisplay(clientProfile?.gender)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Âge</span>
                  <span>{clientProfile?.age ? `${clientProfile.age} ans` : "Non renseigné"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Taille</span>
                  <span>{clientProfile?.height ? `${clientProfile.height} cm` : "Non renseigné"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Poids</span>
                  <span>{clientProfile?.weight ? `${clientProfile.weight} kg` : "Non renseigné"}</span>
                </div>
                {clientProfile?.bust_size && clientProfile?.gender === 'femme' && (
                  <div className="flex justify-between">
                    <span className="font-medium">Tour de poitrine</span>
                    <span>{clientProfile.bust_size} cm</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        {!showEditForm && (
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowEditForm(true)}
            >
              Modifier mes informations
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
