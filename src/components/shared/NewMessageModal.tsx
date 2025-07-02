
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface NewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ContactOption {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export function NewMessageModal({ open, onOpenChange }: NewMessageModalProps) {
  const { user } = useAuth();
  const { createConversation } = useMessages();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchContacts();
    }
  }, [open, user]);

  const fetchContacts = async () => {
    if (!user) return;

    try {
      let query;
      
      if (user.role === 'consultant') {
        // Fetch consultant's clients
        query = supabase
          .from('consultant_clients')
          .select(`
            client_id,
            client:profiles!client_id (
              id,
              first_name,
              last_name,
              profile_photo_url,
              role
            )
          `)
          .eq('consultant_id', user.id);
      } else {
        // Fetch client's consultants
        query = supabase
          .from('consultant_clients')
          .select(`
            consultant_id,
            consultant:profiles!consultant_id (
              id,
              first_name,
              last_name,
              profile_photo_url,
              role
            )
          `)
          .eq('client_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const contactOptions = (data || []).map(item => {
        const profile = user.role === 'consultant' ? item.client : item.consultant;
        return {
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur',
          avatar: profile.profile_photo_url,
          role: profile.role
        };
      });

      setContacts(contactOptions);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleStartConversation = async () => {
    if (!selectedContact) return;

    setLoading(true);
    const conversationId = await createConversation(selectedContact);
    
    if (conversationId) {
      const baseRoute = user?.role === 'consultant' ? '/consultant/dashboard' : '/client/dashboard';
      navigate(`${baseRoute}/messages/${conversationId}`);
      onOpenChange(false);
      setSelectedContact('');
    }
    setLoading(false);
  };

  const selectedContactData = contacts.find(c => c.id === selectedContact);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {user?.role === 'consultant' 
                ? 'Aucun client trouvé. Invitez des clients pour commencer à échanger.'
                : 'Aucun conseiller trouvé. Votre conseiller pourra vous contacter directement.'
              }
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium">Destinataire:</label>
                <Select value={selectedContact} onValueChange={setSelectedContact}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner un destinataire..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback className="text-xs">
                              {contact.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{contact.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({contact.role === 'consultant' ? 'Conseiller' : 'Client'})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedContactData && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={selectedContactData.avatar} />
                      <AvatarFallback>
                        {selectedContactData.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedContactData.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedContactData.role === 'consultant' ? 'Conseiller en image' : 'Client'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleStartConversation}
                  disabled={!selectedContact || loading}
                  className="btn-primary"
                >
                  {loading ? 'Création...' : 'Commencer la conversation'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
