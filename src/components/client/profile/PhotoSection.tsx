
import { ProfilePhotoUpload } from "@/components/shared/ProfilePhotoUpload";
import { useUserProfile } from "@/hooks/useUserProfile";

export function PhotoSection() {
  const { profile: userProfile, updateProfile: updateUserProfile } = useUserProfile();

  const handlePhotoUpdate = (url: string | null) => {
    updateUserProfile({ profile_photo_url: url });
  };

  return (
    <>
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

      <div className="flex justify-center mb-4">
        <ProfilePhotoUpload
          currentPhotoUrl={userProfile?.profile_photo_url}
          onPhotoUpdate={handlePhotoUpdate}
          className="text-sm"
        />
      </div>
    </>
  );
}
