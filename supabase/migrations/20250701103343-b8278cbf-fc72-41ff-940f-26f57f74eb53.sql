
-- Create outfits table
CREATE TABLE public.outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  comments TEXT,
  image_url TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outfit_clothing_items junction table
CREATE TABLE public.outfit_clothing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES public.clothing_items(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(outfit_id, clothing_item_id)
);

-- Add RLS policies for outfits table
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

-- Consultants can view outfits for their clients
CREATE POLICY "Consultants can view their client outfits" 
  ON public.outfits 
  FOR SELECT 
  USING (
    consultant_id = auth.uid() OR 
    client_id = auth.uid()
  );

-- Consultants can create outfits for their clients
CREATE POLICY "Consultants can create outfits for their clients" 
  ON public.outfits 
  FOR INSERT 
  WITH CHECK (
    consultant_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.consultant_clients 
      WHERE consultant_id = auth.uid() AND client_id = outfits.client_id
    )
  );

-- Consultants can update outfits for their clients
CREATE POLICY "Consultants can update their client outfits" 
  ON public.outfits 
  FOR UPDATE 
  USING (consultant_id = auth.uid());

-- Consultants can delete outfits for their clients
CREATE POLICY "Consultants can delete their client outfits" 
  ON public.outfits 
  FOR DELETE 
  USING (consultant_id = auth.uid());

-- Add RLS policies for outfit_clothing_items table
ALTER TABLE public.outfit_clothing_items ENABLE ROW LEVEL SECURITY;

-- Allow access to outfit clothing items if user has access to the outfit
CREATE POLICY "Users can view outfit clothing items" 
  ON public.outfit_clothing_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.outfits 
      WHERE id = outfit_id AND (consultant_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- Allow consultants to create outfit clothing items
CREATE POLICY "Consultants can create outfit clothing items" 
  ON public.outfit_clothing_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.outfits 
      WHERE id = outfit_id AND consultant_id = auth.uid()
    )
  );

-- Allow consultants to update outfit clothing items
CREATE POLICY "Consultants can update outfit clothing items" 
  ON public.outfit_clothing_items 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.outfits 
      WHERE id = outfit_id AND consultant_id = auth.uid()
    )
  );

-- Allow consultants to delete outfit clothing items
CREATE POLICY "Consultants can delete outfit clothing items" 
  ON public.outfit_clothing_items 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.outfits 
      WHERE id = outfit_id AND consultant_id = auth.uid()
    )
  );

-- Create storage bucket for outfit images
INSERT INTO storage.buckets (id, name, public)
VALUES ('outfit-images', 'outfit-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for outfit images
CREATE POLICY "Authenticated users can upload outfit images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'outfit-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Public can view outfit images"
ON storage.objects FOR SELECT
USING (bucket_id = 'outfit-images');

CREATE POLICY "Users can update their outfit images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'outfit-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their outfit images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'outfit-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
