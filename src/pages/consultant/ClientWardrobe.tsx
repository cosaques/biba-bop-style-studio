import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotepadText } from "lucide-react";
import { ClothingItem } from "@/hooks/useClothingItems";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const categoryOptions = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'top', label: 'Hauts' },
  { value: 'bottom', label: 'Bas' },
  { value: 'one_piece', label: 'One-piece' },
  { value: 'shoes', label: 'Chaussures' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'accessory', label: 'Accessoires' }
];

const colorTranslations: Record<string, string> = {
  black: 'Noir',
  grey: 'Gris',
  white: 'Blanc',
  beige: 'Beige',
  brown: 'Marron',
  pink: 'Rose',
  red: 'Rouge',
  orange: 'Orange',
  yellow: 'Jaune',
  green: 'Vert',
  blue: 'Bleu',
  purple: 'Violet',
  other: 'Autre'
};

const categoryTranslations: Record<string, string> = {
  top: 'Haut',
  bottom: 'Bas',
  one_piece: 'One-piece',
  shoes: 'Chaussures',
  outerwear: 'Outerwear',
  accessory: 'Accessoire'
};

const seasonTranslations: Record<string, string> = {
  all: 'Toutes saisons',
  spring: 'Printemps',
  summer: 'Été',
  autumn: 'Automne',
  winter: 'Hiver'
};

const ClientWardrobe = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientClothes, setClientClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (clientId && user) {
      fetchClientClothes();
    }
  }, [clientId, user]);

  const fetchClientClothes = async () => {
    try {
      setLoading(true);

      const { data: relationship, error: relationshipError } = await supabase
        .from('consultant_clients')
        .select('client_id')
        .eq('consultant_id', user?.id)
        .eq('client_id', clientId)
        .single();

      if (relationshipError || !relationship) {
        throw new Error("Client not found or unauthorized");
      }

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
      setLoading(false);
    }
  };

  const filteredClothes = clientClothes.filter(item =>
    selectedCategory === 'all' || item.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Garde-robe du client</CardTitle>
        <CardDescription>
          Vêtements disponibles pour créer des tenues
        </CardDescription>
        <div className="flex gap-4 items-center pt-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredClothes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              {selectedCategory === 'all'
                ? "Aucun vêtement dans la garde-robe de ce client"
                : `Aucun vêtement de type "${categoryOptions.find(c => c.value === selectedCategory)?.label}" trouvé`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredClothes.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="aspect-square rounded-md border border-gray-200 p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={getOptimizedImageUrl(item.enhanced_image_url || item.image_url, 400)}
                    alt={`${categoryTranslations[item.category]} ${colorTranslations[item.color]}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
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
                          <h4 className="font-medium text-sm">Notes</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.notes}</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientWardrobe;
