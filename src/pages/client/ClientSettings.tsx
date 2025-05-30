
import { ProfileUpdateForm } from "@/components/shared/ProfileUpdateForm";
import { PasswordChangeForm } from "@/components/shared/PasswordChangeForm";
import { AccountDeletionForm } from "@/components/shared/AccountDeletionForm";

export default function ClientSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bibabop-navy">Paramètres</h1>
          <p className="subtitle">Modifiez vos paramètres de compte</p>
        </div>

        <div className="space-y-6">
          <ProfileUpdateForm />
          <PasswordChangeForm />
          <AccountDeletionForm />
        </div>
      </div>
    </div>
  );
}
