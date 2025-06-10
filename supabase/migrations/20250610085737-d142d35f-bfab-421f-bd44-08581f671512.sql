
-- Allow clients to insert into consultant_clients when accepting invites
DROP POLICY IF EXISTS "Consultants can create client relationships" ON public.consultant_clients;

CREATE POLICY "Consultants and clients can create relationships" ON public.consultant_clients
  FOR INSERT WITH CHECK (
    -- Consultants can create relationships
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'consultant'
      AND profiles.id = consultant_clients.consultant_id
    )
    OR
    -- Clients can create relationships for themselves
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'client'
      AND profiles.id = consultant_clients.client_id
    )
  );

-- Create a helper function to check invitation validity and get consultant info
-- This function is accessible to unauthenticated users
CREATE OR REPLACE FUNCTION public.get_invitation_info(invite_token UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  email TEXT,
  consultant_first_name TEXT,
  consultant_last_name TEXT,
  profile_exists BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record RECORD;
  profile_count INTEGER;
BEGIN
  -- Get invitation details
  SELECT 
    ci.email,
    ci.expires_at,
    ci.used_at,
    p.first_name,
    p.last_name
  INTO invite_record
  FROM public.client_invites ci
  JOIN public.profiles p ON p.id = ci.consultant_id
  WHERE ci.token = invite_token;

  -- Check if invitation exists and is valid
  IF invite_record IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
    RETURN;
  END IF;

  -- Check if invitation is expired or used
  IF invite_record.expires_at < NOW() OR invite_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
    RETURN;
  END IF;

  -- Check if profile exists for this email
  SELECT COUNT(*) INTO profile_count
  FROM public.profiles
  WHERE email = invite_record.email;

  -- Return invitation info
  RETURN QUERY SELECT 
    TRUE,
    invite_record.email,
    invite_record.first_name,
    invite_record.last_name,
    (profile_count > 0);
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.get_invitation_info(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invitation_info(UUID) TO authenticated;
