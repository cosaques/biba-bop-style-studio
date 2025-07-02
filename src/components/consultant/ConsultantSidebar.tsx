
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Settings,
  LogOut,
  MessageCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";

export function ConsultantSidebar() {
  const { signOut } = useAuth();
  const { getTotalUnreadCount } = useMessages();
  const location = useLocation();
  const unreadCount = getTotalUnreadCount();

  const handleLogout = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isMessagesActive = () => {
    return location.pathname.startsWith('/consultant/dashboard/messages');
  };

  return (
    <div className="hidden md:flex w-64 flex-col border-r bg-bibabop-pink text-white">
      <div className="p-6">
        <p className="text-sm text-white/70">Tableau de Bord Conseiller en Image</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="mb-1">
          <Link to="/consultant/dashboard">
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/20 hover:bg-opacity-80 ${
                isActive('/consultant/dashboard') ? 'bg-white/20' : ''
              }`}
            >
              <Home className="mr-2 h-5 w-5" />
              Accueil
            </Button>
          </Link>
        </div>

        <div className="mb-1">
          <Link to="/consultant/dashboard/messages">
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/20 hover:bg-opacity-80 ${
                isMessagesActive() ? 'bg-white/20' : ''
              }`}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Messages
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>

        <div className="mb-1">
          <Link to="/consultant/dashboard/settings">
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/20 hover:bg-opacity-80 ${
                isActive('/consultant/dashboard/settings') ? 'bg-white/20' : ''
              }`}
            >
              <Settings className="mr-2 h-5 w-5" />
              Paramètres
            </Button>
          </Link>
        </div>

        <div className="mb-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-white/20 hover:bg-opacity-80"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </nav>
    </div>
  );
}
