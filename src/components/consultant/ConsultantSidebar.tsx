
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Layers, 
  ShoppingBag, 
  Calendar, 
  MessageSquare, 
  BarChart, 
  Settings, 
  LogOut 
} from "lucide-react";
import { Link } from "react-router-dom";

export function ConsultantSidebar() {
  return (
    <div className="hidden md:flex w-64 flex-col border-r bg-bibabop-pink text-white">
      <div className="p-6">
        <p className="text-sm text-white/70">Tableau de Bord Conseiller en Image</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <Link to="/consultant/dashboard">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <Home className="mr-2 h-5 w-5" />
            Accueil
          </Button>
        </Link>
        
        <Link to="/consultant/clients">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <Users className="mr-2 h-5 w-5" />
            Clients
          </Button>
        </Link>
        
        <Link to="/consultant/outfits">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <Layers className="mr-2 h-5 w-5" />
            Tenues
          </Button>
        </Link>
        
        <Link to="/consultant/wardrobe">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Catalogue
          </Button>
        </Link>
        
        <Link to="/consultant/appointments">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <Calendar className="mr-2 h-5 w-5" />
            Rendez-vous
          </Button>
        </Link>
        
        <Link to="/consultant/messages">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <MessageSquare className="mr-2 h-5 w-5" />
            Messages
          </Button>
        </Link>
        
        <Link to="/consultant/analytics">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-bibabop-pink hover:bg-opacity-80">
            <BarChart className="mr-2 h-5 w-5" />
            Analyses
          </Button>
        </Link>
      </nav>
      
      <div className="p-4 mt-auto border-t border-white border-opacity-30 space-y-2">
        <Link to="/consultant/settings">
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
