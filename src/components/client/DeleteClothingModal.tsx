
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClothingItem } from "@/hooks/useClothingItems";

interface DeleteClothingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  item: ClothingItem | null;
  isDeleting: boolean;
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'top': 'Haut',
    'bottom': 'Bas',
    'one_piece': 'One-piece',
    'shoes': 'Chaussures',
    'outerwear': 'Outerwear',
    'accessory': 'Accessoire'
  };
  return labels[category] || category;
};

const getColorLabel = (color: string) => {
  const labels: Record<string, string> = {
    'black': 'Noir',
    'grey': 'Gris',
    'white': 'Blanc',
    'beige': 'Beige',
    'brown': 'Marron',
    'pink': 'Rose',
    'red': 'Rouge',
    'orange': 'Orange',
    'yellow': 'Jaune',
    'green': 'Vert',
    'blue': 'Bleu',
    'purple': 'Violet',
    'other': 'Autre'
  };
  return labels[color] || color;
};

export function DeleteClothingModal({ open, onOpenChange, onConfirm, item, isDeleting }: DeleteClothingModalProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Supprimer le vêtement</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce vêtement ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-4">
            <img
              src={item.image_url}
              alt={`${getColorLabel(item.color)} ${getCategoryLabel(item.category)}`}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div>
              <p className="font-medium">
                {getColorLabel(item.color)} {getCategoryLabel(item.category)}
              </p>
              {item.notes && (
                <p className="text-sm text-muted-foreground">{item.notes}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
