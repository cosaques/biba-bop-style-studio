
import { ClientSettings } from "@/components/client/ClientSettings";

export default function ClientSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bibabop-navy">Paramètres</h1>
          <p className="subtitle">Modifiez vos paramètres de compte</p>
        </div>
        <ClientSettings />
      </div>
    </div>
  );
}
