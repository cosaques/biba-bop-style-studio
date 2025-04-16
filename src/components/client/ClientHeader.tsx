
import { Button } from "@/components/ui/button";
import { Bell, User, Search } from "lucide-react";

export function ClientHeader() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/636147a5-71be-491d-9bc3-2309e49acecd.png" 
          alt="Biba-Bop Logo" 
          className="h-10 mr-2" 
        />
      </div>

      <div className="flex-1 md:flex md:justify-center md:w-1/3">
        <div className="relative w-full max-w-sm hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher..."
            className="w-full bg-background pl-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-9 rounded-md border border-input px-3 py-1"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-bibabop-pink rounded-full"></span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
