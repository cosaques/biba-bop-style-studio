import { useState, useEffect, useRef } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

interface ClothingPosition {
  id: string;
  position: { x: number; y: number };
  scale: number;
  zIndex?: number;
}

// Catalogue externe de vêtements
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
  const [selectedClothes, setSelectedClothes] = useState<string[]>([]);
  const [clothingPositions, setClothingPositions] = useState<ClothingPosition[]>([]);
  const [comments, setComments] = useState("");
  const [activeTab, setActiveTab] = useState("wardrobe");
  const [filter, setFilter] = useState("all");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(10);

  // Add container bounds reference
  const containerBounds = useRef({ width: 337, height: 600 });

  useEffect(() => {
    // Update container bounds when component mounts
    const updateBounds = () => {
      // These are the typical dimensions of the silhouette container
      containerBounds.current = { width: 337, height: 600 };
    };
    updateBounds();
  }, []);

  useEffect(() => {
    if (!clientId) {
      toast({
        title: "Erreur",
        description: "ID client manquant",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      return;
    }

    fetchClientClothes();
  }, [clientId, user]);

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

  const getDefaultPosition = (category: string, existingPositions: ClothingPosition[]) => {
    const containerWidth = containerBounds.current.width;
    const containerHeight = containerBounds.current.height;
    
    // Center coordinates for the silhouette area
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    console.log(`[OutfitCreator] Default position for ${category}:`, { 
      centerX, 
      centerY, 
      containerWidth, 
      containerHeight 
    });
    
    // Better positioning relative to silhouette center (assuming silhouette is ~250px wide)
    const basePositions: { [key: string]: { x: number; y: number } } = {
      top: { x: centerX - 100, y: centerY - 120 },        // Upper torso
      bottom: { x: centerX - 75, y: centerY - 20 },       // Lower torso  
      one_piece: { x: centerX - 100, y: centerY - 80 },   // Full body
      shoes: { x: centerX - 60, y: centerY + 80 },        // Bottom
      outerwear: { x: centerX - 110, y: centerY - 130 },  // Over everything
      accessory: { x: centerX - 50, y: centerY - 150 }    // Top area
    };

    let position = basePositions[category] || { x: centerX - 75, y: centerY - 75 };
    
    // Offset for multiple items of same category
    const sameCategory = existingPositions.filter(pos => {
      const item = [...clientClothes, ...externalCatalog].find(i => i.id === pos.id);
      return item?.category === category;
    });
    
    if (sameCategory.length > 0) {
      position.x += sameCategory.length * 15;
      position.y += sameCategory.length * 15;
    }

    console.log(`[OutfitCreator] Final position for ${category}:`, position);
    return position;
  };

  const handleItemSelect = (itemId: string) => {
    if (selectedClothes.includes(itemId)) {
      setSelectedClothes(selectedClothes.filter(id => id !== itemId));
      setClothingPositions(clothingPositions.filter(pos => pos.id !== itemId));
      setSelectedItemId(null);
    } else {
      const item = [...clientClothes, ...externalCatalog].find(i => i.id === itemId);
      if (item) {
        setSelectedClothes([...selectedClothes, itemId]);
        const position = getDefaultPosition(item.category, clothingPositions);
        const newPosition = {
          id: itemId,
          position,
          scale: 1,
          zIndex: nextZIndex
        };
        setClothingPositions([...clothingPositions, newPosition]);
        setSelectedItemId(itemId);
        setNextZIndex(nextZIndex + 1);
      }
    }
  };

  const handlePositionChange = (itemId: string, position: { x: number; y: number }) => {
    setClothingPositions(prev => 
      prev.map(pos => pos.id === itemId ? { ...pos, position } : pos)
    );
  };

  const handleScaleChange = (itemId: string, scale: number) => {
    setClothingPositions(prev => 
      prev.map(pos => pos.id === itemId ? { ...pos, scale } : pos)
    );
  };

  const handleItemSelection = (itemId: string) => {
    if (selectedItemId !== itemId) {
      setSelectedItemId(itemId);
      setClothingPositions(prev => 
        prev.map(pos => pos.id === itemId ? { ...pos, zIndex: nextZIndex } : pos)
      );
      setNextZIndex(nextZIndex + 1);
    }
  };

  const handleRemoveFromSilhouette = (itemId: string) => {
    setSelectedClothes(selectedClothes.filter(id => id !== itemId));
    setClothingPositions(clothingPositions.filter(pos => pos.id !== itemId));
    setSelectedItemId(null);
  };

  const handleSilhouetteClick = () => {
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
      setSelectedClothes([]);
      setComments("");
    }, 1500);
  };

  const filteredWardrobe = clientClothes.filter(
    item => filter === "all" || item.category === filter
  );

  const filteredCatalog = externalCatalog.filter(
    item => filter === "all" || item.category === filter
  );

  const getEmptyStateMessage = () => {
    if (filter === "all") {
      return "Aucun vêtement dans la garde-robe de ce client";
    }
    return `Aucun vêtement de type "${categoryTranslations[filter]}" trouvé`;
  };

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
    <div className="grid md:grid-cols-3 gap-6">
      {/* Panel de gauche: silhouette et tenue */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Silhouette du Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div 
                className="relative min-h-[400px] w-full bg-bibabop-lightgrey rounded-md flex items-center justify-center overflow-hidden cursor-default"
                onClick={handleSilhouetteClick}
              >
                <img
                  src={silhouetteImage}
                  alt="Silhouette du client"
                  className="max-h-[600px] w-auto object-contain"
                />

                {/* Draggable clothing items with standardized 400px images */}
                {clothingPositions.map(clothingPos => {
                  const item = [...clientClothes, ...externalCatalog].find(i => i.id === clothingPos.id);
                  if (!item) return null;

                  // Use standardized 400px image URL for all clothing items
                  const imageUrl = getOptimizedImageUrl(item.enhanced_image_url || item.image_url, 400);
                  
                  return (
                    <DraggableClothingItem
                      key={clothingPos.id}
                      id={clothingPos.id}
                      imageUrl={imageUrl}
                      category={item.category}
                      initialPosition={clothingPos.position}
                      initialScale={clothingPos.scale}
                      zIndex={clothingPos.zIndex || 10}
                      onPositionChange={handlePositionChange}
                      onScaleChange={handleScaleChange}
                      onRemove={handleRemoveFromSilhouette}
                      onSelect={handleItemSelection}
                      isSelected={selectedItemId === clothingPos.id}
                    />
                  );
                })}

                {/* Instructions overlay */}
                {selectedClothes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 text-white p-4 rounded-lg text-center">
                      <p className="text-sm">Sélectionnez des vêtements</p>
                      <p className="text-sm">pour les ajouter à la silhouette</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 w-full">
                <h3 className="font-medium mb-2">Commentaires sur la tenue</h3>
                <Textarea
                  placeholder="Ajoutez vos commentaires et conseils pour le client..."
                  className="min-h-[100px]"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>

              <Button
                className="btn-primary w-full mt-4"
                onClick={handleSaveOutfit}
                disabled={selectedClothes.length === 0 || isSaving}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer et partager"}
              </Button>

              {selectedClothes.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md w-full">
                  <p className="text-sm text-blue-700 font-medium">💡 Conseils d'utilisation:</p>
                  <ul className="text-xs text-blue-600 mt-1 space-y-1">
                    <li>• Cliquez et glissez pour déplacer les vêtements</li>
                    <li>• Utilisez les carrés aux coins pour redimensionner</li>
                    <li>• Double-cliquez pour retirer un vêtement</li>
                    <li>• Cliquez sur un vêtement pour le mettre au premier plan</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de droite: sélection des vêtements */}
      <div className="md:col-span-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Sélection des Vêtements</CardTitle>
              <TabsList className="grid grid-cols-2 w-48 mb-4">
                <TabsTrigger value="wardrobe">Garde-robe</TabsTrigger>
                <TabsTrigger value="catalog">Catalogue</TabsTrigger>
              </TabsList>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="grid grid-cols-7 mb-4">
                  <TabsTrigger value="all">Tous</TabsTrigger>
                  <TabsTrigger value="top">Hauts</TabsTrigger>
                  <TabsTrigger value="bottom">Bas</TabsTrigger>
                  <TabsTrigger value="one_piece">Une pièce</TabsTrigger>
                  <TabsTrigger value="shoes">Chaussures</TabsTrigger>
                  <TabsTrigger value="outerwear">Vestes</TabsTrigger>
                  <TabsTrigger value="accessory">Accessoires</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent>
              {activeTab === "wardrobe" && (
                <TabsContent value="wardrobe" className="mt-0">
                  {filteredWardrobe.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>{getEmptyStateMessage()}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredWardrobe.map((item) => {
                        const isSelected = selectedClothes.includes(item.id);
                        // Use standardized 400px optimized images for consistent caching
                        const optimizedUrl = getOptimizedImageUrl(item.enhanced_image_url || item.image_url, 400);
                        
                        return (
                          <div key={item.id} className="space-y-2">
                            <div
                              className={`aspect-square rounded-md border-2 p-1 flex items-center justify-center overflow-hidden cursor-pointer transition-all bg-white relative ${
                                isSelected
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
                              {isSelected && (
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
              )}

              {activeTab === "catalog" && (
                <TabsContent value="catalog" className="mt-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredCatalog.map((item) => {
                      const isSelected = selectedClothes.includes(item.id);
                      // Use standardized 400px optimized images for consistent caching
                      const optimizedUrl = getOptimizedImageUrl(item.image_url, 400);
                      
                      return (
                        <div key={item.id} className="space-y-2">
                          <div
                            className={`aspect-square rounded-md border-2 p-1 flex items-center justify-center overflow-hidden cursor-pointer transition-all bg-white relative ${
                              isSelected
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
                            {isSelected && (
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

                    <Card className="card-hover flex flex-col bg-white">
                      <CardHeader className="p-0 flex-shrink-0">
                        <div className="aspect-square border-2 border-dashed rounded-t-lg overflow-hidden cursor-pointer hover:bg-muted/50 transition-all flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-bibabop-navy flex items-center justify-center text-white mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                          </div>
                          <p className="font-medium text-sm">Ajouter au catalogue</p>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                </TabsContent>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default OutfitCreator;
