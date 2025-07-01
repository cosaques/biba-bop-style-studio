
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { ClothingItem } from "@/hooks/useClothingItems";

interface ClothingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated?: (item: ClothingItem) => void;
  item?: ClothingItem | null;
  clientId?: string; // For consultant use - links item to specific client
}

const categoryOptions = [
  { value: "top", label: "Haut" },
  { value: "bottom", label: "Bas" },
  { value: "one_piece", label: "Une pièce" },
  { value: "shoes", label: "Chaussures" },
  { value: "outerwear", label: "Outerwear" },
  { value: "accessory", label: "Accessoire" }
];

const colorOptions = [
  { value: "black", label: "Noir" },
  { value: "grey", label: "Gris" },
  { value: "white", label: "Blanc" },
  { value: "beige", label: "Beige" },
  { value: "brown", label: "Marron" },
  { value: "pink", label: "Rose" },
  { value: "red", label: "Rouge" },
  { value: "orange", label: "Orange" },
  { value: "yellow", label: "Jaune" },
  { value: "green", label: "Vert" },
  { value: "blue", label: "Bleu" },
  { value: "purple", label: "Violet" },
  { value: "other", label: "Autre" }
];

const seasonOptions = [
  { value: "all", label: "Toute saison" },
  { value: "spring", label: "Printemps" },
  { value: "summer", label: "Été" },
  { value: "autumn", label: "Automne" },
  { value: "winter", label: "Hiver" }
];

export function ClothingItemModal({ isOpen, onClose, onItemCreated, item, clientId }: ClothingItemModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(item?.image_url || null);
  
  const [formData, setFormData] = useState({
    category: item?.category || "top",
    color: item?.color || "other",
    season: item?.season || "all",
    notes: item?.notes || ""
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "Le fichier ne peut pas dépasser 10 MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error("User not authenticated");

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('clothing-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('clothing-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      let imageUrl = item?.image_url || "";
      
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      if (!imageUrl && !item) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une image",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (item) {
        // Update existing item
        const { data, error } = await supabase
          .from('clothing_items')
          .update({
            category: formData.category,
            color: formData.color,
            season: formData.season,
            notes: formData.notes,
            ...(selectedFile && { image_url: imageUrl }),
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Vêtement modifié avec succès",
        });

        onItemCreated?.(data as ClothingItem);
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('clothing_items')
          .insert({
            user_id: user.id,
            image_url: imageUrl,
            category: formData.category,
            color: formData.color,
            season: formData.season,
            notes: formData.notes
          })
          .select()
          .single();

        if (error) throw error;

        // If clientId is provided (consultant adding item for client), create the link
        if (clientId) {
          const { error: linkError } = await supabase
            .from('client_clothing_items')
            .insert({
              client_id: clientId,
              clothing_item_id: data.id
            });

          if (linkError) throw linkError;
        }

        toast({
          title: "Succès",
          description: "Vêtement ajouté avec succès",
        });

        onItemCreated?.(data as ClothingItem);
      }

      onClose();
    } catch (error) {
      console.error('Error saving clothing item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le vêtement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: "top",
      color: "other",
      season: "all",
      notes: ""
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleClose = () => {
    if (!item) resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "Modifier le vêtement" : "Ajouter un nouveau vêtement"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="image" className="text-sm font-medium">
                Photo du vêtement *
              </Label>
              <div className="mt-2">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Aperçu"
                      className="w-full h-48 object-contain rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer text-sm text-bibabop-navy hover:text-bibabop-pink"
                      >
                        Cliquez pour télécharger une image
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF jusqu'à 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Type de vêtement *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
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

              <div>
                <Label htmlFor="color">Couleur</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une couleur" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="season">Saison</Label>
              <Select
                value={formData.season}
                onValueChange={(value) => setFormData(prev => ({ ...prev, season: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une saison" />
                </SelectTrigger>
                <SelectContent>
                  {seasonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes sur ce vêtement..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : (item ? "Modifier" : "Ajouter")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
