import { useState } from "react";
import { useOutletContext, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useOutfits } from "@/hooks/useOutfits";
import { EditOutfitModal } from "@/components/consultant/EditOutfitModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientData {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_photo_url?: string;
  age?: number;
  height?: number;
  weight?: number;
  bust_size?: number;
  gender?: string;
}

interface ContextType {
  client: ClientData;
}

const ClientOutfits = () => {
  const { client } = useOutletContext<ContextType>();
  const { clientId } = useParams();
  const { outfits, loading, updateOutfit, deleteOutfit } = useOutfits();
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter outfits for the current client
  const clientOutfits = outfits.filter(outfit => outfit.client_id === clientId);

  const handleEditOutfit = (outfit) => {
    setSelectedOutfit(outfit);
    setIsEditModalOpen(true);
  };

  const handleDeleteOutfit = async (outfit) => {
    await deleteOutfit(outfit.id, outfit.image_url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tenues créées</CardTitle>
          <CardDescription>
            Liste des tenues créées pour ce client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* New Outfit Creation Card */}
            <Card className="border-dashed border-2 hover:bg-muted/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-8 px-4">
                <div className="w-12 h-12 rounded-full bg-bibabop-navy flex items-center justify-center text-white mb-4">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">Nouvelle Tenue</h3>
                <p className="text-muted-foreground text-center text-sm mb-4">
                  Créez une nouvelle tenue pour ce client
                </p>
                <Button asChild className="btn-primary">
                  <Link to={`/consultant/client/${clientId}/outfits/create`}>
                    Créer une tenue
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Existing Outfits */}
            {clientOutfits.map((outfit) => (
              <Card key={outfit.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="aspect-square rounded-md overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={outfit.image_url}
                      alt={outfit.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{outfit.name}</CardTitle>
                  <CardDescription className="text-sm">
                    Créée le {format(new Date(outfit.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditOutfit(outfit)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la tenue</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer la tenue "{outfit.name}" ? 
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteOutfit(outfit)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {clientOutfits.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>Aucune tenue créée pour le moment</p>
                <p className="text-sm mt-2">Commencez par créer votre première tenue pour ce client</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Outfit Modal */}
      <EditOutfitModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        outfit={selectedOutfit}
        onSave={updateOutfit}
      />
    </div>
  );
};

export default ClientOutfits;
