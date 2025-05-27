
import { Button } from "@/components/ui/button";
import {
  Home,
  Settings,
  LogOut,
  Shirt,
  Image
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ClientSidebarProps {
  onSectionChange?: (section: string) => void;
  activeSection?: string;
}

export function ClientSidebar({ onSectionChange, activeSection }: ClientSidebarProps) {
  const { signOut } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
  };

  const handleSectionClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  const isActive = (section: string) => {
    return activeSection === section;
  };

  return (
    <div className="hidden md:flex w-64 flex-col border-r bg-bibabop-pink text-white">
      <div className="p-6">
        <p className="text-sm text-white/70">Portail Client</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <Button 
          variant="ghost" 
          className={`w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80 ${
            isActive('silhouette') ? 'bg-white/20' : ''
          }`}
          onClick={() => handleSectionClick('silhouette')}
        >
          <Home className="mr-2 h-5 w-5" />
          Accueil
        </Button>

        <Button 
          variant="ghost" 
          className={`w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80 ${
            isActive('outfits') ? 'bg-white/20' : ''
          }`}
          onClick={() => handleSectionClick('outfits')}
        >
          <Image className="mr-2 h-5 w-5" />
          Mes Tenues
        </Button>

        <Button 
          variant="ghost" 
          className={`w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80 ${
            isActive('wardrobe') ? 'bg-white/20' : ''
          }`}
          onClick={() => handleSectionClick('wardrobe')}
        >
          <Shirt className="mr-2 h-5 w-5" />
          Ma Garde-robe
        </Button>

        <Button 
          variant="ghost" 
          className={`w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80 ${
            isActive('settings') ? 'bg-white/20' : ''
          }`}
          onClick={() => handleSectionClick('settings')}
        >
          <Settings className="mr-2 h-5 w-5" />
          Paramètres
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Déconnexion
        </Button>
      </nav>
    </div>
  );
}
