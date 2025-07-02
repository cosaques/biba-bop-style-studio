
-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, consultant_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on conversations table
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on messages table  
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view conversations they are part of"
  ON public.conversations
  FOR SELECT
  USING (
    auth.uid() = client_id OR 
    auth.uid() = consultant_id
  );

CREATE POLICY "Consultants can create conversations with their clients"
  ON public.conversations
  FOR INSERT
  WITH CHECK (
    (auth.uid() = consultant_id AND is_consultant_client_relationship(auth.uid(), client_id)) OR
    (auth.uid() = client_id AND is_consultant_client_relationship(consultant_id, auth.uid()))
  );

-- RLS policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.client_id = auth.uid() OR conversations.consultant_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.client_id = auth.uid() OR conversations.consultant_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.client_id = auth.uid() OR conversations.consultant_id = auth.uid())
    )
  );

-- Add indexes for performance
CREATE INDEX idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX idx_conversations_consultant_id ON public.conversations(consultant_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Enable realtime for messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
