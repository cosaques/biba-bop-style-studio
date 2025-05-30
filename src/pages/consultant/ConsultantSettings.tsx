
import { ProfileUpdateForm } from "@/components/client/settings/ProfileUpdateForm";
import { PasswordChangeForm } from "@/components/client/settings/PasswordChangeForm";
import { AccountDeletionForm } from "@/components/client/settings/AccountDeletionForm";
import { ProfilePhotoUpload } from "@/components/shared/ProfilePhotoUpload";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function ConsultantSettings() {
  const { profile: userProfile, updateProfile: updateUserProfile } = useUserProfile();

  const handlePhotoUpdate = (url: string | null) => {
    updateUserProfile({ profile_photo_url: url });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bibabop-navy">Paramètres</h1>
          <p className="subtitle">Modifiez vos paramètres de compte</p>
        </div>

        <div className="space-y-6">
          {/* Photo de profil section */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Photo de profil</h2>
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
            <div className="flex justify-center">
              <ProfilePhotoUpload
                currentPhotoUrl={userProfile?.profile_photo_url}
                onPhotoUpdate={handlePhotoUpdate}
                className="text-sm"
              />
            </div>
          </div>

          <ProfileUpdateForm />
          <PasswordChangeForm />
          <AccountDeletionForm />
        </div>
      </div>
    </div>
  );
}
