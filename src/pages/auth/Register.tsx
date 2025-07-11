import { useState, useEffect } from "react";
import { useNavigate, Link, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [inviteInfo, setInviteInfo] = useState<{
    email: string;
    consultantFirstName: string;
    consultantLastName: string;
  } | null>(null);

  const isClient = role === "client";
  const isConsultant = role === "consultant";

  console.log("Register component loaded with role:", role);

  if (!isClient && !isConsultant) {
    console.log("Invalid role, redirecting to home");
    navigate("/");
    return null;
  }

  useEffect(() => {
    if (inviteToken && isClient) {
      loadInviteInfo();
    }
  }, [inviteToken, isClient]);

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
        setFormData(prev => ({ ...prev, email: info.email }));
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Adresse email invalide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submission started for role:", role);

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setIsLoading(true);
    console.log("Starting signup process...");

    try {
      const { error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: role
      });

      console.log("SignUp result - error:", error);

      if (error) {
        console.error("Signup error:", error);
        if (error.message.includes('User already registered')) {
          toast({
            title: "Compte existant",
            description: "Un compte avec cette adresse email existe déjà. Essayez de vous connecter.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur d'inscription",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        console.log("Signup successful! Processing post-signup actions...");
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès. Vérifiez votre email pour confirmer votre compte.",
        });

        // Accept invitation if token is present for client
        if (inviteToken && isClient) {
          console.log("Processing client invitation...");
          await acceptInvitation();
        }

        console.log("About to redirect...");
        if (isClient) {
          console.log("Redirecting client to onboarding");
          navigate("/client/onboarding");
        } else if (isConsultant) {
          console.log("Redirecting consultant to dashboard");
          navigate("/consultant/dashboard");
        }
        console.log("Redirect command executed");
      }
    } catch (error) {
      console.error("Unexpected error during signup:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log("Signup process completed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bibabop-cream p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center">
            <img src="/logo.png" alt="Biba-Bop Logo" className="h-16" />
          </Link>
          <p className="text-bibabop-charcoal subtitle mt-4">Plateforme de Stylisme Intelligent</p>
        </div>

        {inviteInfo && isClient && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              Vous avez été invité(e) par <span className="font-medium">
                {inviteInfo.consultantFirstName} {inviteInfo.consultantLastName}
              </span> à rejoindre Biba-Bop en tant que client.
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {isClient ? "Inscription Client" : "Inscription Conseiller"}
            </CardTitle>
            <CardDescription>
              {isClient
                ? inviteToken 
                  ? "Créez votre compte pour rejoindre votre conseiller en image"
                  : "Créez votre compte pour bénéficier de conseils de style personnalisés"
                : "Créez votre compte conseiller pour gérer vos clients et créer des tenues"
              }
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Votre prénom"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && <p className="text-destructive text-sm">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Votre nom"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && <p className="text-destructive text-sm">{errors.lastName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive" : ""}
                  readOnly={!!inviteToken}
                  disabled={!!inviteToken}
                />
                {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              {isConsultant && (
                <div className="p-4 bg-bibabop-lightgrey rounded-md">
                  <p className="text-sm">
                    En tant que conseiller, vous pourrez gérer plusieurs clients, créer des tenues personnalisées et donner des conseils de style professionnels.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Création du compte..." : "Créer mon compte"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Vous avez déjà un compte?{" "}
                <Link 
                  to={inviteToken ? `/login?inviteToken=${inviteToken}` : "/login"} 
                  className="text-bibabop-navy font-medium hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
