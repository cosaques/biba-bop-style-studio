
-- Create function to get unread message count for a user
CREATE OR REPLACE FUNCTION public.get_user_unread_count(user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(COUNT(*)::INTEGER, 0)
  FROM messages m
  JOIN conversations c ON c.id = m.conversation_id
  WHERE m.sender_id != user_id
    AND m.read_at IS NULL
    AND (c.client_id = user_id OR c.consultant_id = user_id);
$$;
