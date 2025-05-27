
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

export function ClientHeader() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img
            src="logo.png"
            alt="Biba-Bop Logo"
            className="h-10 mr-2"
          />
        </Link>
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
    </header>
  );
}
