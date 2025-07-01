import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClothingItem {
  id: string;
  user_id: string;
  image_url: string;
  enhanced_image_url?: string | null;
  category: 'top' | 'bottom' | 'one_piece' | 'shoes' | 'outerwear' | 'accessory';
  color: 'black' | 'grey' | 'white' | 'beige' | 'brown' | 'pink' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'other';
  season: 'all' | 'spring' | 'summer' | 'autumn' | 'winter';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useClothingItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems((data || []) as ClothingItem[]);
    } catch (error) {
      console.error('Error fetching clothing items:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos vêtements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createItem = async (itemData: Omit<ClothingItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .insert({
          ...itemData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [data as ClothingItem, ...prev]);
      toast({
        title: "Succès",
        description: "Vêtement ajouté avec succès",
      });

      return { data };
    } catch (error) {
      console.error('Error creating clothing item:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le vêtement",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateItem = async (id: string, updates: Partial<ClothingItem>) => {
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => item.id === id ? data as ClothingItem : item));
      toast({
        title: "Succès",
        description: "Vêtement modifié avec succès",
      });

      return { data };
    } catch (error) {
      console.error('Error updating clothing item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le vêtement",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteItem = async (id: string, imageUrl: string, enhancedImageUrl?: string | null) => {
    try {
      // Delete the images from storage first
      const imagesToDelete: string[] = [];

      if (imageUrl) {
        const imagePath = imageUrl.split('/').pop();
        if (imagePath && user) {
          imagesToDelete.push(`${user.id}/${imagePath}`);
        }
      }

      if (enhancedImageUrl) {
        const enhancedImagePath = enhancedImageUrl.split('/').pop();
        if (enhancedImagePath && user) {
          imagesToDelete.push(`${user.id}/${enhancedImagePath}`);
        }
      }


      // Delete the item from database
      const { error } = await supabase
      .from('clothing_items')
      .delete()
      .eq('id', id);

      if (error) throw error;

      // Delete images only after cloth item is successfully deleted
      if (imagesToDelete.length > 0) {
        await supabase.storage
          .from('clothing-images')
          .remove(imagesToDelete);
      }

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Succès",
        description: "Vêtement supprimé avec succès",
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting clothing item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le vêtement",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchItems
  };
};
