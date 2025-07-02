
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import { ClientOutfitDetailsModal } from "@/components/client/ClientOutfitDetailsModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface OutfitWithConsultant {
  id: string;
  name: string;
  comments?: string;
  image_url: string;
  client_id: string;
  consultant_id: string;
  created_at: string;
  updated_at: string;
  consultant_name: string;
  consultant_avatar?: string;
}

export default function ClientOutfits() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [outfits, setOutfits] = useState<OutfitWithConsultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitWithConsultant | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClientOutfits();
    }
  }, [user]);

  const fetchClientOutfits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('outfits')
        .select(`
          *,
          consultant:profiles!consultant_id (
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const outfitsWithConsultant = data?.map(outfit => ({
        ...outfit,
        consultant_name: `${outfit.consultant.first_name || ''} ${outfit.consultant.last_name || ''}`.trim() || 'Consultant',
        consultant_avatar: outfit.consultant.profile_photo_url
      })) || [];

      setOutfits(outfitsWithConsultant);
    } catch (error) {
      console.error('Error fetching client outfits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOutfits = outfits.filter(outfit =>
    outfit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outfit.consultant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (outfit: OutfitWithConsultant) => {
    setSelectedOutfit(outfit);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-bibabop-navy">Mes Tenues</h1>
            <p className="subtitle">Découvrez vos tenues créées par votre conseiller</p>
          </div>
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bibabop-navy">Mes Tenues</h1>
          <p className="subtitle">Découvrez vos tenues créées par votre conseiller</p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher une tenue ou un conseiller..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredOutfits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "Aucune tenue trouvée pour cette recherche" : "Aucune tenue créée pour le moment"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredOutfits.map((outfit) => {
                const optimizedImageUrl = getOptimizedImageUrl(outfit.image_url, 600);

                return (
                  <Card key={outfit.id} className="card-hover">
                    <CardHeader>
                      <CardTitle>{outfit.name}</CardTitle>
                      <CardDescription>
                        Créé le {format(new Date(outfit.created_at), 'dd MMMM yyyy', { locale: fr })} par {outfit.consultant_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 rounded-md overflow-hidden bg-muted">
                        <img
                          src={optimizedImageUrl}
                          alt={outfit.name}
                          className="w-full object-cover"
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewDetails(outfit)}
                      >
                        Voir les détails
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ClientOutfitDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        outfit={selectedOutfit}
        consultantName={selectedOutfit?.consultant_name || ''}
        consultantAvatar={selectedOutfit?.consultant_avatar}
      />
    </div>
  );
}
