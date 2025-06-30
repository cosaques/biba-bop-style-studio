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
import { getImageDimensions, calculateOptimalSize } from "@/utils/imageLoadUtils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  const [clientClothes, setClientClothes] = useState<ClothingItem[]>([]);
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

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientId || !user) return;
    fetchClientClothes();
  }, [clientId, user]);

  useEffect(() => {
    const updateBounds = () => {
      if (canvasRef.current) {
        const parentRect = canvasRef.current.parentElement?.getBoundingClientRect();
        if (parentRect) {
          // Use almost full width minus minimal padding for mobile/desktop
          const padding = isMobile ? 16 : 24;
          const availableWidth = parentRect.width - padding;
          const availableHeight = parentRect.height - 120; // Space for header and controls
          
          // Make the canvas square (1:1 aspect ratio) based on available space
          const canvasSize = Math.min(availableWidth, availableHeight);
          
          const newBounds = { width: canvasSize, height: canvasSize };
          setContainerBounds(newBounds);
          setContainerReady(true);
          
          console.log('[CANVAS-BOUNDS] Updated:', JSON.stringify({
            ...newBounds,
            availableWidth,
            availableHeight,
            padding,
            timestamp: Date.now()
          }));
        }
      }
    };

    const timeouts = [50, 100, 200, 500, 1000];
    const timeoutIds = timeouts.map(delay => 
      setTimeout(updateBounds, delay)
    );
    
    window.addEventListener('resize', updateBounds);
    
    return () => {
      timeoutIds.forEach(clearTimeout);
      window.removeEventListener('resize', updateBounds);
    };
  }, [isMobile]);

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

  const getDefaultPosition = (category: string, containerBounds: { width: number; height: number }): { x: number; y: number } => {
    if (!containerReady || containerBounds.width === 0 || containerBounds.height === 0) {
      console.log(`[POSITION-FALLBACK] Container not ready:`, JSON.stringify({
        containerReady,
        containerBounds,
        category,
        timestamp: Date.now()
      }));
      return { x: 100, y: 100 };
    }

    const silhouetteWidth = Math.min(containerBounds.width * 0.4, 200);
    const centerX = containerBounds.width / 2;
    const centerY = containerBounds.height / 2;
    
    const positions: { [key: string]: { x: number; y: number } } = {
      top: { x: centerX - 60, y: centerY - 150 },
      bottom: { x: centerX - 60, y: centerY - 20 },
      one_piece: { x: centerX - 60, y: centerY - 120 },
      shoes: { x: centerX - 50, y: centerY + 120 },
      outerwear: { x: centerX - silhouetteWidth/2 - 60, y: centerY - 80 },
      accessory: { x: centerX + silhouetteWidth/2 + 20, y: centerY - 80 }
    };
    
    const basePosition = positions[category] || { x: centerX - 60, y: centerY - 60 };
    
    console.log(`[POSITION-CALC] For ${category}:`, JSON.stringify({
      containerBounds,
      centerX,
      centerY,
      basePosition,
      timestamp: Date.now()
    }));
    
    return basePosition;
  };

  const getDefaultSize = async (imageUrl: string): Promise<{ width: number; height: number }> => {
    try {
      const dimensions = await getImageDimensions(imageUrl);
      console.log(`[IMAGE-DIMENSIONS] Natural dimensions:`, JSON.stringify(dimensions));
      
      const optimalSize = calculateOptimalSize(dimensions.width, dimensions.height, 120);
      console.log(`[IMAGE-DIMENSIONS] Calculated optimal size:`, JSON.stringify(optimalSize));
      
      return optimalSize;
    } catch (error) {
      console.error('Failed to get image dimensions:', error);
      return { width: 120, height: 120 }; // Fallback
    }
  };

  const handleItemSelect = async (itemId: string) => {
    const allItems = [...clientClothes, ...externalCatalog];
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    const isAlreadyPlaced = placedItems.some(p => p.id === itemId);
    
    if (isAlreadyPlaced) {
      console.log(`[ITEM-REMOVE-${itemId.slice(-8)}] Removed from canvas:`, JSON.stringify({ 
        category: item.category,
        timestamp: Date.now()
      }));
      setPlacedItems(prev => prev.filter(p => p.id !== itemId));
      setSelectedItemId(null);
    } else {
      if (!containerReady || containerBounds.width === 0 || containerBounds.height === 0) {
        console.log(`[ITEM-ADD-RETRY-${itemId.slice(-8)}] Container not ready, forcing update:`, JSON.stringify({
          containerReady,
          containerBounds,
          timestamp: Date.now()
        }));
        
        if (canvasRef.current) {
          const bounds = canvasRef.current.getBoundingClientRect();
          const newBounds = { width: bounds.width, height: bounds.height };
          setContainerBounds(newBounds);
          setContainerReady(true);
          
          setTimeout(() => handleItemSelect(itemId), 100);
          return;
        }
      }

      const imageUrl = getOptimizedImageUrl(item.enhanced_image_url || item.image_url, 400);
      const size = await getDefaultSize(imageUrl);
      const position = getDefaultPosition(item.category, containerBounds);

      const centeredPosition = {
        x: position.x - size.width / 2 + 60,
        y: position.y
      };

      const newPlacedItem: PlacedClothingItem = {
        id: itemId,
        position: centeredPosition,
        size,
        zIndex: nextZIndex
      };
      
      console.log(`[ITEM-ADD-${itemId.slice(-8)}] Added to canvas:`, JSON.stringify({ 
        category: item.category,
        position: newPlacedItem.position,
        size: newPlacedItem.size,
        zIndex: newPlacedItem.zIndex,
        timestamp: Date.now()
      }));
      
      setPlacedItems(prev => [...prev, newPlacedItem]);
      setSelectedItemId(itemId);
      setNextZIndex(prev => prev + 1);
    }
  };

  const handleItemPositionChange = (itemId: string, position: { x: number; y: number }) => {
    console.log(`[POSITION-UPDATE-${itemId.slice(-8)}] New position:`, JSON.stringify({
      position,
      timestamp: Date.now()
    }));
    setPlacedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, position } : item
      )
    );
  };

  const handleItemSizeChange = (itemId: string, size: { width: number; height: number }) => {
    console.log(`[SIZE-UPDATE-${itemId.slice(-8)}] New size:`, JSON.stringify({
      size,
      timestamp: Date.now()
    }));
    setPlacedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, size } : item
      )
    );
  };

  const handleItemSelection = (itemId: string) => {
    console.log(`[SELECTION-${itemId.slice(-8)}] Item selected`);
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
    console.log(`[REMOVE-${itemId.slice(-8)}] Item removed from canvas`);
    setPlacedItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItemId(null);
  };

  const handleCanvasClick = () => {
    // Only clear selection if not currently resizing any item
    const hasResizingItem = placedItems.some(item => item.id === selectedItemId);
    if (!hasResizingItem) {
      console.log('[CANVAS] Canvas clicked, clearing selection');
      setSelectedItemId(null);
    }
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
      return externalCatalog;
    }
  };

  const allItems = [...clientClothes, ...externalCatalog];
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
    <div className={`${isMobile ? 'flex-col' : 'flex'} h-full gap-3 p-2`}>
      {/* Left Panel: Silhouette - optimized for maximum space */}
      <div className={`${isMobile ? 'w-full mb-3' : 'w-1/2'} flex flex-col min-h-0`}>
        <Card className="flex-1 flex flex-col h-full">
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle className="text-lg">Silhouette du Client</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 p-2">
            {/* Canvas container - full width with minimal padding */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div 
                ref={canvasRef}
                className="relative bg-gray-200 rounded-md flex items-center justify-center overflow-hidden"
                onClick={handleCanvasClick}
                style={{
                  width: `${containerBounds.width}px`,
                  height: `${containerBounds.height}px`,
                  minWidth: '250px',
                  minHeight: '250px'
                }}
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
                    <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg text-center">
                      <p className="text-sm">Sélectionnez des vêtements</p>
                      <p className="text-sm">pour les ajouter à la silhouette</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom controls - compact layout */}
            <div className="mt-2 space-y-2 flex-shrink-0">
              <div>
                <h3 className="font-medium mb-1 text-sm">Commentaires sur la tenue</h3>
                <Textarea
                  placeholder="Ajoutez vos commentaires et conseils pour le client..."
                  className="min-h-[50px] text-sm"
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

              {/* Usage tips - always visible */}
              <div className="p-2 bg-blue-50 rounded-md">
                <p className="text-xs text-blue-700 font-medium">💡 Conseils d'utilisation:</p>
                <ul className="text-xs text-blue-600 mt-1 space-y-0.5">
                  <li>• Cliquez et glissez pour déplacer les vêtements</li>
                  <li>• Utilisez les carrés aux coins pour redimensionner</li>
                  <li>• Double-cliquez pour retirer un vêtement</li>
                  <li>• Cliquez sur un vêtement pour le sélectionner</li>
                  <li>• Sur mobile: appui long pour supprimer</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Clothing Selection */}
      <div className={`${isMobile ? 'w-full' : 'w-1/2'} min-h-0`}>
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle className="text-lg">Sélection des Vêtements</CardTitle>
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

          <CardContent className="flex-1 overflow-y-auto min-h-0 p-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="wardrobe">Garde-robe</TabsTrigger>
                <TabsTrigger value="catalog">Catalogue</TabsTrigger>
              </TabsList>
              
              <TabsContent value="wardrobe" className="flex-1 mt-3 min-h-0">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      {categoryFilter === "all" 
                        ? "Aucun vêtement trouvé dans la garde-robe"
                        : `Aucun vêtement de type "${categoryTranslations[categoryFilter]}" trouvé dans la garde-robe`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 pb-3">
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
              
              <TabsContent value="catalog" className="flex-1 mt-3 min-h-0">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      {categoryFilter === "all" 
                        ? "Aucun vêtement trouvé dans le catalogue"
                        : `Aucun vêtement de type "${categoryTranslations[categoryFilter]}" trouvé dans le catalogue`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 pb-3">
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
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OutfitCreator;
