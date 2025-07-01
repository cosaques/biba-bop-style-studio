
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Outfit {
  id: string;
  name: string;
  comments?: string;
  image_url: string;
  client_id: string;
  consultant_id: string;
  created_at: string;
  updated_at: string;
}

export const useOutfits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  const createOutfit = async (
    name: string,
    comments: string,
    clientId: string,
    clothingItemIds: string[],
    imageBlob: Blob
  ) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une tenue",
        variant: "destructive",
      });
      return { success: false };
    }

    if (clothingItemIds.length < 2) {
      toast({
        title: "Erreur",
        description: "Vous devez placer au moins 2 vêtements pour sauvegarder une tenue",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      // Upload image to storage
      const fileName = `${user.id}/${Date.now()}-outfit.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('outfit-images')
        .upload(fileName, imageBlob, {
          contentType: 'image/png',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('outfit-images')
        .getPublicUrl(fileName);

      // Create outfit record
      const { data: outfitData, error: outfitError } = await supabase
        .from('outfits')
        .insert({
          name,
          comments: comments || null,
          image_url: publicUrl,
          client_id: clientId,
          consultant_id: user.id,
        })
        .select()
        .single();

      if (outfitError) throw outfitError;

      // Create outfit clothing items
      const outfitClothingItems = clothingItemIds.map(clothingItemId => ({
        outfit_id: outfitData.id,
        clothing_item_id: clothingItemId,
      }));

      const { error: itemsError } = await supabase
        .from('outfit_clothing_items')
        .insert(outfitClothingItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Succès",
        description: "Tenue créée et partagée avec le client!",
      });

      // Refresh outfits list
      await fetchOutfits();

      return { success: true, outfit: outfitData };
    } catch (error) {
      console.error('Error creating outfit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la tenue",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const fetchOutfits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('outfits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOutfits(data || []);
    } catch (error) {
      console.error('Error fetching outfits:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tenues",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, [user]);

  return {
    outfits,
    loading,
    createOutfit,
    fetchOutfits,
  };
};
