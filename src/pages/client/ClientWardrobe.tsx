
import WardrobeManager from "./WardrobeManager";

export default function ClientWardrobe() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bibabop-navy">Ma Garde-robe</h1>
          <p className="subtitle">Gérez votre garde-robe personnelle</p>
        </div>
        <WardrobeManager />
      </div>
    </div>
  );
}
