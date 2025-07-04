
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

  console.log('🎯 useMessages hook initialized:', JSON.stringify({
    userId: user?.id,
    profileRole: profile?.role,
    conversationsCount: conversations.length,
    messagesCount: messages.length,
    loading,
    timestamp: new Date().toISOString()
  }));

  const fetchConversations = useCallback(async () => {
    console.log('📋 fetchConversations called:', JSON.stringify({
      hasUser: !!user,
      hasProfile: !!profile,
      userId: user?.id,
      profileRole: profile?.role
    }));

    if (!user || !profile) {
      console.log('⚠️ fetchConversations aborted: missing user or profile');
      return;
    }

    try {
      console.log('🔍 Fetching conversations from database...');
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

      console.log('📋 Raw conversations data:', JSON.stringify({
        count: data?.length || 0,
        conversations: data?.map(c => ({
          id: c.id,
          client_id: c.client_id,
          consultant_id: c.consultant_id,
          updated_at: c.updated_at
        }))
      }));

      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUser = conv.client_id === user.id ? conv.consultant : conv.client;
          const otherUserName = `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || 'Utilisateur';

          console.log('👤 Processing conversation:', JSON.stringify({
            conversationId: conv.id,
            currentUserId: user.id,
            clientId: conv.client_id,
            consultantId: conv.consultant_id,
            otherUser: {
              firstName: otherUser.first_name,
              lastName: otherUser.last_name,
              fullName: otherUserName
            }
          }));

          // Get last message
          console.log('💬 Fetching last message for conversation:', conv.id);
          const { data: lastMessage, error: lastMessageError } = await supabase
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

          if (lastMessageError && lastMessageError.code !== 'PGRST116') {
            console.error('❌ Error fetching last message:', JSON.stringify(lastMessageError));
          }

          console.log('💬 Last message result:', JSON.stringify({
            conversationId: conv.id,
            hasLastMessage: !!lastMessage,
            lastMessage: lastMessage ? {
              id: lastMessage.id,
              content: lastMessage.content.substring(0, 50) + '...',
              created_at: lastMessage.created_at,
              sender_id: lastMessage.sender_id
            } : null
          }));

          // Get unread count
          console.log('🔢 Fetching unread count for conversation:', conv.id);
          const { count: unreadCount, error: unreadError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          if (unreadError) {
            console.error('❌ Error fetching unread count:', JSON.stringify(unreadError));
          }

          console.log('🔢 Unread count result:', JSON.stringify({
            conversationId: conv.id,
            unreadCount: unreadCount || 0,
            currentUserId: user.id
          }));

          const processedConversation = {
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

          console.log('✅ Processed conversation:', JSON.stringify({
            id: processedConversation.id,
            otherUserName: processedConversation.other_user_name,
            unreadCount: processedConversation.unread_count,
            hasLastMessage: !!processedConversation.last_message
          }));

          return processedConversation;
        })
      );

      console.log('📋 Setting conversations state:', JSON.stringify({
        totalConversations: conversationsWithDetails.length,
        conversationSummary: conversationsWithDetails.map(c => ({
          id: c.id,
          otherUserName: c.other_user_name,
          unreadCount: c.unread_count
        }))
      }));

      setConversations(conversationsWithDetails);
      console.log('✅ Conversations state updated successfully');
    } catch (error) {
      console.error('❌ useMessages: Error fetching conversations:', JSON.stringify(error));
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 fetchConversations completed, setting loading to false');
      setLoading(false);
    }
  }, [user, profile, toast]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    console.log('💬 fetchMessages called:', JSON.stringify({
      conversationId,
      hasUser: !!user,
      userId: user?.id
    }));

    if (!user) {
      console.log('⚠️ fetchMessages aborted: no user');
      return;
    }

    try {
      console.log('🔍 Fetching messages from database...');
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

      console.log('💬 Raw messages data:', JSON.stringify({
        conversationId,
        messageCount: data?.length || 0,
        messages: data?.map(m => ({
          id: m.id,
          content: m.content.substring(0, 30) + '...',
          sender_id: m.sender_id,
          created_at: m.created_at
        }))
      }));

      const messagesWithSender = (data || []).map(message => ({
        ...message,
        sender_name: `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim() || 'Utilisateur',
        sender_avatar: message.sender.profile_photo_url
      }));

      console.log('💬 Setting messages state:', JSON.stringify({
        conversationId,
        processedMessageCount: messagesWithSender.length
      }));

      setMessages(messagesWithSender);
      console.log('✅ Messages state updated successfully');

      // Mark messages as read
      console.log('📖 Marking messages as read...');
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (updateError) {
        console.error('❌ Error marking messages as read:', JSON.stringify(updateError));
      } else {
        console.log('✅ Messages marked as read successfully');
        // Refresh conversations to update unread counts
        console.log('🔄 Refreshing conversations after marking as read...');
        await fetchConversations();
      }

    } catch (error) {
      console.error('❌ useMessages: Error fetching messages:', JSON.stringify(error));
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    }
  }, [user, toast, fetchConversations]);

  const sendMessage = async (conversationId: string, content: string) => {
    console.log('📤 sendMessage called:', JSON.stringify({
      conversationId,
      contentLength: content.length,
      hasUser: !!user,
      userId: user?.id
    }));

    if (!user || !content.trim()) {
      console.log('⚠️ sendMessage aborted: no user or empty content');
      return;
    }

    try {
      console.log('💾 Inserting message into database...');
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
      console.log('✅ Message inserted successfully');

      // Update conversation's updated_at
      console.log('🔄 Updating conversation timestamp...');
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      console.log('✅ Conversation timestamp updated');
      console.log('🔄 Real-time should handle message updates automatically');

    } catch (error) {
      console.error('❌ useMessages: Error sending message:', JSON.stringify(error));
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  };

  const createConversation = async (otherUserId: string) => {
    console.log('💼 createConversation called:', JSON.stringify({
      otherUserId,
      hasUser: !!user,
      hasProfile: !!profile,
      profileRole: profile?.role
    }));

    if (!user || !profile) {
      console.log('⚠️ createConversation aborted: no user or profile');
      return null;
    }

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

      console.log('👥 Conversation roles determined:', JSON.stringify({
        clientId,
        consultantId,
        currentUserRole: profile.role
      }));

      // Check if conversation already exists
      console.log('🔍 Checking for existing conversation...');
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', clientId)
        .eq('consultant_id', consultantId)
        .single();

      if (existingConv) {
        console.log('✅ Existing conversation found:', existingConv.id);
        return existingConv.id;
      }

      // Create new conversation
      console.log('🆕 Creating new conversation...');
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          client_id: clientId,
          consultant_id: consultantId
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ New conversation created:', data.id);
      await fetchConversations();
      return data.id;

    } catch (error) {
      console.error('❌ useMessages: Error creating conversation:', JSON.stringify(error));
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
    console.log('🔢 Total unread count calculated:', JSON.stringify({
      total,
      conversationBreakdown: conversations.map(c => ({
        id: c.id,
        otherUserName: c.other_user_name,
        unreadCount: c.unread_count
      }))
    }));
    return total;
  }, [conversations]);

  useEffect(() => {
    console.log('🎬 Initial fetchConversations useEffect triggered:', JSON.stringify({
      hasUser: !!user,
      hasProfile: !!profile,
      userId: user?.id,
      profileRole: profile?.role
    }));

    if (user && profile) {
      fetchConversations();
    }
  }, [fetchConversations, user, profile]);

  // Set up real-time subscription for messages
  useEffect(() => {
    console.log('📡 Setting up real-time subscriptions:', JSON.stringify({
      hasUser: !!user,
      userId: user?.id
    }));

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
          console.log('📡 Real-time message INSERT received:', JSON.stringify({
            messageId: payload.new.id,
            conversationId: payload.new.conversation_id,
            senderId: payload.new.sender_id,
            content: payload.new.content.substring(0, 30) + '...',
            currentUserId: user.id,
            isOwnMessage: payload.new.sender_id === user.id
          }));
          
          // Refresh conversations to update unread counts and last message
          console.log('🔄 Refreshing conversations due to new message...');
          await fetchConversations();
          
          // If we're currently viewing this conversation, refresh messages
          if (messages.length > 0 && payload.new.conversation_id === messages[0]?.conversation_id) {
            console.log('🔄 Refreshing current conversation messages...');
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
        async (payload) => {
          console.log('📡 Real-time message UPDATE received:', JSON.stringify({
            messageId: payload.new.id,
            conversationId: payload.new.conversation_id,
            readAt: payload.new.read_at,
            wasRead: !!payload.new.read_at
          }));
          
          // Refresh conversations when messages are marked as read
          console.log('🔄 Refreshing conversations due to message update...');
          await fetchConversations();
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', JSON.stringify(status));
      });

    return () => {
      console.log('📡 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations, fetchMessages, messages]);

  console.log('🎯 useMessages hook returning:', JSON.stringify({
    conversationsCount: conversations.length,
    messagesCount: messages.length,
    loading,
    totalUnreadCount: getTotalUnreadCount()
  }));

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
