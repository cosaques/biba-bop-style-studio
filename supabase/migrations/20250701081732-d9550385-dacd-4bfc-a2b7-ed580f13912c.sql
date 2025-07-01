
-- Create a table to link clothing items from consultants to specific clients
CREATE TABLE public.client_clothing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  clothing_item_id UUID REFERENCES public.clothing_items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, clothing_item_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.client_clothing_items ENABLE ROW LEVEL SECURITY;

-- Create policies for client_clothing_items using the existing security definer function
CREATE POLICY "Users can view their own linked clothing items and consultants can view clients items" 
  ON public.client_clothing_items 
  FOR SELECT 
  USING (
    -- Allow clients to view their own linked items
    auth.uid() = client_id
    OR
    -- Allow consultants to view their clients' linked clothing items
    public.is_consultant_client_relationship(auth.uid(), client_id)
  );

CREATE POLICY "Consultants can create clothing item links for their clients" 
  ON public.client_clothing_items 
  FOR INSERT 
  WITH CHECK (
    public.is_consultant_client_relationship(auth.uid(), client_id)
  );

CREATE POLICY "Consultants can delete clothing item links for their clients" 
  ON public.client_clothing_items 
  FOR DELETE 
  USING (
    public.is_consultant_client_relationship(auth.uid(), client_id)
  );

-- Update the existing clothing_items policy to allow clients to see their consultant's items
DROP POLICY IF EXISTS "Users can view their own clothing items and consultants can view clients items" ON public.clothing_items;

CREATE POLICY "Users can view their own clothing items and consultants can view clients items and clients can view consultants items" 
  ON public.clothing_items 
  FOR SELECT 
  USING (
    -- Allow users to view their own clothing items
    auth.uid() = user_id
    OR
    -- Allow consultants to view their clients' clothing items
    public.is_consultant_client_relationship(auth.uid(), user_id)
    OR
    -- Allow clients to view their consultants' clothing items
    public.is_consultant_client_relationship(user_id, auth.uid())
  );
