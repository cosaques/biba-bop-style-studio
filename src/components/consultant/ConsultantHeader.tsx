
import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";

export function ConsultantHeader() {
  const { profile } = useUserProfile();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="Biba-Bop Logo"
            className="h-10 mr-2"
          />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {profile?.first_name && (
          <span className="text-sm font-medium">
            Bonjour, {profile.first_name}
          </span>
        )}
        {profile?.profile_photo_url && (
          <img
            src={profile.profile_photo_url}
            alt="Photo de profil"
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
      </div>
    </header>
  );
}
