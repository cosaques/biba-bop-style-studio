
-- First, create a security definer function to safely check consultant-client relationships
CREATE OR REPLACE FUNCTION public.is_consultant_client_relationship(consultant_id uuid, client_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.consultant_clients 
    WHERE consultant_clients.consultant_id = consultant_id 
    AND consultant_clients.client_id = client_id
  );
$$;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile and consultants can view clients" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own client_profile and consultants can view clients" ON public.client_profiles;

-- Create new policies using the security definer function
CREATE POLICY "Users can view own profile and consultants can view clients" ON public.profiles
  FOR SELECT 
  USING (
    -- Allow users to view their own profile
    auth.uid() = profiles.id
    OR
    -- Allow consultants to view their clients' profiles (using security definer function)
    public.is_consultant_client_relationship(auth.uid(), profiles.id)
  );

CREATE POLICY "Users can view own client_profile and consultants can view clients" ON public.client_profiles
  FOR SELECT 
  USING (
    -- Allow users to view their own client profile
    auth.uid() = client_profiles.user_id
    OR
    -- Allow consultants to view their clients' client profiles (using security definer function)
    public.is_consultant_client_relationship(auth.uid(), client_profiles.user_id)
  );
