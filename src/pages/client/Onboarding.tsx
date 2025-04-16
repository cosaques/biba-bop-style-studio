
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gender, UserProfile } from "@/types";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);
    
    // Simulation de traitement du formulaire et génération de silhouette
    setTimeout(() => {
      // Normalement ici on enverrait les données au serveur pour générer la silhouette
      setIsLoading(false);
      navigate("/client/dashboard");
    }, 1500);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const renderGenderDisplay = () => {
    if (!formData.gender) return "";
    
    switch(formData.gender) {
      case "homme": return "Homme";
      case "femme": return "Femme";
      case "autre": return "Autre";
      default: return "";
    }
  };

  const shouldShowBustSizeInput = () => {
    return step === 5 && formData.gender === "femme";
  };

  const shouldShowRecapInfo = () => {
    return step === 5 && formData.gender && formData.gender !== "femme";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bibabop-cream p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-bibabop-navy mb-2">Bienvenue sur Biba-Bop</h1>
          <p className="subtitle">Quelques questions pour personnaliser votre expérience</p>
        </div>
        
        <Card className="w-full animate-fade-in">
          <CardHeader>
            <CardTitle>Étape {step} sur 5</CardTitle>
            <CardDescription>
              {step === 1 && "Quel est votre genre ?"}
              {step === 2 && "Quel est votre âge ?"}
              {step === 3 && "Quelle est votre taille (en cm) ?"}
              {step === 4 && "Quel est votre poids (en kg) ?"}
              {shouldShowBustSizeInput() && "Quel est votre tour de poitrine (en cm) ?"}
              {shouldShowRecapInfo() && "Récapitulatif de vos informations"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 1 && (
              <RadioGroup 
                value={formData.gender as Gender | undefined}
                onValueChange={(value: Gender) => updateFormData("gender", value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="homme" id="homme" />
                  <Label htmlFor="homme">Homme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="femme" id="femme" />
                  <Label htmlFor="femme">Femme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="autre" id="autre" />
                  <Label htmlFor="autre">Autre / Je préfère ne pas préciser</Label>
                </div>
              </RadioGroup>
            )}
            
            {step === 2 && (
              <div className="space-y-2">
                <Label htmlFor="age">Âge</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="120"
                  value={formData.age || ""}
                  onChange={(e) => updateFormData("age", parseInt(e.target.value))}
                />
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-2">
                <Label htmlFor="height">Taille (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="120"
                  max="250"
                  value={formData.height || ""}
                  onChange={(e) => updateFormData("height", parseInt(e.target.value))}
                />
              </div>
            )}
            
            {step === 4 && (
              <div className="space-y-2">
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="30"
                  max="250"
                  value={formData.weight || ""}
                  onChange={(e) => updateFormData("weight", parseInt(e.target.value))}
                />
              </div>
            )}
            
            {shouldShowBustSizeInput() && (
              <div className="space-y-2">
                <Label htmlFor="bustSize">Tour de poitrine (cm)</Label>
                <Input
                  id="bustSize"
                  type="number"
                  min="60"
                  max="150"
                  value={formData.bustSize || ""}
                  onChange={(e) => updateFormData("bustSize", parseInt(e.target.value))}
                />
              </div>
            )}
            
            {shouldShowRecapInfo() && (
              <Alert className="bg-bibabop-lightgrey">
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Genre :</strong> {renderGenderDisplay()}</p>
                    <p><strong>Âge :</strong> {formData.age} ans</p>
                    <p><strong>Taille :</strong> {formData.height} cm</p>
                    <p><strong>Poids :</strong> {formData.weight} kg</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              disabled={step === 1 || isLoading}
            >
              Précédent
            </Button>
            
            <Button 
              className="btn-primary"
              onClick={handleNextStep}
              disabled={
                (step === 1 && !formData.gender) ||
                (step === 2 && !formData.age) ||
                (step === 3 && !formData.height) ||
                (step === 4 && !formData.weight) ||
                (shouldShowBustSizeInput() && !formData.bustSize) ||
                isLoading
              }
            >
              {step < 5 ? 'Suivant' : isLoading ? 'Création de votre silhouette...' : 'Terminer'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
