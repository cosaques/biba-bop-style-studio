import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageCircle } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useUnreadCountPolling } from "@/hooks/useUnreadCountPolling";
import { NewMessageModal } from "@/components/shared/NewMessageModal";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const Messages = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { conversations, loading } = useMessages();
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const { totalUnreadCount } = useUnreadCountPolling();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bibabop-navy mx-auto mb-4"></div>
          <p>Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Messages</h1>
          {totalUnreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {totalUnreadCount}
            </Badge>
          )}
        </div>
        <Button 
          onClick={() => setIsNewMessageModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau message
        </Button>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune conversation</h3>
            <p className="text-muted-foreground mb-4">
              Commencez une nouvelle conversation pour échanger avec vos {profile?.role === 'consultant' ? 'clients' : 'conseillers'}.
            </p>
            <Button 
              onClick={() => setIsNewMessageModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Démarrer une conversation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => {
            const otherUser = profile?.role === 'consultant' 
              ? conversation.client 
              : conversation.consultant;
            
            const unreadCount = conversation.messages?.filter(
              msg => !msg.read_at && msg.sender_id !== profile?.id
            ).length || 0;

            return (
              <Card 
                key={conversation.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`messages/${conversation.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-bibabop-navy rounded-full flex items-center justify-center text-white font-medium">
                        {otherUser?.first_name?.[0] || '?'}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {otherUser?.first_name} {otherUser?.last_name}
                        </h3>
                        {conversation.messages && conversation.messages[0] && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {conversation.messages[0].content}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                      {conversation.messages && conversation.messages[0] && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.messages[0].created_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <NewMessageModal 
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
      />
    </div>
  );
};

export default Messages;
