
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
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  console.log('🎯 useMessages hook initialized:', JSON.stringify({
    userId: user?.id,
    profileRole: profile?.role,
    conversationsCount: conversations.length,
    messagesCount: messages.length,
    loading,
    currentConversationId
  }));

  const fetchConversations = useCallback(async () => {
    if (!user || !profile) return;

    console.log('📋 fetchConversations called');

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

      console.log('📋 Raw conversations data:', JSON.stringify({ count: data?.length || 0 }));

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

      console.log('✅ Conversations fetched:', conversationsWithDetails.length);
      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile?.role, toast]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    console.log('💬 fetchMessages called for:', conversationId);
    setCurrentConversationId(conversationId);

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

      console.log('✅ Messages fetched:', messagesWithSender.length);
      setMessages(messagesWithSender);

      // Mark messages as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (!updateError) {
        console.log('✅ Messages marked as read');
        // Update conversations to reflect read status
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        ));
      }

    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    console.log('📤 Sending message...');

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      console.log('✅ Message sent successfully');

      // Immediately refresh messages for current conversation
      if (currentConversationId === conversationId) {
        await fetchMessages(conversationId);
      }

    } catch (error) {
      console.error('❌ Error sending message:', error);
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
      console.error('❌ Error creating conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive",
      });
      return null;
    }
  };

  const getTotalUnreadCount = useCallback(() => {
    const total = conversations.reduce((total, conv) => total + conv.unread_count, 0);
    console.log('🔢 Total unread count:', total);
    return total;
  }, [conversations]);

  // Initial fetch
  useEffect(() => {
    console.log('🎬 Initial fetchConversations useEffect triggered');
    if (user && profile) {
      fetchConversations();
    }
  }, [user?.id, profile?.role, fetchConversations]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;
    
    console.log('📡 Setting up real-time subscriptions');
    
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
          console.log('📡 Real-time message INSERT received:', payload.new.id);
          
          // Refresh conversations to update unread counts and last message
          await fetchConversations();
          
          // If we're currently viewing this conversation, refresh messages
          if (currentConversationId && payload.new.conversation_id === currentConversationId) {
            console.log('🔄 Refreshing messages for current conversation');
            await fetchMessages(currentConversationId);
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
          console.log('📡 Real-time message UPDATE received');
          // Refresh conversations when messages are marked as read
          await fetchConversations();
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
      });

    return () => {
      console.log('📡 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchConversations, fetchMessages, currentConversationId]);

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
