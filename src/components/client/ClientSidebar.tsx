
import { Button } from "@/components/ui/button";
import {
  Home,
  User,
  ShoppingBag,
  Heart,
  Calendar,
  MessageSquare,
  Settings,
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";

export function ClientSidebar() {
  return (
    <div className="hidden md:flex w-64 flex-col border-r bg-bibabop-pink text-white">
      <div className="p-6">
        <p className="text-sm text-white/70">Portail Client</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <Link to="/client/dashboard">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <Home className="mr-2 h-5 w-5" />
            Accueil
          </Button>
        </Link>

        <Link to="/client/profile">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <User className="mr-2 h-5 w-5" />
            Mon Profil
          </Button>
        </Link>

        <Link to="/client/wardrobe">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Ma Garde-robe
          </Button>
        </Link>

        <Link to="/client/outfits">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <Heart className="mr-2 h-5 w-5" />
            Mes Tenues
          </Button>
        </Link>

        <Link to="/client/appointments">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <Calendar className="mr-2 h-5 w-5" />
            Rendez-vous
          </Button>
        </Link>

        <Link to="/client/messages">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <MessageSquare className="mr-2 h-5 w-5" />
            Messages
          </Button>
        </Link>
      </nav>

      <div className="p-4 mt-auto border-t border-white border-opacity-30 space-y-2">
        <Link to="/client/settings">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <Settings className="mr-2 h-5 w-5" />
            Paramètres
          </Button>
        </Link>

        <Link to="/logout">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <LogOut className="mr-2 h-5 w-5" />
            Déconnexion
          </Button>
        </Link>
      </div>
    </div>
  );
}
