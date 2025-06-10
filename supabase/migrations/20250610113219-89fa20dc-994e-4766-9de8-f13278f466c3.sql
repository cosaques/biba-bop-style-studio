
-- Drop the incorrect policy
DROP POLICY IF EXISTS "Clients can update invites when accepting" ON public.client_invites;

-- Allow clients to update invitation records when their email matches
CREATE POLICY "Clients can update invites for their email" ON public.client_invites
  FOR UPDATE 
  USING (
    -- Allow clients to update if their authenticated email matches the invitation email
    (SELECT email FROM auth.users WHERE id = auth.uid()) = client_invites.email
  )
  WITH CHECK (
    -- Same check for the update
    (SELECT email FROM auth.users WHERE id = auth.uid()) = client_invites.email
  );
