
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<{
    email: string;
    consultantFirstName: string;
    consultantLastName: string;
  } | null>(null);

  useEffect(() => {
    if (inviteToken) {
      loadInviteInfo();
    }
  }, [inviteToken]);

  const loadInviteInfo = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_invitation_info', { invite_token: inviteToken });

      if (error) throw error;

      if (data && data.length > 0 && data[0].is_valid) {
        const info = data[0];
        setInviteInfo({
          email: info.email,
          consultantFirstName: info.consultant_first_name,
          consultantLastName: info.consultant_last_name
        });
        setEmail(info.email);
      }
    } catch (error) {
      console.error('Error loading invite info:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations d'invitation",
        variant: "destructive",
      });
    }
  };

  const acceptInvitation = async () => {
    if (!inviteToken) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the invitation details
      const { data: invite, error: inviteError } = await supabase
        .from('client_invites')
        .select('consultant_id')
        .eq('token', inviteToken)
        .single();

      if (inviteError || !invite) {
        throw new Error('Invitation not found');
      }

      // Mark invitation as used
      await supabase
        .from('client_invites')
        .update({ 
          used_by: user.id, 
          used_at: new Date().toISOString() 
        })
        .eq('token', inviteToken);

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
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter l'invitation",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (role: "client" | "consultant") => {
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        });

        // Accept invitation if token is present
        if (inviteToken) {
          await acceptInvitation();
        }
        
        if (role === "client") {
          navigate("/client/dashboard");
        } else {
          navigate("/consultant/dashboard");
        }
      }
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

  const handleKeyPress = (e: React.KeyboardEvent, role: "client" | "consultant") => {
    if (e.key === 'Enter') {
      handleLogin(role);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre adresse email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword(resetEmail);

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email envoyé",
          description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
        });
        setShowResetForm(false);
        setResetEmail("");
      }
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

  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bibabop-cream p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="flex items-center justify-center">
              <img src="/logo.png" alt="Biba-Bop Logo" className="h-16" />
            </Link>
            <p className="text-bibabop-charcoal subtitle mt-4">Réinitialisation du mot de passe</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mot de passe oublié</CardTitle>
              <CardDescription>
                Entrez votre adresse email pour recevoir un lien de réinitialisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                className="w-full btn-primary"
                onClick={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? "Envoi..." : "Envoyer le lien"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowResetForm(false)}
                className="w-full"
              >
                Retour à la connexion
              </Button>
            </CardFooter>
          </Card>
        </div>
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
          <p className="text-bibabop-charcoal subtitle mt-4">Plateforme de Stylisme Intelligent</p>
        </div>

        {inviteInfo && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              Vous avez été invité(e) par <span className="font-medium">
                {inviteInfo.consultantFirstName} {inviteInfo.consultantLastName}
              </span> à rejoindre Biba-Bop en tant que client.
            </p>
          </div>
        )}

        <Tabs defaultValue={inviteToken ? "client" : "client"} className="w-full">
          {!inviteToken && (
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="consultant">Conseiller</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="client">
            <Card>
              <CardHeader>
                <CardTitle>Connexion Client</CardTitle>
                <CardDescription>
                  {inviteToken 
                    ? "Connectez-vous pour accepter l'invitation et accéder à votre espace personnel."
                    : "Accédez à votre espace personnel et découvrez les tenues créées par votre conseiller."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, "client")}
                    readOnly={!!inviteToken}
                    className={inviteToken ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-password">Mot de passe</Label>
                  <Input
                    id="client-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, "client")}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  className="w-full btn-primary"
                  onClick={() => handleLogin("client")}
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
                <div className="flex flex-col gap-2 text-sm text-center text-muted-foreground">
                  <button
                    onClick={() => setShowResetForm(true)}
                    className="text-bibabop-navy hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                  {!inviteToken && (
                    <p>
                      Nouveau client ? <Link to="/register/client" className="text-bibabop-navy font-medium hover:underline">Créer un compte</Link>
                    </p>
                  )}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {!inviteToken && (
            <TabsContent value="consultant">
              <Card>
                <CardHeader>
                  <CardTitle>Connexion Conseiller</CardTitle>
                  <CardDescription>
                    Accédez à votre tableau de bord et gérez vos clients professionnellement.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="consultant-email">Email</Label>
                    <Input
                      id="consultant-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, "consultant")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultant-password">Mot de passe</Label>
                    <Input
                      id="consultant-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, "consultant")}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    className="w-full btn-primary"
                    onClick={() => handleLogin("consultant")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                  <div className="flex flex-col gap-2 text-sm text-center text-muted-foreground">
                    <button
                      onClick={() => setShowResetForm(true)}
                      className="text-bibabop-navy hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                    <p>
                      Nouveau conseiller ? <Link to="/register/consultant" className="text-bibabop-navy font-medium hover:underline">Créer un compte</Link>
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
