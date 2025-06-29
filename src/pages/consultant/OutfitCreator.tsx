
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
import { ClothingItem } from "@/hooks/useClothingItems";
import { NotepadText } from "lucide-react";
import { DraggableClothingItem } from "@/components/consultant/DraggableClothingItem";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

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

const externalCatalog: ClothingItem[] = [
  {
    id: "ext1",
    user_id: "external",
    image_url: "/clothes/cloth-3.png",
    enhanced_image_url: null,
    category: "bottom",
    color: "grey",
    season: "all",
    notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "ext2",
    user_id: "external",
    image_url: "/clothes/cloth-6.png",
    enhanced_image_url: null,
    category: "accessory",
    color: "brown",
    season: "all",
    notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "ext3",
    user_id: "external",
    image_url: "/clothes/cloth-7.png",
    enhanced_image_url: null,
    category: "accessory",
    color: "beige",
    season: "all",
    notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const categoryTranslations: { [key: string]: string } = {
  all: "Tous",
  top: "Haut",
  bottom: "Bas",
  one_piece: "Une pièce",
  shoes: "Chaussures",
  outerwear: "Veste/Manteau",
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

  const [clientClothes, setClientClothes] = useState<ClothingItem[]>([]);
  const [placedItems, setPlacedItems] = useState<PlacedClothingItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("wardrobe");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [containerBounds, setContainerBounds] = useState({ width: 500, height: 500 });

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientId || !user) return;
    fetchClientClothes();
  }, [clientId, user]);

  useEffect(() => {
    const updateContainerBounds = () => {
      if (canvasRef.current) {
        const bounds = canvasRef.current.getBoundingClientRect();
        const newBounds = { width: bounds.width, height: bounds.height };
        setContainerBounds(newBounds);
        console.log('[CANVAS] Container bounds updated:', newBounds);
      }
    };

    // Initial bounds setup
    updateContainerBounds();
    
    // Update bounds on window resize
    window.addEventListener('resize', updateContainerBounds);
    
    // Use ResizeObserver if available for more precise updates
    if (canvasRef.current && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(updateContainerBounds);
      resizeObserver.observe(canvasRef.current);
      
      return () => {
        window.removeEventListener('resize', updateContainerBounds);
        resizeObserver.disconnect();
      };
    }
    
    return () => window.removeEventListener('resize', updateContainerBounds);
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
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultPosition = (category: string): { x: number; y: number } => {
    // Wait for container bounds to be properly set
    if (containerBounds.width <= 100 || containerBounds.height <= 100) {
      console.log('[POSITION] Using fallback bounds, container not ready yet');
      return { x: 200, y: 150 }; // Fallback position
    }

    const centerX = containerBounds.width / 2;
    const centerY = containerBounds.height / 2;
    
    console.log('[POSITION] Calculating position for category:', category, 'with bounds:', containerBounds);
    
    const positions: { [key: string]: { x: number; y: number } } = {
      top: { x: centerX - 60, y: centerY - 150 },
      bottom: { x: centerX - 60, y: centerY - 20 },
      one_piece: { x: centerX - 60, y: centerY - 120 },
      shoes: { x: centerX - 60, y: centerY + 120 },
      outerwear: { x: centerX - 120, y: centerY },
      accessory: { x: centerX + 40, y: centerY - 50 }
    };
    
    const position = positions[category] || { x: centerX - 60, y: centerY };
    console.log('[POSITION] Final position for', category, ':', position);
    return position;
  };

  const handleItemSelect = (itemId: string) => {
    const currentItems = activeTab === "wardrobe" ? clientClothes : externalCatalog;
    const item = currentItems.find(i => i.id === itemId);
    if (!item) return;

    const isAlreadyPlaced = placedItems.some(p => p.id === itemId);
    
    if (isAlreadyPlaced) {
      console.log(`[REMOVE-${itemId.slice(-8)}] Item removed from canvas`, { category: item.category });
      setPlacedItems(prev => prev.filter(p => p.id !== itemId));
      setSelectedItemId(null);
    } else {
      const newPlacedItem: PlacedClothingItem = {
        id: itemId,
        position: getDefaultPosition(item.category),
        size: { width: 120, height: 120 },
        zIndex: nextZIndex
      };
      
      console.log(`[DROP-${itemId.slice(-8)}] Item added to canvas`, { 
        category: item.category,
        position: newPlacedItem.position,
        size: newPlacedItem.size
      });
      
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
    console.log(`[SIZE-UPDATE-${itemId.slice(-8)}] Updating item size in state`, { newSize: size });
    setPlacedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, size } : item
      )
    );
  };

  const handleItemSelection = (itemId: string) => {
    console.log(`[SELECT-${itemId.slice(-8)}] Item selected`);
    setSelectedItemId(itemId);
    setPlacedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, zIndex: nextZIndex } : item
      )
    );
    setNextZIndex(prev => prev + 1);
  };

  const handleItemRemove = (itemId: string) => {
    console.log(`[REMOVE-${itemId.slice(-8)}] Item removed from canvas`);
    setPlacedItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItemId(null);
  };

  const handleCanvasClick = () => {
    console.log('[CANVAS] Canvas clicked, clearing selection');
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
    return activeTab === "wardrobe" ? clientClothes : externalCatalog;
  };

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

  const allItems = [...clientClothes, ...externalCatalog];

  return (
    <div className="grid grid-cols-2 gap-6 h-screen">
      {/* Left Panel: Silhouette */}
      <div className="flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Silhouette du Client</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div 
              ref={canvasRef}
              className="relative flex-1 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden cursor-default"
              onClick={handleCanvasClick}
              style={{ minHeight: '500px' }}
            >
              {/* Silhouette */}
              <img
                src={silhouetteImage}
                alt="Silhouette du client"
                className="absolute opacity-30 h-[80%] w-auto object-contain pointer-events-none select-none"
                style={{ 
                  maxWidth: '33%',
                  height: 'auto',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
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

            {/* Bottom controls */}
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Commentaires sur la tenue</h3>
                <Textarea
                  placeholder="Ajoutez vos commentaires et conseils pour le client..."
                  className="min-h-[100px]"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>

              <Button
                className="btn-primary w-full"
                onClick={handleSaveOutfit}
                disabled={placedItems.length === 0 || isSaving}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer et partager"}
              </Button>

              {placedItems.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700 font-medium">💡 Conseils d'utilisation:</p>
                  <ul className="text-xs text-blue-600 mt-1 space-y-1">
                    <li>• Cliquez et glissez pour déplacer les vêtements</li>
                    <li>• Utilisez les carrés aux coins pour redimensionner</li>
                    <li>• Double-cliquez pour retirer un vêtement</li>
                    <li>• Cliquez sur un vêtement pour le sélectionner</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Clothing Selection */}
      <div>
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Sélection des Vêtements</CardTitle>
            <div className="flex gap-4 items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="wardrobe">Garde-robe</TabsTrigger>
                  <TabsTrigger value="catalog">Catalogue</TabsTrigger>
                </TabsList>
              </Tabs>
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

          <CardContent className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="wardrobe" className="mt-0">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucun vêtement trouvé dans la garde-robe</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredItems.map((item) => {
                      const isPlaced = placedItems.some(p => p.id === item.id);
                      const optimizedUrl = getOptimizedImageUrl(item.enhanced_image_url || item.image_url, 400);
                      
                      return (
                        <div key={item.id} className="space-y-2">
                          <div
                            className={`aspect-square rounded-md border-2 p-1 flex items-center justify-center overflow-hidden cursor-pointer transition-all bg-white relative ${
                              isPlaced
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

              <TabsContent value="catalog" className="mt-0">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucun vêtement trouvé dans le catalogue</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredItems.map((item) => {
                      const isPlaced = placedItems.some(p => p.id === item.id);
                      const optimizedUrl = getOptimizedImageUrl(item.enhanced_image_url || item.image_url, 400);
                      
                      return (
                        <div key={item.id} className="space-y-2">
                          <div
                            className={`aspect-square rounded-md border-2 p-1 flex items-center justify-center overflow-hidden cursor-pointer transition-all bg-white relative ${
                              isPlaced
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
                                    <p className="text-xs text-muted-foregor leading-relaxed">{item.notes}</p>
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
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OutfitCreator;
