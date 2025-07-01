import { useState, useEffect, useRef } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClothingItem, useClothingItems } from "@/hooks/useClothingItems";
import { NotepadText, Plus } from "lucide-react";
import { DraggableClothingItem } from "@/components/consultant/DraggableClothingItem";
import { ClothingItemModal } from "@/components/shared/ClothingItemModal";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import { getImageDimensions, calculateOptimalSize } from "@/utils/imageLoadUtils";

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

interface PlacedClothingItem {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

const categoryTranslations: { [key: string]: string } = {
  all: "Tous",
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

const OutfitCreator = () => {
  const { clientId } = useParams();
  const { client } = useOutletContext<{ client: ClientData }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createItem } = useClothingItems();

  const [clientClothes, setClientClothes] = useState<ClothingItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<ClothingItem[]>([]);
  const [placedItems, setPlacedItems] = useState<PlacedClothingItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("wardrobe");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [containerBounds, setContainerBounds] = useState({ width: 0, height: 0 });
  const [containerReady, setContainerReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientId || !user) return;
    fetchClientClothes();
    fetchCatalogItems();
  }, [clientId, user]);

  useEffect(() => {
    // Update container bounds when canvas is ready
    const updateBounds = () => {
      if (canvasRef.current) {
        const bounds = canvasRef.current.getBoundingClientRect();
        const newBounds = { width: bounds.width, height: bounds.height };

        // Only set containerReady to true if bounds are actually valid
        const isValid = newBounds.width > 0 && newBounds.height > 0;

        setContainerBounds(newBounds);
        setContainerReady(isValid);
      }
    };

    // Use multiple attempts to ensure proper measurement
    const timeoutId1 = setTimeout(updateBounds, 100);
    const timeoutId2 = setTimeout(updateBounds, 300);
    const timeoutId3 = setTimeout(updateBounds, 500);

    // Update on resize
    window.addEventListener('resize', updateBounds);

    // Cleanup
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      window.removeEventListener('resize', updateBounds);
    };
  }, []);

  const fetchClientClothes = async () => {
    if (!clientId) return;

    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientClothes((data || []) as ClothingItem[]);
    } catch (error) {
      console.error('Error fetching client clothes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la garde-robe du client",
        variant: "destructive",
      });
    }
  };

  const fetchCatalogItems = async () => {
    if (!clientId || !user) return;

    try {
      // Fetch clothing items from consultant that are linked to this client
      const { data, error } = await supabase
        .from('client_clothing_items')
        .select(`
          clothing_item_id,
          clothing_items (*)
        `)
        .eq('client_id', clientId)
        .order('created_at', {ascending: false});

      if (error) throw error;

      const items = data?.map(item => item.clothing_items).filter(Boolean) || [];
      setCatalogItems(items as ClothingItem[]);
    } catch (error) {
      console.error('Error fetching catalog items:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le catalogue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemCreated = async (itemData: Omit<ClothingItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user || !clientId) return;

    try {
      // First, create the clothing item using useClothingItems.createItem
      const result = await createItem(itemData);

      if (result.error) {
        throw new Error('Failed to create clothing item');
      }

      const newItem = result.data as ClothingItem;

      // Add the new item to catalog items state
      setCatalogItems(prev => [newItem, ...prev]);

      // Link the new item to the client
      await supabase
        .from('client_clothing_items')
        .insert({
          client_id: clientId,
          clothing_item_id: newItem.id
        });

      toast({
        title: "Succès",
        description: "Vêtement ajouté au catalogue et lié au client",
      });
    } catch (error) {
      console.error('Error creating item for client:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le vêtement au catalogue",
        variant: "destructive",
      });
    }
  };

  const getDefaultPosition = (category: string, containerBounds: { width: number; height: number }, itemSize: { width: number; height: number }): { x: number; y: number } => {
    // Wait for container to be ready
    if (!containerReady || containerBounds.width === 0 || containerBounds.height === 0) {
      return { x: 100, y: 100 };
    }

    const silhouetteWidth = Math.min(containerBounds.width * 0.4, 200);
    const centerX = containerBounds.width / 2;
    const centerY = containerBounds.height / 2;

    // Center the item properly by subtracting half of its dimensions
    const positions: { [key: string]: { x: number; y: number } } = {
      top: { x: centerX - itemSize.width / 2, y: centerY - 150 },
      bottom: { x: centerX - itemSize.width / 2, y: centerY - 20 },
      one_piece: { x: centerX - itemSize.width / 2, y: centerY - 120 },
      shoes: { x: centerX - itemSize.width / 2, y: centerY + 120 },
      outerwear: { x: centerX - silhouetteWidth / 2 - 60, y: centerY - 80 },
      accessory: { x: centerX + silhouetteWidth / 2 + 20, y: centerY - 80 }
    };

    return positions[category] || { x: centerX - itemSize.width / 2, y: centerY - itemSize.height / 2 };
  };

  const getDefaultSize = async (imageUrl: string): Promise<{ width: number; height: number }> => {
    try {
      const dimensions = await getImageDimensions(imageUrl);
      const optimalSize = calculateOptimalSize(dimensions.width, dimensions.height, 120);
      return optimalSize;
    } catch (error) {
      console.error('Failed to get image dimensions:', error);
      return { width: 120, height: 120 }; // Fallback
    }
  };

  const handleItemSelect = async (itemId: string) => {
    const allItems = [...clientClothes, ...catalogItems];
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    const isAlreadyPlaced = placedItems.some(p => p.id === itemId);

    if (isAlreadyPlaced) {
      setPlacedItems(prev => prev.filter(p => p.id !== itemId));
      setSelectedItemId(null);
    } else {
      // Check if container is ready before adding items
      if (!containerReady || containerBounds.width === 0 || containerBounds.height === 0) {
        // Retry after a short delay, but don't spam retries
        setTimeout(() => {
          if (containerReady && containerBounds.width > 0 && containerBounds.height > 0) {
            handleItemSelect(itemId);
          }
        }, 200);
        return;
      }

      const imageUrl = getOptimizedImageUrl(item.enhanced_image_url || item.image_url, 400);
      const size = await getDefaultSize(imageUrl);
      const position = getDefaultPosition(item.category, containerBounds, size);

      const newPlacedItem: PlacedClothingItem = {
        id: itemId,
        position,
        size,
        zIndex: nextZIndex
      };

      setPlacedItems(prev => [...prev, newPlacedItem]);
      setSelectedItemId(itemId);
      setNextZIndex(prev => prev + 1);
    }
  };

  const handleItemPositionChange = (itemId: string, position: { x: number; y: number }) => {
    setPlacedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, position } : item
      )
    );
  };

  const handleItemSizeChange = (itemId: string, size: { width: number; height: number }) => {
    setPlacedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, size } : item
      )
    );
  };

  const handleItemSelection = (itemId: string) => {
    setSelectedItemId(itemId);
    // Bring selected item to front
    setPlacedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, zIndex: nextZIndex } : item
      )
    );
    setNextZIndex(prev => prev + 1);
  };

  const handleItemRemove = (itemId: string) => {
    setPlacedItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItemId(null);
  };

  const handleCanvasClick = () => {
    setSelectedItemId(null);
  };

  const handleSaveOutfit = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Succès",
        description: "Tenue enregistrée et partagée avec le client!",
      });
      setPlacedItems([]);
      setComments("");
      setSelectedItemId(null);
    }, 1500);
  };

  const getCurrentItems = () => {
    if (activeTab === "wardrobe") {
      return clientClothes;
    } else {
      return catalogItems;
    }
  };

  const allItems = [...clientClothes, ...catalogItems];
  const filteredItems = getCurrentItems().filter(
    item => categoryFilter === "all" || item.category === categoryFilter
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy"></div>
      </div>
    );
  }

  const silhouetteImage = client.gender === "homme"
    ? "/looks/m-look-0.png"
    : "/looks/look-0.png";

  return (
    <div className="flex min-h-screen gap-6 overflow-hidden">
      {/* Left Panel: Silhouette - 50% width */}
      <div className="w-1/2 flex flex-col overflow-y-auto">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Silhouette du Client</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <div className="w-full mx-auto">
              <div
                className="relative bg-gray-200 rounded-md flex items-center justify-center overflow-hidden"
                style={{ aspectRatio: '1 / 1' }}
                ref={canvasRef}
                onClick={handleCanvasClick}
              >
                {/* Silhouette */}
                <img
                  src={silhouetteImage}
                  alt="Silhouette du client"
                  className="absolute opacity-30 h-4/5 w-auto object-contain"
                  style={{ pointerEvents: 'none' }}
                />

                {/* Placed clothing items */}
                {placedItems.map(placedItem => {
                  const item = allItems.find(i => i.id === placedItem.id);
                  if (!item) return null;

                  const imageUrl = getOptimizedImageUrl(item.enhanced_image_url || item.image_url, 400);

                  return (
                    <DraggableClothingItem
                      key={placedItem.id}
                      id={placedItem.id}
                      imageUrl={imageUrl}
                      category={item.category}
                      position={placedItem.position}
                      size={placedItem.size}
                      isSelected={selectedItemId === placedItem.id}
                      zIndex={placedItem.zIndex}
                      onPositionChange={handleItemPositionChange}
                      onSizeChange={handleItemSizeChange}
                      onSelect={handleItemSelection}
                      onRemove={handleItemRemove}
                      containerBounds={containerBounds}
                    />
                  );
                })}

                {/* Instructions overlay */}
                {placedItems.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black bg-opacity-50 text-white p-4 rounded-lg text-center">
                      <p className="text-sm">Sélectionnez des vêtements</p>
                      <p className="text-sm">pour les ajouter à la silhouette</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom controls */}
            <div className="flex-shrink-0 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Commentaires sur la tenue</h3>
                <Textarea
                  placeholder="Ajoutez vos commentaires et conseils pour le client..."
                  className="min-h-[80px]"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>

              {/* Usage tips - always visible */}
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700 font-medium">💡 Conseils d'utilisation:</p>
                <ul className="text-xs text-blue-600 mt-1 space-y-1">
                  <li>• Cliquez et glissez pour déplacer les vêtements</li>
                  <li>• Utilisez les carrés aux coins pour redimensionner</li>
                  <li>• Double-cliquez pour retirer un vêtement</li>
                  <li>• Cliquez sur un vêtement pour le sélectionner</li>
                </ul>
              </div>

              <Button
                className="btn-primary w-full"
                onClick={handleSaveOutfit}
                disabled={placedItems.length === 0 || isSaving}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer et partager"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Clothing Selection - 50% width */}
      <div className="w-1/2 min-h-0">
        <Card className="h-full flex flex-col min-h-0">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Sélection des Vêtements</CardTitle>
            <div className="flex gap-4 items-center">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryTranslations).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="wardrobe">Garde-robe</TabsTrigger>
                <TabsTrigger value="catalog">Catalogue</TabsTrigger>
              </TabsList>

              <TabsContent value="wardrobe" className="flex-1 mt-4 min-h-0">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      Aucun vêtement trouvé dans la garde-robe
                      {categoryFilter !== "all" && ` de type "${categoryTranslations[categoryFilter]}"`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredItems.map((item) => {
                      const isPlaced = placedItems.some(p => p.id === item.id);
                      const optimizedUrl = getOptimizedImageUrl(item.enhanced_image_url || item.image_url, 400);

                      return (
                        <div key={item.id} className="space-y-2">
                          <div
                            className={`aspect-square rounded-md border-2 p-1 flex items-center justify-center overflow-hidden cursor-pointer transition-all bg-white relative ${isPlaced
                              ? 'border-bibabop-lightpink shadow-lg ring-2 ring-bibabop-lightpink/20'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                              }`}
                            onClick={() => handleItemSelect(item.id)}
                          >
                            <img
                              src={optimizedUrl}
                              alt={`${colorTranslations[item.color]} ${categoryTranslations[item.category]}`}
                              className="max-w-full max-h-full object-contain"
                              loading="lazy"
                            />
                            {isPlaced && (
                              <div className="absolute top-1 right-1 bg-bibabop-pink text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                ✓
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              {categoryTranslations[item.category]} · {colorTranslations[item.color]} · {seasonTranslations[item.season]}
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="catalog" className="flex-1 mt-4 min-h-0">
                <div className="grid grid-cols-3 gap-4">
                  {/* Add new item card */}
                  <div
                    className="aspect-square rounded-md border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-bibabop-pink hover:bg-gray-50"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 text-center">Ajouter un nouveau vêtement</span>
                  </div>

                  {/* Catalog items */}
                  {filteredItems.map((item) => {
                    const isPlaced = placedItems.some(p => p.id === item.id);
                    const optimizedUrl = getOptimizedImageUrl(item.enhanced_image_url || item.image_url, 400);

                    return (
                      <div key={item.id} className="space-y-2">
                        <div
                          className={`aspect-square rounded-md border-2 p-1 flex items-center justify-center overflow-hidden cursor-pointer transition-all bg-white relative ${isPlaced
                            ? 'border-bibabop-lightpink shadow-lg ring-2 ring-bibabop-lightpink/20'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                          onClick={() => handleItemSelect(item.id)}
                        >
                          <img
                            src={optimizedUrl}
                            alt={`${colorTranslations[item.color]} ${categoryTranslations[item.category]}`}
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
                          />
                          {isPlaced && (
                            <div className="absolute top-1 right-1 bg-bibabop-pink text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                              ✓
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            {categoryTranslations[item.category]} · {colorTranslations[item.color]} · {seasonTranslations[item.season]}
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
                      </div>
                    );
                  })}
                </div>
                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      Aucun vêtement trouvé dans le catalogue
                      {categoryFilter !== "all" && ` de type "${categoryTranslations[categoryFilter]}"`}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Clothing Item Modal */}
      <ClothingItemModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleItemCreated}
      />
    </div>
  );
};

export default OutfitCreator;
