
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (role: "client" | "consultant") => {
    setIsLoading(true);
    
    // Simulation d'une connexion
    setTimeout(() => {
      setIsLoading(false);
      
      if (role === "client") {
        navigate("/client/dashboard");
      } else {
        navigate("/consultant/dashboard");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bibabop-cream p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-bibabop-navy mb-2">Biba-Bop</h1>
          <p className="text-bibabop-charcoal subtitle">Plateforme de Stylisme Intelligent</p>
        </div>
        
        <Tabs defaultValue="client" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="client">Client</TabsTrigger>
            <TabsTrigger value="consultant">Consultant</TabsTrigger>
          </TabsList>
          
          <TabsContent value="client">
            <Card>
              <CardHeader>
                <CardTitle>Connexion Client</CardTitle>
                <CardDescription>
                  Accédez à votre espace personnel et découvrez les tenues créées par votre consultant.
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-password">Mot de passe</Label>
                  <Input
                    id="client-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <p className="text-sm text-center text-muted-foreground">
                  Nouveau client ? <Link to="/register/client" className="text-bibabop-navy font-medium hover:underline">Créer un compte</Link>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="consultant">
            <Card>
              <CardHeader>
                <CardTitle>Connexion Consultant</CardTitle>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultant-password">Mot de passe</Label>
                  <Input
                    id="consultant-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <p className="text-sm text-center text-muted-foreground">
                  Nouveau consultant ? <Link to="/register/consultant" className="text-bibabop-navy font-medium hover:underline">Créer un compte</Link>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
