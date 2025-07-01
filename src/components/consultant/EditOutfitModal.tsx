
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ClothingItem } from "@/hooks/useClothingItems";
import { Outfit } from "@/hooks/useOutfits";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import { NotepadText, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditOutfitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfit: Outfit | null;
  onSave: (outfitId: string, name: string, comments: string) => Promise<{ success: boolean }>;
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

export const EditOutfitModal = ({ open, onOpenChange, outfit, onSave }: EditOutfitModalProps) => {
  const [name, setName] = useState("");
  const [comments, setComments] = useState("");
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [clientItems, setClientItems] = useState<ClothingItem[]>([]);
  const [consultantItems, setConsultantItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullscreenImageOpen, setFullscreenImageOpen] = useState(false);

  useEffect(() => {
    if (outfit) {
      setName(outfit.name);
      setComments(outfit.comments || "");
      fetchOutfitClothingItems();
    }
  }, [outfit]);

  const fetchOutfitClothingItems = async () => {
    if (!outfit) return;

    setLoading(true);
    try {
      // Get outfit clothing items with full clothing item details
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

  const handleSave = async () => {
    if (!outfit || !name.trim()) return;

    setIsSaving(true);
    const result = await onSave(outfit.id, name.trim(), comments.trim());

    if (result.success) {
      onOpenChange(false);
    }
    setIsSaving(false);
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
            <DialogTitle>Modifier la tenue</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Outfit Image */}
            <div className="flex justify-center">
              <div
                className="w-64 h-64 border rounded-md overflow-hidden bg-gray-50 cursor-zoom-in"
                onClick={() => setFullscreenImageOpen(true)}
              >
                <img
                  src={optimizedOutfitImageUrl}
                  alt={outfit.name}
                  className="w-full h-full object-contain hover:opacity-90 transition-opacity cursor-zoom-in"
                />
              </div>
            </div>

            {/* Outfit Name */}
            <div>
              <Label htmlFor="outfit-name">Nom de la tenue *</Label>
              <Input
                id="outfit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom de la tenue"
                className="mt-1"
              />
            </div>

            {/* Comments */}
            <div>
              <Label htmlFor="comments">Commentaires</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Commentaires sur la tenue..."
                className="mt-1 min-h-[80px]"
              />
            </div>

            {/* Clothing Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Vêtements utilisés</h3>

              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bibabop-navy mx-auto"></div>
                </div>
              ) : (
                <>
                  {renderClothingItemsList(clientItems, "Garde-robe du client")}
                  {renderClothingItemsList(consultantItems, "Propositions du consultant")}

                  {clothingItems.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Aucun vêtement trouvé pour cette tenue
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={!name.trim() || isSaving}
                className="btn-primary"
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
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
