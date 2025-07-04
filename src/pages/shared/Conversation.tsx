
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useMessages } from '@/hooks/useMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessageGroup {
  date: string;
  messages: Array<{
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    read_at?: string;
    sender_name: string;
    sender_avatar?: string;
  }>;
}

export default function Conversation() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const { conversations, messages, loading, fetchMessages, sendMessage } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('🎬 Conversation component render:', JSON.stringify({
    conversationId,
    userId: user?.id,
    messagesCount: messages.length,
    loading
  }));

  // Find conversation
  const conversation = conversations.find(c => c.id === conversationId);

  useEffect(() => {
    console.log('📥 fetchMessages useEffect triggered for:', conversationId);
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    console.log('📜 Auto-scroll useEffect triggered, messages count:', messages.length);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Send message initiated');
    if (!newMessage.trim() || !conversationId || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, newMessage);
      console.log('✅ Message sent successfully');
      setNewMessage('');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    const baseRoute = profile?.role === 'consultant' ? '/consultant/dashboard' : '/client/dashboard';
    const targetRoute = `${baseRoute}/messages`;
    console.log('🔙 Navigating back to:', targetRoute);
    navigate(targetRoute);
  };

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return 'Aujourd\'hui';
    } else if (isYesterday(date)) {
      return 'Hier';
    } else {
      return format(date, 'dd MMMM yyyy', { locale: fr });
    }
  };

  const groupMessagesByDate = (messageList: typeof messages): MessageGroup[] => {
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;

    messageList.forEach(message => {
      const messageDate = new Date(message.created_at);
      const dateString = formatMessageDate(messageDate);

      if (!currentGroup || currentGroup.date !== dateString) {
        currentGroup = { date: dateString, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(message);
    });

    return groups;
  };

  // Show loading initially
  if (loading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bibabop-navy"></div>
        </div>
      </div>
    );
  }

  // Show conversation not found if no conversation exists
  if (!conversation) {
    console.log('❌ Conversation not found');
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

  const messageGroups = groupMessagesByDate(messages);
  console.log('🎨 Rendering conversation with', messageGroups.length, 'message groups');

  return (
    <div className="h-screen flex flex-col p-6">
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="border-b flex-shrink-0">
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

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <ScrollArea className="flex-1 p-4">
            {messageGroups.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Aucun message dans cette conversation
              </div>
            ) : (
              <div className="space-y-6">
                {messageGroups.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                        {group.date}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {group.messages.map((message) => {
                        const isOwn = message.sender_id === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isOwn
                                  ? 'bg-bibabop-pink text-white'
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
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="border-t p-4 flex-shrink-0">
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
