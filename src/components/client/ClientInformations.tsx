
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientProfile } from "@/hooks/useClientProfile";
import { PhotoSection } from "./profile/PhotoSection";
import { InformationDisplay } from "./profile/InformationDisplay";
import { InformationEditForm } from "./profile/InformationEditForm";

export function ClientInformations() {
  const [showEditForm, setShowEditForm] = useState(false);
  const { loading } = useClientProfile();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Informations</CardTitle>
        <CardDescription>
          Détails utilisés pour générer votre silhouette
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showEditForm ? (
          <InformationEditForm onCancel={() => setShowEditForm(false)} />
        ) : (
          <div className="space-y-4">
            <PhotoSection />
            <InformationDisplay />
          </div>
        )}
      </CardContent>
      {!showEditForm && (
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowEditForm(true)}
          >
            Modifier mes informations
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
