
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { ClothingItem } from "@/hooks/useClothingItems";
import { Outfit } from "@/hooks/useOutfits";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import { NotepadText, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientOutfitDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfit: Outfit | null;
  consultantName: string;
  consultantAvatar?: string;
}

const categoryTranslations: { [key: string]: string } = {
  top: "Haut",
  bottom: "Bas",
  one_piece: "Une pièce",
  shoes: "Chaussures",
  outerwear: "Outerwear",
  accessory: "Accessoire"
};

const colorTranslations: { [key: string]: string } = {
  black: "Noir",
  grey: "Gris",
  white: "Blanc",
  beige: "Beige",
  brown: "Marron",
  pink: "Rose",
  red: "Rouge",
  orange: "Orange",
  yellow: "Jaune",
  green: "Vert",
  blue: "Bleu",
  purple: "Violet",
  other: "Autre"
};

const seasonTranslations: { [key: string]: string } = {
  all: "Toute saison",
  spring: "Printemps",
  summer: "Été",
  autumn: "Automne",
  winter: "Hiver"
};

const FullscreenImageModal = ({
  open,
  onOpenChange,
  imageUrl,
  alt
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  alt: string;
}) => {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 m-0 p-0 bg-black bg-opacity-90 flex items-center justify-center z-[10000]"
      onPointerDownCapture={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onOpenChange(false)
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onOpenChange(false)
        }}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
      >
        <X className="h-8 w-8" />
      </button>
      <img
        src={imageUrl}
        alt={alt}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  );
};

export const ClientOutfitDetailsModal = ({ 
  open, 
  onOpenChange, 
  outfit, 
  consultantName, 
  consultantAvatar 
}: ClientOutfitDetailsModalProps) => {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [clientItems, setClientItems] = useState<ClothingItem[]>([]);
  const [consultantItems, setConsultantItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fullscreenImageOpen, setFullscreenImageOpen] = useState(false);

  useEffect(() => {
    if (outfit) {
      fetchOutfitClothingItems();
    }
  }, [outfit]);

  const fetchOutfitClothingItems = async () => {
    if (!outfit) return;

    setLoading(true);
    try {
      const { data: outfitItems, error } = await supabase
        .from('outfit_clothing_items')
        .select(`
          clothing_item_id,
          clothing_items (*)
        `)
        .eq('outfit_id', outfit.id);

      if (error) throw error;

      const items = outfitItems?.map(item => item.clothing_items).filter(Boolean) || [];
      setClothingItems(items as ClothingItem[]);

      // Separate client items from consultant items
      const clientItemsList: ClothingItem[] = [];
      const consultantItemsList: ClothingItem[] = [];

      for (const item of items as ClothingItem[]) {
        if (item.user_id === outfit.client_id) {
          clientItemsList.push(item);
        } else {
          consultantItemsList.push(item);
        }
      }

      setClientItems(clientItemsList);
      setConsultantItems(consultantItemsList);
    } catch (error) {
      console.error('Error fetching outfit clothing items:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderClothingItemsList = (items: ClothingItem[], title: string) => {
    if (items.length === 0) return null;

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {items.map((item) => {
              const optimizedUrl = getOptimizedImageUrl(item.enhanced_image_url || item.image_url, 400);

              return (
                <div key={item.id} className="flex items-center space-x-3 p-2 border rounded-md">
                  <div className="w-12 h-12 flex-shrink-0">
                    <img
                      src={optimizedUrl}
                      alt={`${colorTranslations[item.color]} ${categoryTranslations[item.category]}`}
                      className="w-full h-full object-contain rounded"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {categoryTranslations[item.category]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {colorTranslations[item.color]} · {seasonTranslations[item.season]}
                    </div>
                  </div>
                  {item.notes && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                          <NotepadText className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium text-xs">Notes</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.notes}</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!outfit) return null;

  const optimizedOutfitImageUrl = getOptimizedImageUrl(outfit.image_url, 400);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la tenue</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Outfit Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{outfit.name}</h2>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  {consultantAvatar ? (
                    <AvatarImage src={consultantAvatar} alt={consultantName} />
                  ) : (
                    <AvatarFallback>
                      {consultantName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Créée par {consultantName}</p>
                  <p className="text-xs text-gray-500">
                    Le {format(new Date(outfit.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            </div>

            {/* Outfit Image */}
            <div className="flex justify-center">
              <div className="w-64 h-64 border rounded-md overflow-hidden bg-gray-50 cursor-zoom-in" onClick={() => setFullscreenImageOpen(true)}>
                <img
                  src={optimizedOutfitImageUrl}
                  alt={outfit.name}
                  className="w-full h-full object-contain hover:opacity-90 transition-opacity cursor-zoom-in"
                />
              </div>
            </div>

            {/* Comments */}
            {outfit.comments && (
              <div className="mt-4 p-3 bg-bibabop-lightgrey rounded-md">
                <p className="text-sm">{outfit.comments}</p>
              </div>
            )}

            {/* Clothing Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Vêtements utilisés</h3>

              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bibabop-navy mx-auto"></div>
                </div>
              ) : (
                <>
                  {renderClothingItemsList(clientItems, "Votre garde-robe")}
                  {renderClothingItemsList(consultantItems, "Propositions du consultant")}

                  {clothingItems.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Aucun vêtement trouvé pour cette tenue
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FullscreenImageModal
        open={fullscreenImageOpen}
        onOpenChange={setFullscreenImageOpen}
        imageUrl={outfit.image_url}
        alt={outfit.name}
      />
    </>
  );
};
