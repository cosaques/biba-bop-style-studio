import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Gender } from "@/types";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { ProfilePhotoUpload } from "./ProfilePhotoUpload";

export function ClientInformations() {
  const [showEditForm, setShowEditForm] = useState(false);
  const { profile: clientProfile, loading, updateProfile, refetch: refetchClientProfile } = useClientProfile();
  const { profile: userProfile, updateProfile: updateUserProfile, refetch: refetchUserProfile } = useUserProfile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    gender: clientProfile?.gender as Gender | undefined,
    age: clientProfile?.age || undefined,
    height: clientProfile?.height || undefined,
    weight: clientProfile?.weight || undefined,
    bustSize: clientProfile?.bust_size || undefined
  });

  // Update form data when clientProfile changes OR when edit form is shown
  useEffect(() => {
    if (clientProfile) {
      setFormData({
        gender: clientProfile.gender as Gender | undefined,
        age: clientProfile.age || undefined,
        height: clientProfile.height || undefined,
        weight: clientProfile.weight || undefined,
        bustSize: clientProfile.bust_size || undefined
      });
    }
  }, [clientProfile, showEditForm]); // Added showEditForm dependency

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
    updateUserProfile({ profile_photo_url: url });
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const profileData = {
        gender: formData.gender,
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        bust_size: formData.bustSize
      };

      const { error } = await updateProfile(profileData);
      
      if (error) {
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la mise à jour de vos informations.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Informations mises à jour",
          description: "Vos informations ont été mises à jour avec succès!",
        });
        setShowEditForm(false);
        refetchClientProfile();
        refetchUserProfile();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Informations</CardTitle>
        <CardDescription>
          Détails utilisés pour générer votre silhouette
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showEditForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Genre</Label>
              <RadioGroup 
                value={formData.gender || ""}
                onValueChange={(value: Gender) => updateFormData("gender", value)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="homme" id="edit-homme" />
                  <Label htmlFor="edit-homme">Homme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="femme" id="edit-femme" />
                  <Label htmlFor="edit-femme">Femme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="autre" id="edit-autre" />
                  <Label htmlFor="edit-autre">Autre / Je préfère ne pas préciser</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-age">Âge</Label>
              <Input
                id="edit-age"
                type="number"
                min="18"
                max="120"
                value={formData.age || ""}
                onChange={(e) => updateFormData("age", parseInt(e.target.value) || undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-height">Taille (cm)</Label>
              <Input
                id="edit-height"
                type="number"
                min="120"
                max="250"
                value={formData.height || ""}
                onChange={(e) => updateFormData("height", parseInt(e.target.value) || undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-weight">Poids (kg)</Label>
              <Input
                id="edit-weight"
                type="number"
                min="30"
                max="250"
                value={formData.weight || ""}
                onChange={(e) => updateFormData("weight", parseInt(e.target.value) || undefined)}
              />
            </div>

            {formData.gender === "femme" && (
              <div className="space-y-2">
                <Label htmlFor="edit-bustSize">Tour de poitrine (cm)</Label>
                <Input
                  id="edit-bustSize"
                  type="number"
                  min="60"
                  max="150"
                  value={formData.bustSize || ""}
                  onChange={(e) => updateFormData("bustSize", parseInt(e.target.value) || undefined)}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditForm(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
                className="flex-1 btn-primary"
              >
                {isLoading ? "Mise à jour..." : "Sauvegarder"}
              </Button>
            </div>
          </form>
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
  );
}
