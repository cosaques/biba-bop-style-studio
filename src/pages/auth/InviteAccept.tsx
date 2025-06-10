
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const InviteAccept = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkInviteAndRedirect();
  }, [token]);

  const checkInviteAndRedirect = async () => {
    if (!token) {
      setError("Token d'invitation manquant");
      setIsLoading(false);
      return;
    }

    try {
      // Use the helper function to get invitation info
      const { data, error: rpcError } = await supabase
        .rpc('get_invitation_info', { invite_token: token });

      if (rpcError) {
        throw rpcError;
      }

      if (!data || data.length === 0 || !data[0].is_valid) {
        setError("Invitation invalide ou expirée");
        setIsLoading(false);
        return;
      }

      const inviteInfo = data[0];

      // Redirect based on whether profile exists
      if (inviteInfo.profile_exists) {
        navigate(`/login?inviteToken=${token}`);
      } else {
        navigate(`/register/client?inviteToken=${token}`);
      }
    } catch (error) {
      console.error('Error checking invite validity:', error);
      setError("Erreur lors de la vérification de l'invitation");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bibabop-cream p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy mx-auto mb-4"></div>
          <p>Vérification de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bibabop-cream p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Invitation invalide</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/" className="inline-block w-full">
              <button className="w-full btn-primary">
                Retour à l'accueil
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default InviteAccept;
