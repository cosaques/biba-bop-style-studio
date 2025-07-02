
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  sender_name: string;
  sender_avatar?: string;
}

export interface Conversation {
  id: string;
  client_id: string;
  consultant_id: string;
  created_at: string;
  updated_at: string;
  other_user_name: string;
  other_user_avatar?: string;
  last_message?: Message;
  unread_count: number;
}

export const useMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          client:profiles!client_id (
            first_name,
            last_name,
            profile_photo_url
          ),
          consultant:profiles!consultant_id (
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUser = conv.client_id === user.id ? conv.consultant : conv.client;
          const otherUserName = `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || 'Utilisateur';

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!sender_id (
                first_name,
                last_name,
                profile_photo_url
              )
            `)
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...conv,
            other_user_name: otherUserName,
            other_user_avatar: otherUser.profile_photo_url,
            last_message: lastMessage ? {
              ...lastMessage,
              sender_name: `${lastMessage.sender.first_name || ''} ${lastMessage.sender.last_name || ''}`.trim() || 'Utilisateur',
              sender_avatar: lastMessage.sender.profile_photo_url
            } : undefined,
            unread_count: unreadCount || 0
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id (
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messagesWithSender = (data || []).map(message => ({
        ...message,
        sender_name: `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim() || 'Utilisateur',
        sender_avatar: message.sender.profile_photo_url
      }));

      setMessages(messagesWithSender);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Refresh messages
      await fetchMessages(conversationId);
      await fetchConversations();

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  };

  const createConversation = async (otherUserId: string) => {
    if (!user) return null;

    try {
      const clientId = user.id;
      const consultantId = otherUserId;

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(client_id.eq.${clientId},consultant_id.eq.${consultantId}),and(client_id.eq.${consultantId},consultant_id.eq.${clientId})`)
        .single();

      if (existingConv) {
        return existingConv.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          client_id: clientId,
          consultant_id: consultantId
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data.id;

    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive",
      });
      return null;
    }
  };

  const getTotalUnreadCount = useCallback(() => {
    return conversations.reduce((total, conv) => total + conv.unread_count, 0);
  }, [conversations]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [fetchConversations, user]);

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  return {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    getTotalUnreadCount
  };
};
