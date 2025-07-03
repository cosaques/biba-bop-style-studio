
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
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
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user || !profile) return;

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
      console.error('useMessages: Error fetching conversations:', JSON.stringify({ error: error.message }));
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, profile, toast]);

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
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (updateError) {
        console.error('useMessages: Error marking messages as read:', JSON.stringify({ error: updateError.message }));
      } else {
        // Refresh conversations to update unread counts
        await fetchConversations();
      }

    } catch (error) {
      console.error('useMessages: Error fetching messages:', JSON.stringify({ error: error.message }));
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    }
  }, [user, toast, fetchConversations]);

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

      // Don't manually refresh - let real-time handle it

    } catch (error) {
      console.error('useMessages: Error sending message:', JSON.stringify({ error: error.message }));
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  };

  const createConversation = async (otherUserId: string) => {
    if (!user || !profile) return null;

    try {
      // Determine client and consultant IDs
      let clientId, consultantId;
      
      if (profile.role === 'consultant') {
        consultantId = user.id;
        clientId = otherUserId;
      } else {
        clientId = user.id;
        consultantId = otherUserId;
      }

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', clientId)
        .eq('consultant_id', consultantId)
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
      console.error('useMessages: Error creating conversation:', JSON.stringify({ error: error.message }));
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
    if (user && profile) {
      fetchConversations();
    }
  }, [fetchConversations, user, profile]);

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
        async (payload) => {
          // Refresh conversations to update unread counts and last message
          await fetchConversations();
          
          // If we're currently viewing this conversation, refresh messages
          if (messages.length > 0 && payload.new.conversation_id === messages[0]?.conversation_id) {
            await fetchMessages(payload.new.conversation_id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        async () => {
          // Refresh conversations when messages are marked as read
          await fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations, fetchMessages, messages]);

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
