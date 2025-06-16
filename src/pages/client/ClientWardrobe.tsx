import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useClothingItems, ClothingItem } from "@/hooks/useClothingItems";
import { ClothingItemModal } from "@/components/client/ClothingItemModal";
import { DeleteClothingModal } from "@/components/client/DeleteClothingModal";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

console.log("ClientWardrobe.tsx: Component file loaded");

const categoryOptions = [
  { value: 'tous', label: 'Tous' },
  { value: 'top', label: 'Hauts' },
  { value: 'bottom', label: 'Bas' },
  { value: 'one_piece', label: 'One-piece' },
  { value: 'shoes', label: 'Chaussures' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'accessory', label: 'Accessoires' }
];

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

const getSeasonLabel = (season: string) => {
  const labels: Record<string, string> = {
    'all': 'Toutes les saisons',
    'spring': 'Printemps',
    'summer': 'Été',
    'autumn': 'Automne',
    'winter': 'Hiver'
  };
  return labels[season] || season;
};

export default function ClientWardrobe() {
  console.log("ClientWardrobe: Component function called");
  
  const [filter, setFilter] = useState("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { items, loading, createItem, updateItem, deleteItem } = useClothingItems();

  useEffect(() => {
    console.log("ClientWardrobe: Component mounted");
    console.log("ClientWardrobe: Current state:", {
      filter,
      searchTerm,
      isModalOpen,
      editingItem: editingItem?.id,
      itemsCount: items.length
    });
    
    return () => {
      console.log("ClientWardrobe: Component unmounting");
    };
  }, []);

  useEffect(() => {
    console.log("ClientWardrobe: State changed:", {
      filter,
      searchTerm,
      isModalOpen,
      editingItem: editingItem?.id
    });
  }, [filter, searchTerm, isModalOpen, editingItem]);

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "tous" || item.category === filter;
    const matchesSearch = searchTerm === "" ||
      getCategoryLabel(item.category).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getColorLabel(item.color).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSeasonLabel(item.season).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleSaveItem = async (data: Omit<ClothingItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
    } else {
      await createItem(data);
    }
    setEditingItem(undefined);
  };

  const handleEditItem = (item: ClothingItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (item: ClothingItem) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    const result = await deleteItem(itemToDelete.id, itemToDelete.image_url);
    setIsDeleting(false);

    if (result.success) {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingItem(undefined);
    }
  };

  if (loading) {
    console.log("ClientWardrobe: Rendering loading state");
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 md:p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-bibabop-navy">Ma Garde-robe</h1>
            <p className="subtitle">Gérez vos vêtements pour créer des tenues personnalisées</p>
          </div>
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy"></div>
          </div>
        </div>
      </div>
    );
  }

  console.log("ClientWardrobe: Rendering main component");

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-bibabop-navy">Ma Garde-robe</h1>
          <p className="subtitle text-sm md:text-base">Gérez vos vêtements pour créer des tenues personnalisées</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par type, couleur, saison, notes..."
              value={searchTerm}
              onChange={(e) => {
                console.log("ClientWardrobe: Search term changed to:", e.target.value);
                setSearchTerm(e.target.value);
              }}
              className="w-full"
            />
          </div>

          <div className="flex-shrink-0">
            <Button
              className="btn-primary w-full md:w-auto"
              onClick={() => {
                console.log("ClientWardrobe: Add clothing button clicked");
                setIsModalOpen(true);
              }}
            >
              Ajouter un vêtement
            </Button>
          </div>
        </div>

        <Tabs defaultValue="tous" value={filter} onValueChange={(value) => {
          console.log("ClientWardrobe: Tab changed to:", value);
          setFilter(value);
        }} className="w-full">
          <div className="w-full overflow-x-auto mb-6">
            <TabsList className="grid w-full grid-cols-7 h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
              {categoryOptions.map((option) => (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className="whitespace-nowrap px-2 md:px-3 text-xs md:text-sm"
                >
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={filter} className="animate-fade-in">
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                  </div>
                  <h3 className="text-xl font-medium mb-2">Aucun vêtement trouvé</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {searchTerm
                      ? `Aucun résultat pour "${searchTerm}". Essayez une autre recherche.`
                      : "Vous n'avez pas encore ajouté de vêtements dans cette catégorie."}
                  </p>
                  <Button className="btn-primary mt-6" onClick={() => setIsModalOpen(true)}>
                    Ajouter un vêtement
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="card-hover flex flex-col">
                    <CardHeader className="p-0 flex-shrink-0">
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={getOptimizedImageUrl(item.image_url, 400)}
                          alt={`${getColorLabel(item.color)} ${getCategoryLabel(item.category)}`}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-grow">
                      <h3 className="font-medium text-sm md:text-xl mb-2">
                        {getCategoryLabel(item.category)} {getColorLabel(item.color)}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Saison: {getSeasonLabel(item.season)}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0 pb-4 justify-between pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteItem(item)}
                        >
                          Supprimer
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ClothingItemModal
          open={isModalOpen}
          onOpenChange={handleModalClose}
          onSave={handleSaveItem}
          editItem={editingItem}
        />

        <DeleteClothingModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={confirmDelete}
          item={itemToDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
