
-- First, let's see what policies exist by dropping the ones we just created that are causing conflicts
DROP POLICY IF EXISTS "Consultants can view their clients' profiles" ON public.profiles;
DROP POLICY IF EXISTS "Consultants can view their clients' client_profiles" ON public.client_profiles;

-- Now let's drop the existing self-access policies so we can recreate them with consultant access included
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own client profile" ON public.client_profiles;

-- Create comprehensive policies that handle both self-access and consultant-client access
CREATE POLICY "Users can view own profile and consultants can view clients" ON public.profiles
  FOR SELECT 
  USING (
    -- Allow users to view their own profile
    auth.uid() = profiles.id
    OR
    -- Allow consultants to view their clients' profiles
    EXISTS (
      SELECT 1 FROM public.consultant_clients 
      WHERE consultant_clients.consultant_id = auth.uid() 
      AND consultant_clients.client_id = profiles.id
    )
  );

CREATE POLICY "Users can view own client_profile and consultants can view clients" ON public.client_profiles
  FOR SELECT 
  USING (
    -- Allow users to view their own client profile
    auth.uid() = client_profiles.user_id
    OR
    -- Allow consultants to view their clients' client profiles
    EXISTS (
      SELECT 1 FROM public.consultant_clients 
      WHERE consultant_clients.consultant_id = auth.uid() 
      AND consultant_clients.client_id = client_profiles.user_id
    )
  );
