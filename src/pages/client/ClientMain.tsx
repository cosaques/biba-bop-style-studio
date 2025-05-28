
import { ClientSilhouette } from "@/components/client/ClientSilhouette";
import { ClientInformations } from "@/components/client/ClientInformations";

export default function ClientMain() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bibabop-navy">Mon espace personnel</h1>
          <p className="subtitle">Gérez votre silhouette, votre garde-robe et suivez les conseils de votre conseiller</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ClientSilhouette />
          <ClientInformations />
        </div>
      </div>
    </div>
  );
}
