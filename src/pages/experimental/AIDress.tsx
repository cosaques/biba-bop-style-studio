
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Sparkles, Download, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AIDress() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string>('');
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [clothingImage, setClothingImage] = useState<File | null>(null);
  const [personImagePreview, setPersonImagePreview] = useState<string>('');
  const [clothingImagePreview, setClothingImagePreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  
  const personInputRef = useRef<HTMLInputElement>(null);
  const clothingInputRef = useRef<HTMLInputElement>(null);

  const handlePersonImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPersonImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPersonImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClothingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClothingImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setClothingImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!personImage || !clothingImage) {
      toast({
        title: "Images manquantes",
        description: "Veuillez télécharger une image de personne et une image de vêtement",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setResultImage('');

    try {
      // Convert images to base64
      const personBase64 = await convertToBase64(personImage);
      const clothingBase64 = await convertToBase64(clothingImage);

      console.log('Starting AI dress generation...');

      const { data, error } = await supabase.functions.invoke('ai-dress-generator', {
        body: {
          personImage: personBase64,
          clothingImage: clothingBase64,
          description: description || `A person wearing ${category || 'clothing'}`,
          category
        }
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }

      console.log('AI dress generation response:', data);

      if (data.output && data.output.length > 0) {
        setResultImage(data.output[0]);
        toast({
          title: "Succès !",
          description: "L'image AI a été générée avec succès"
        });
      } else {
        throw new Error('Aucune image générée');
      }

    } catch (error) {
      console.error('Error generating AI dress:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'image AI. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadResult = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'ai-dressed-silhouette.jpg';
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            AI Silhouette Dressing
            <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-2">
              Expérimental
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Expérimentez avec l'IA pour "habiller" automatiquement une silhouette avec des vêtements sélectionnés.
            Cette fonctionnalité utilise des modèles d'IA avancés pour créer des essayages virtuels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Images d'entrée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Person Image */}
                <div>
                  <Label htmlFor="person-image">Image de la personne/silhouette</Label>
                  <Input
                    id="person-image"
                    type="file"
                    accept="image/*"
                    ref={personInputRef}
                    onChange={handlePersonImageChange}
                    className="mt-1"
                  />
                  {personImagePreview && (
                    <div className="mt-2">
                      <img
                        src={personImagePreview}
                        alt="Aperçu personne"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                {/* Clothing Image */}
                <div>
                  <Label htmlFor="clothing-image">Image du vêtement</Label>
                  <Input
                    id="clothing-image"
                    type="file"
                    accept="image/*"
                    ref={clothingInputRef}
                    onChange={handleClothingImageChange}
                    className="mt-1"
                  />
                  {clothingImagePreview && (
                    <div className="mt-2">
                      <img
                        src={clothingImagePreview}
                        alt="Aperçu vêtement"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Catégorie de vêtement</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Haut</SelectItem>
                      <SelectItem value="bottom">Bas</SelectItem>
                      <SelectItem value="dress">Robe</SelectItem>
                      <SelectItem value="outerwear">Veste/Manteau</SelectItem>
                      <SelectItem value="full-outfit">Tenue complète</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez le style souhaité ou des instructions spéciales..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !personImage || !clothingImage}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Générer avec l'IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Note expérimentale</p>
                    <p>Cette fonctionnalité utilise des modèles d'IA externes et peut prendre quelques minutes à traiter. Les résultats peuvent varier selon la qualité des images d'entrée.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Result Section */}
          <div>
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Résultat AI
                  {resultImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadResult}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">Génération de l'image AI en cours...</p>
                    <p className="text-sm text-gray-500 mt-1">Cela peut prendre 1-2 minutes</p>
                  </div>
                ) : resultImage ? (
                  <div className="space-y-4">
                    <img
                      src={resultImage}
                      alt="Résultat AI"
                      className="w-full rounded-lg shadow-lg"
                    />
                    <p className="text-sm text-gray-600 text-center">
                      Image générée par l'IA - Silhouette habillée automatiquement
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed">
                    <Sparkles className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">Le résultat apparaîtra ici</p>
                    <p className="text-sm text-gray-500 mt-1">Téléchargez vos images et cliquez sur "Générer"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
