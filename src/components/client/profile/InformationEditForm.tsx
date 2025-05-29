
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Gender } from "@/types";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";

interface InformationEditFormProps {
  onCancel: () => void;
}

export function InformationEditForm({ onCancel }: InformationEditFormProps) {
  const { profile: clientProfile, updateProfile, refetch: refetchClientProfile } = useClientProfile();
  const { refetch: refetchUserProfile } = useUserProfile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    gender: clientProfile?.gender as Gender | undefined,
    age: clientProfile?.age || undefined,
    height: clientProfile?.height || undefined,
    weight: clientProfile?.weight || undefined,
    bustSize: clientProfile?.bust_size || undefined
  });

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
  }, [clientProfile]);

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
        onCancel();
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

  return (
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
          onClick={onCancel}
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
  );
}
