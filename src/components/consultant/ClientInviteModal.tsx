
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Mail } from "lucide-react";

interface ClientInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientInviteModal({ open, onOpenChange }: ClientInviteModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [showLink, setShowLink] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create the invitation
      const { data, error } = await supabase
        .from('client_invites')
        .insert({
          email,
          consultant_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select('token')
        .single();

      if (error) {
        throw error;
      }

      // Generate the invite link
      const link = `${window.location.origin}/invite/${data.token}`;
      setInviteLink(link);
      setShowLink(true);

      toast({
        title: "Invitation créée",
        description: "L'invitation a été générée avec succès",
      });
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Copié",
        description: "Le lien d'invitation a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const sendByEmail = () => {
    const subject = "Invitation à rejoindre Biba-Bop";
    const body = `Bonjour,\n\nVous avez été invité(e) à rejoindre Biba-Bop en tant que client.\n\nCliquez sur ce lien pour accepter l'invitation :\n${inviteLink}\n\nCe lien expire dans 7 jours.\n\nCordialement`;
    
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleClose = () => {
    setEmail("");
    setInviteLink("");
    setShowLink(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inviter un nouveau client</DialogTitle>
          <DialogDescription>
            Entrez l'adresse email du client que vous souhaitez inviter.
          </DialogDescription>
        </DialogHeader>

        {!showLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email du client</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? "Création..." : "Créer l'invitation"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lien d'invitation généré</Label>
              <div className="flex space-x-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Ce lien expire dans 7 jours. Vous pouvez le copier ou l'envoyer par email.
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={sendByEmail}
                className="w-full sm:w-auto"
              >
                <Mail className="h-4 w-4 mr-2" />
                Envoyer par email
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                className="btn-primary w-full sm:w-auto"
              >
                Terminé
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
