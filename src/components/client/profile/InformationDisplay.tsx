
import { useClientProfile } from "@/hooks/useClientProfile";

export function InformationDisplay() {
  const { profile: clientProfile } = useClientProfile();

  const renderGenderDisplay = (gender?: string | null) => {
    if (!gender) return "Non renseigné";

    switch(gender) {
      case "homme": return "Homme";
      case "femme": return "Femme";
      case "autre": return "Autre";
      default: return "Non renseigné";
    }
  };

  return (
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
  );
}
