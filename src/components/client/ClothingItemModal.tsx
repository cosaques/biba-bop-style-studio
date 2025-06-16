
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { ClothingItem } from "@/hooks/useClothingItems";
import { uploadClothingImage, getOptimizedImageUrl } from "@/utils/imageUtils";
import { Upload, X } from "lucide-react";

interface ClothingItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<ClothingItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editItem?: ClothingItem;
}

const categoryOptions = [
  { value: 'top', label: 'Hauts' },
  { value: 'bottom', label: 'Bas' },
  { value: 'one_piece', label: 'One-piece' },
  { value: 'shoes', label: 'Chaussures' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'accessory', label: 'Accessoires' }
];

const colorOptions = [
  { value: 'black', label: 'Noir', color: '#000000' },
  { value: 'grey', label: 'Gris', color: '#808080' },
  { value: 'white', label: 'Blanc', color: '#FFFFFF' },
  { value: 'beige', label: 'Beige', color: '#F5F5DC' },
  { value: 'brown', label: 'Marron', color: '#8B4513' },
  { value: 'pink', label: 'Rose', color: '#FFC0CB' },
  { value: 'red', label: 'Rouge', color: '#FF0000' },
  { value: 'orange', label: 'Orange', color: '#FFA500' },
  { value: 'yellow', label: 'Jaune', color: '#FFFF00' },
  { value: 'green', label: 'Vert', color: '#008000' },
  { value: 'blue', label: 'Bleu', color: '#0000FF' },
  { value: 'purple', label: 'Violet', color: '#800080' },
  { value: 'other', label: 'Autre', color: '#CCCCCC' }
];

const seasonOptions = [
  { value: 'all', label: 'Toutes les saisons' },
  { value: 'spring', label: 'Printemps' },
  { value: 'summer', label: 'Été' },
  { value: 'autumn', label: 'Automne' },
  { value: 'winter', label: 'Hiver' }
];

export function ClothingItemModal({ open, onOpenChange, onSave, editItem }: ClothingItemModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    category: '' as ClothingItem['category'] | '',
    color: 'other' as ClothingItem['color'],
    season: 'all' as ClothingItem['season'],
    notes: ''
  });

  // Reset form when modal opens/closes or editItem changes
  useEffect(() => {
    if (open) {
      if (editItem) {
        setFormData({
          category: editItem.category,
          color: editItem.color,
          season: editItem.season,
          notes: editItem.notes || ''
        });
        setPreviewUrl(getOptimizedImageUrl(editItem.image_url, 400));
        setSelectedImage(null);
      } else {
        setFormData({
          category: '',
          color: 'other',
          season: 'all',
          notes: ''
        });
        setPreviewUrl('');
        setSelectedImage(null);
      }
    }
  }, [open, editItem]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Seuls les fichiers JPEG et PNG sont acceptés');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 5 MB');
        return;
      }

      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => ['image/jpeg', 'image/png'].includes(file.type));
    
    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 5 MB');
        return;
      }
      
      setSelectedImage(imageFile);
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(editItem ? getOptimizedImageUrl(editItem.image_url, 400) : '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    // Validation
    if (!formData.category) {
      alert('Veuillez sélectionner une catégorie');
      return;
    }

    if (!previewUrl && !selectedImage) {
      alert('Veuillez sélectionner une image');
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = previewUrl;

      // Upload new image if selected
      if (selectedImage) {
        const { url } = await uploadClothingImage(selectedImage, user.id);
        imageUrl = url;
      }

      await onSave({
        image_url: imageUrl,
        category: formData.category as ClothingItem['category'],
        color: formData.color,
        season: formData.season,
        notes: formData.notes || undefined
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving clothing item:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editItem ? 'Modifier le vêtement' : 'Ajouter un nouveau vêtement'}
          </DialogTitle>
          <DialogDescription>
            Téléchargez une photo et ajoutez les détails de votre vêtement
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image *</Label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="relative">
                  <div className="w-full h-[150px] flex items-center justify-center bg-gray-50 rounded-md overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-[150px] max-h-[150px] object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Glissez-déposez une image ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-gray-500">
                    JPEG, PNG • Max 5 MB
                  </p>
                </div>
              )}
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Catégorie *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as ClothingItem['category'] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
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

          {/* Color */}
          <div className="space-y-2">
            <Label>Couleur</Label>
            <Select 
              value={formData.color} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, color: value as ClothingItem['color'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300" 
                        style={{ backgroundColor: option.color }}
                      />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Season */}
          <div className="space-y-2">
            <Label>Saison</Label>
            <Select 
              value={formData.season} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, season: value as ClothingItem['season'] }))}
            >
              <SelectTrigger>
                <SelectValue />
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

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea
              placeholder="Motifs, deuxième couleur, etc."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="btn-primary">
            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
