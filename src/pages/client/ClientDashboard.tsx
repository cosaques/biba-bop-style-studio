
import { useState } from "react";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import { ClientHeader } from "@/components/client/ClientHeader";
import { ClientSettings } from "@/components/client/ClientSettings";
import { SilhouetteSection } from "@/components/client/sections/SilhouetteSection";
import { OutfitsSection } from "@/components/client/sections/OutfitsSection";
import { WardrobeSection } from "@/components/client/sections/WardrobeSection";

const ClientDashboard = () => {
  const [activeSection, setActiveSection] = useState("silhouette");

  const renderContent = () => {
    switch (activeSection) {
      case "silhouette":
        return <SilhouetteSection />;
      case "outfits":
        return <OutfitsSection />;
      case "wardrobe":
        return <WardrobeSection />;
      case "settings":
        return <ClientSettings />;
      default:
        return <SilhouetteSection />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "silhouette":
        return "Mon espace personnel";
      case "outfits":
        return "Mes Tenues";
      case "wardrobe":
        return "Ma Garde-robe";
      case "settings":
        return "Paramètres";
      default:
        return "Mon espace personnel";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <ClientSidebar
        onSectionChange={setActiveSection}
        activeSection={activeSection}
      />

      <div className="flex-1">
        <ClientHeader />

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-bibabop-navy">{getSectionTitle()}</h1>
            <p className="subtitle">
              {activeSection === "silhouette" && "Gérez votre silhouette, votre garde-robe et suivez les conseils de votre conseiller"}
              {activeSection === "outfits" && "Découvrez vos tenues créées par votre conseiller"}
              {activeSection === "wardrobe" && "Gérez votre garde-robe personnelle"}
              {activeSection === "settings" && "Modifiez vos paramètres de compte"}
            </p>
          </div>

          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
