
import { ClientSilhouette } from "@/components/client/ClientSilhouette";
import { ClientInformations } from "@/components/client/ClientInformations";
import { useClientProfile } from "@/hooks/useClientProfile";

export default function ClientMain() {
  const { profile } = useClientProfile();

  return (
    <div className="h-full bg-background overflow-auto">
      <div className="p-6 h-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bibabop-navy">Mon espace personnel</h1>
          <p className="subtitle">Gérez votre silhouette, votre garde-robe et suivez les conseils de votre conseiller</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 h-[calc(100%-8rem)]">
          <ClientSilhouette/>
          <ClientInformations />
        </div>
      </div>
    </div>
  );
}
