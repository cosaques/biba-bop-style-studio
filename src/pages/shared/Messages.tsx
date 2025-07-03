import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useMessages } from '@/hooks/useMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { NewMessageModal } from '@/components/shared/NewMessageModal';

export default function Messages() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { conversations, loading, getTotalUnreadCount } = useMessages();
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

  const getBaseRoute = () => {
    if (!profile) return '';
    return profile.role === 'consultant' ? '/consultant/dashboard' : '/client/dashboard';
  };

  console.log('Messages: Component rendering with:', JSON.stringify({
    userId: user?.id,
    userRole: user?.role,
    conversationsCount: conversations.length,
    baseRoute: getBaseRoute()
  }));

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bibabop-navy">Messages</h1>
          <p className="subtitle">Vos conversations</p>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-bibabop-navy">Messages</h1>
          <p className="subtitle">Vos conversations</p>
        </div>
        <Button onClick={() => setIsNewMessageModalOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau message
        </Button>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Aucune conversation pour le moment</p>
            <Button onClick={() => setIsNewMessageModalOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Commencer une conversation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => {
            const conversationLink = `${getBaseRoute()}/messages/${conversation.id}`;
            console.log('Messages: Creating link for conversation:', JSON.stringify({
              conversationId: conversation.id,
              link: conversationLink
            }));
            
            return (
              <Link
                key={conversation.id}
                to={conversationLink}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={conversation.other_user_avatar} />
                        <AvatarFallback>
                          {conversation.other_user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-bibabop-navy truncate">
                            {conversation.other_user_name}
                          </h3>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        
                        {conversation.last_message && (
                          <div className="mt-1">
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.last_message.sender_id === user?.id ? 'Vous: ' : ''}
                              {conversation.last_message.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(conversation.last_message.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <NewMessageModal
        open={isNewMessageModalOpen}
        onOpenChange={setIsNewMessageModalOpen}
      />
    </div>
  );
}
