
import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useClientInvite } from "@/hooks/useClientInvite";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserProfile } from "@/types";

// Données fictives pour la démo
const mockClients: UserProfile[] = [
  {
    id: "client1",
    gender: "femme",
    age: 32,
    height: 168,
    weight: 62,
    bustSize: 90,
    silhouette: "/looks/look-0.png",
    name: "Sophie Martin",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    id: "client2",
    gender: "homme",
    age: 42,
    height: 182,
    weight: 78,
    silhouette: "/looks/look-0.png",
    name: "Thomas Dubois",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    id: "client3",
    gender: "femme",
    age: 28,
    height: 165,
    weight: 58,
    bustSize: 85,
    silhouette: "/looks/look-0.png",
    name: "Amélie Petit",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&h=150&auto=format&fit=crop"
  }
];

const ConsultantMain = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const { createInvite, loading } = useClientInvite();
  const { toast } = useToast();

  const filteredClients = mockClients.filter((client) =>
    client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async () => {
    if (!email) {
      toast({ title: "Erreur", description: "Veuillez entrer un email", variant: "destructive" });
      return;
    }
    const { error, token } = await createInvite(email);
    if (error) {
      toast({ title: "Erreur", description: error.message || String(error), variant: "destructive" });
    } else if (token) {
      setInviteLink(`${window.location.origin}/invite/${token}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bibabop-navy">Mon espace personnel</h1>
          <p className="subtitle">Gérez vos clients et créez des tenues professionnelles</p>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Carte pour ajouter un client */}
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <div className="w-16 h-16 mb-4 rounded-full bg-bibabop-navy flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Nouveau Client</h3>
              <p className="text-center text-muted-foreground text-sm mb-4">
                Ajoutez un nouveau client à votre portefeuille
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="btn-primary">Ajouter un client</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Inviter un client</DialogTitle>
                    <DialogDescription>
                      Saisissez l&apos;email du client pour générer un lien d&apos;invitation.
                    </DialogDescription>
                  </DialogHeader>
                  {inviteLink ? (
                    <div className="space-y-4">
                      <p className="text-sm break-all">{inviteLink}</p>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(inviteLink);
                          toast({ title: 'Lien copié' });
                        }}
                        className="btn-primary"
                      >
                        Copier le lien
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Input
                        type="email"
                        placeholder="email@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <DialogFooter>
                        <Button onClick={handleInvite} disabled={loading} className="btn-primary w-full">
                          {loading ? 'Envoi...' : 'Générer le lien'}
                        </Button>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Liste des clients */}
          {filteredClients.map((client) => (
            <Card key={client.id} className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={client.avatar} alt={client.name || `Client ${client.id}`} />
                    <AvatarFallback>{client.name?.charAt(0) || client.id.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {client.name || `Client ${client.id.replace("client", "")}`}
                </CardTitle>
                <CardDescription>
                  {client.gender === "femme" ? "Femme" : "Homme"}, {client.age} ans
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Taille: {client.height} cm</p>
                  <p>Poids: {client.weight} kg</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link to={`/consultant/client/${client.id}`}>Détails</Link>
                </Button>
                <Button className="btn-primary" asChild>
                  <Link to={`/consultant/outfit-creator?clientId=${client.id}`}>Créer une tenue</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsultantMain;
