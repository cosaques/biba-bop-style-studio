
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ConsultantSidebar } from "@/components/consultant/ConsultantSidebar";
import { ConsultantHeader } from "@/components/consultant/ConsultantHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClothingItem } from "@/hooks/useClothingItems";
import { StickyNote } from "lucide-react";

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [client, setClient] = useState<ClientData | null>(null);
  const [clientClothes, setClientClothes] = useState<ClothingItem[]>([]);
  const [selectedClothes, setSelectedClothes] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [activeTab, setActiveTab] = useState("wardrobe");
  const [filter, setFilter] = useState("all");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      toast({
        title: "Erreur",
        description: "ID client manquant",
        variant: "destructive",
      });
      navigate("/consultant/dashboard");
      return;
    }
    
    if (!user) {
      return;
    }
    
    fetchClientData();
    fetchClientClothes();
  }, [clientId, user]);

  const fetchClientData = async () => {
    if (!clientId || !user) return;

    try {
      // First, verify that this client belongs to the current consultant
      const { data: relationship, error: relationshipError } = await supabase
        .from('consultant_clients')
        .select('client_id')
        .eq('consultant_id', user.id)
        .eq('client_id', clientId)
        .single();

      if (relationshipError || !relationship) {
        throw new Error("Client not found or unauthorized");
      }

      // Fetch client profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Fetch client personal data
      const { data: clientProfileData, error: clientProfileError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', clientId)
        .maybeSingle();

      if (clientProfileError) {
        console.error('Error fetching client profile:', clientProfileError);
      }

      const clientData: ClientData = {
        id: profileData.id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        profile_photo_url: profileData.profile_photo_url,
        age: clientProfileData?.age,
        height: clientProfileData?.height,
        weight: clientProfileData?.weight,
        bust_size: clientProfileData?.bust_size,
        gender: clientProfileData?.gender,
      };

      setClient(clientData);
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du client",
        variant: "destructive",
      });
    }
  };

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

  const handleItemSelect = (itemId: string) => {
    if (selectedClothes.includes(itemId)) {
      setSelectedClothes(selectedClothes.filter(id => id !== itemId));
    } else {
      setSelectedClothes([...selectedClothes, itemId]);
    }
  };

  const handleSaveOutfit = () => {
    setIsSaving(true);
    // Simuler la sauvegarde de la tenue
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Succès",
        description: "Tenue enregistrée et partagée avec le client!",
      });
      // Réinitialiser
      setSelectedClothes([]);
      setComments("");
    }, 1500);
  };

  const getClientDisplayName = (client: ClientData) => {
    if (client.first_name || client.last_name) {
      return `${client.first_name || ''} ${client.last_name || ''}`.trim();
    }
    return client.email || 'Client sans nom';
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

  if (isLoading || !client) {
    return (
      <div className="flex min-h-screen bg-background">
        <ConsultantSidebar />
        <div className="flex-1">
          <ConsultantHeader />
          <main className="p-6">
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const silhouetteImage = client.gender === "homme"
    ? "/looks/m-look-0.png"
    : "/looks/look-0.png";

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-bibabop-navy">Création de Tenue</h1>
      <p className="subtitle">Créez une tenue personnalisée pour {getClientDisplayName(client)}</p>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {/* Panel de gauche: silhouette et tenue */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Silhouette du Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="relative min-h-[400px] w-full bg-bibabop-lightgrey rounded-md flex items-center justify-center">
                  <img
                    src={silhouetteImage}
                    alt="Silhouette du client"
                    className="max-h-[600px] w-auto object-contain"
                  />

                  {/* Vêtements sélectionnés qui seraient positionnés sur la silhouette */}
                  {selectedClothes.map(itemId => {
                    const item = [...clientClothes, ...externalCatalog].find(i => i.id === itemId);
                    if (!item) return null;

                    let positionClass = "";
                    if (item.category === "top") positionClass = "top-1/4 -translate-y-[40px]";
                    if (item.category === "bottom") positionClass = "top-1/2 -translate-y-[50px]";
                    if (item.category === "one_piece") positionClass = "top-1/3 -translate-y-[30px]";
                    if (item.category === "shoes") positionClass = "bottom-0 translate-y-[15px]";
                    if (item.category === "outerwear") positionClass = "top-1/5 -translate-y-[50px]";
                    if (item.category === "accessory") positionClass = "top-10 right-10";

                    // 🎯 Taille spécifique par type
                    let tailleClass = "";
                    if (item.category === "top") tailleClass = "w-40 h-auto";         
                    if (item.category === "bottom") tailleClass = "w-28";          
                    if (item.category === "one_piece") tailleClass = "w-40 h-auto";
                    if (item.category === "shoes") tailleClass = "w-28 h-28";   
                    if (item.category === "outerwear") tailleClass = "w-44 h-auto";
                    if (item.category === "accessory") tailleClass = "w-20 h-20";   

                    return (
                      <div
                        key={itemId}
                        className={`absolute ${tailleClass} ${positionClass} cursor-move`}
                        style={{ opacity: 0.8 }}
                      >
                        <img
                          src={item.enhanced_image_url || item.image_url}
                          alt={item.category}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    );
                  })}

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
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredWardrobe.map((item) => (
                          <div
                            key={item.id}
                            className={`border rounded-lg overflow-hidden cursor-pointer transition-all bg-white ${selectedClothes.includes(item.id)
                              ? 'ring-2 ring-bibabop-gold'
                              : 'hover:shadow-md'
                              }`}
                            onClick={() => handleItemSelect(item.id)}
                          >
                            <div className="aspect-square bg-bibabop-lightgrey relative flex items-center justify-center">
                              <img
                                src={item.enhanced_image_url || item.image_url}
                                alt={`${item.color} ${item.category}`}
                                className="max-w-full max-h-full object-contain"
                              />

                              {selectedClothes.includes(item.id) && (
                                <div className="absolute top-2 right-2 bg-bibabop-gold text-white w-6 h-6 rounded-full flex items-center justify-center">
                                  ✓
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">
                                  {categoryTranslations[item.category]} · {colorTranslations[item.color]} · {seasonTranslations[item.season]}
                                </p>
                                {item.notes && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <StickyNote className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                      <div className="grid gap-4">
                                        <div className="space-y-2">
                                          <h4 className="font-medium leading-none">Notes</h4>
                                          <p className="text-sm text-muted-foreground">
                                            {item.notes}
                                          </p>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                )}

                {activeTab === "catalog" && (
                  <TabsContent value="catalog" className="mt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredCatalog.map((item) => (
                        <div
                          key={item.id}
                          className={`border rounded-lg overflow-hidden cursor-pointer transition-all bg-white ${selectedClothes.includes(item.id)
                            ? 'ring-2 ring-bibabop-gold'
                            : 'hover:shadow-md'
                            }`}
                          onClick={() => handleItemSelect(item.id)}
                        >
                          <div className="aspect-square bg-bibabop-lightgrey relative flex items-center justify-center">
                            <img
                              src={item.image_url}
                              alt={`${item.color} ${item.category}`}
                              className="max-w-full max-h-full object-contain"
                            />

                            {selectedClothes.includes(item.id) && (
                              <div className="absolute top-2 right-2 bg-bibabop-gold text-white w-6 h-6 rounded-full flex items-center justify-center">
                                ✓
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="font-medium text-sm">
                              {categoryTranslations[item.category]} · {colorTranslations[item.color]} · {seasonTranslations[item.season]}
                            </p>
                            <p className="text-xs text-muted-foreground">Catalogue externe</p>
                          </div>
                        </div>
                      ))}

                      {/* Option pour ajouter un vêtement au catalogue */}
                      <div className="border border-dashed rounded-lg overflow-hidden cursor-pointer hover:bg-muted/50 transition-all bg-white">
                        <div className="aspect-square flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-bibabop-navy flex items-center justify-center text-white mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                          </div>
                          <p className="font-medium">Ajouter au catalogue</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default OutfitCreator;
