
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const InviteAccept = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    checkInviteValidity();
  }, [token]);

  const checkInviteValidity = async () => {
    if (!token) {
      setInviteValid(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('client_invites')
        .select('email, expires_at, used_at')
        .eq('token', token)
        .single();

      if (error || !data) {
        setInviteValid(false);
        return;
      }

      // Check if invite is expired or already used
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt || data.used_at) {
        setInviteValid(false);
        return;
      }

      setEmail(data.email);
      setInviteValid(true);

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single();

      setIsExistingUser(!!existingUser);
    } catch (error) {
      console.error('Error checking invite validity:', error);
      setInviteValid(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await acceptInvitation();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        role: 'client'
      });
      
      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await acceptInvitation();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async () => {
    try {
      // Get the invitation details
      const { data: invite, error: inviteError } = await supabase
        .from('client_invites')
        .select('consultant_id')
        .eq('token', token)
        .single();

      if (inviteError || !invite) {
        throw new Error('Invitation not found');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Mark invitation as used
      await supabase
        .from('client_invites')
        .update({ 
          used_by: user.id, 
          used_at: new Date().toISOString() 
        })
        .eq('token', token);

      // Create consultant-client relationship
      await supabase
        .from('consultant_clients')
        .insert({
          consultant_id: invite.consultant_id,
          client_id: user.id
        });

      toast({
        title: "Invitation acceptée",
        description: "Vous avez été associé avec succès à votre conseiller en image",
      });

      navigate('/client/dashboard');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter l'invitation",
        variant: "destructive",
      });
    }
  };

  if (inviteValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bibabop-cream p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy mx-auto mb-4"></div>
          <p>Vérification de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (inviteValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bibabop-cream p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Invitation invalide</CardTitle>
            <CardDescription>
              Cette invitation n'est plus valide ou a expiré.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bibabop-cream p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center">
            <img src="/logo.png" alt="Biba-Bop Logo" className="h-16" />
          </Link>
          <p className="text-bibabop-charcoal subtitle mt-4">Invitation client</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isExistingUser ? 'Connexion' : 'Créer votre compte'}
            </CardTitle>
            <CardDescription>
              {isExistingUser 
                ? 'Connectez-vous pour accepter l\'invitation'
                : 'Créez votre compte pour rejoindre votre conseiller en image'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isExistingUser ? handleLogin : handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="bg-muted"
                />
              </div>

              {!isExistingUser && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isExistingUser && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={isLoading}
              >
                {isLoading 
                  ? "Traitement..." 
                  : isExistingUser 
                    ? "Se connecter et accepter" 
                    : "Créer le compte et accepter"
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteAccept;
