
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Conversation() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations, messages, loading, fetchMessages, sendMessage } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find(c => c.id === conversationId);

  console.log('Conversation: Component mounted with:', JSON.stringify({ 
    conversationId, 
    userId: user?.id, 
    userRole: user?.role,
    conversationsCount: conversations.length,
    messagesCount: messages.length,
    foundConversation: !!conversation
  }));

  useEffect(() => {
    if (conversationId) {
      console.log('Conversation: Fetching messages for conversation:', JSON.stringify({ conversationId }));
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || sending) return;

    console.log('Conversation: Sending message:', JSON.stringify({ conversationId, message: newMessage }));
    setSending(true);
    await sendMessage(conversationId, newMessage);
    setNewMessage('');
    setSending(false);
  };

  const handleBack = () => {
    const baseRoute = user?.role === 'consultant' ? '/consultant/dashboard' : '/client/dashboard';
    const targetRoute = `${baseRoute}/messages`;
    console.log('Conversation: Navigating back to:', JSON.stringify({ targetRoute }));
    navigate(targetRoute);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy"></div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    console.log('Conversation: No conversation found for ID:', JSON.stringify({ conversationId }));
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Conversation introuvable</p>
            <Button onClick={handleBack} className="mt-4">
              Retour aux messages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Conversation: Rendering conversation with messages:', JSON.stringify({ 
    conversationId: conversation.id,
    messagesCount: messages.length,
    messages: messages.map(m => ({ id: m.id, content: m.content, sender_id: m.sender_id }))
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[800px] p-6">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Avatar>
              <AvatarImage src={conversation.other_user_avatar} />
              <AvatarFallback>
                {conversation.other_user_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <CardTitle className="text-bibabop-navy">
              {conversation.other_user_name}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Aucun message dans cette conversation
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                console.log('Conversation: Rendering message:', JSON.stringify({ 
                  messageId: message.id, 
                  senderId: message.sender_id, 
                  userId: user?.id, 
                  isOwn,
                  content: message.content 
                }));
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwn
                          ? 'bg-bibabop-navy text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-white/70' : 'text-gray-500'
                        }`}
                      >
                        {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                disabled={sending}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="btn-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
