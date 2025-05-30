
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function AccountDeletionForm() {
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      return;
    }

    setIsLoading(true);
    try {
      // Delete profile photo from storage if it exists
      if (profile?.profile_photo_url) {
        const photoUrl = profile.profile_photo_url;
        const urlParts = photoUrl.split('/storage/v1/object/public/profile-photos/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          console.log('Attempting to delete file:', filePath);

          const { error: storageError } = await supabase.storage
            .from('profile-photos')
            .remove([filePath]);

          if (storageError) {
            console.error('Error deleting photo:', storageError);
          }
        }
      }

      // Use the new RPC function to completely delete the account
      const { error } = await supabase.rpc('delete_user_account');

      if (error) {
        console.error('Error deleting account:', error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la suppression du compte",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès",
      });

      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression du compte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supprimer le compte</CardTitle>
        <CardDescription>
          Supprimez définitivement votre compte et toutes vos données
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          onClick={handleDeleteAccount}
          disabled={isLoading}
        >
          {isLoading ? "Suppression..." : "Supprimer mon compte"}
        </Button>
      </CardContent>
    </Card>
  );
}
