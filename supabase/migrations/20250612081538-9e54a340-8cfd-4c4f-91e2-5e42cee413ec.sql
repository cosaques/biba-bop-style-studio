
-- Allow consultants to view profiles of their clients
CREATE POLICY "Consultants can view their clients' profiles" ON public.profiles
  FOR SELECT 
  USING (
    -- Check if the authenticated user is a consultant who has this user as a client
    EXISTS (
      SELECT 1 FROM public.consultant_clients 
      WHERE consultant_clients.consultant_id = auth.uid() 
      AND consultant_clients.client_id = profiles.id
    )
  );

-- Allow consultants to view client_profiles of their clients
CREATE POLICY "Consultants can view their clients' client_profiles" ON public.client_profiles
  FOR SELECT 
  USING (
    -- Check if the authenticated user is a consultant who has this user as a client
    EXISTS (
      SELECT 1 FROM public.consultant_clients 
      WHERE consultant_clients.consultant_id = auth.uid() 
      AND consultant_clients.client_id = client_profiles.user_id
    )
  );
