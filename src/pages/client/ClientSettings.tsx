
import { ProfileUpdateForm } from "@/components/shared/settings/ProfileUpdateForm";
import { PasswordChangeForm } from "@/components/shared/settings/PasswordChangeForm";
import { AccountDeletionForm } from "@/components/shared/settings/AccountDeletionForm";
import { PhotoSection } from "@/components/client/profile/PhotoSection";

export default function ClientSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bibabop-navy">Paramètres</h1>
          <p className="subtitle">Modifiez vos paramètres de compte</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Photo de profil</h2>
            <PhotoSection />
          </div>
          <ProfileUpdateForm />
          <PasswordChangeForm />
          <AccountDeletionForm />
        </div>
      </div>
    </div>
  );
}
