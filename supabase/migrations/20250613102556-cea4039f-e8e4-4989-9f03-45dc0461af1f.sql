
-- Drop the existing table and policies to recreate with correct structure
DROP TABLE IF EXISTS public.clothing_items CASCADE;

-- Create the clothing_items table with reference to profiles table
CREATE TABLE public.clothing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('top', 'bottom', 'one_piece', 'shoes', 'outerwear', 'accessory')),
  color TEXT NOT NULL DEFAULT 'other' CHECK (color IN ('black', 'grey', 'white', 'beige', 'brown', 'pink', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'other')),
  season TEXT NOT NULL DEFAULT 'all' CHECK (season IN ('all', 'spring', 'summer', 'autumn', 'winter')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;

-- Create policies for clothing_items
CREATE POLICY "Users can view their own clothing items and consultants can view clients items" 
  ON public.clothing_items 
  FOR SELECT 
  USING (
    auth.uid() = user_id
    OR
    public.is_consultant_client_relationship(auth.uid(), user_id)
  );

CREATE POLICY "Users can create their own clothing items" 
  ON public.clothing_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clothing items" 
  ON public.clothing_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clothing items" 
  ON public.clothing_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Drop existing storage bucket if it exists
DELETE FROM storage.buckets WHERE id = 'clothing-images';

-- Create storage bucket for clothing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('clothing-images', 'clothing-images', true);

-- Create storage policies for clothing images
CREATE POLICY "Users can upload their own clothing images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clothing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users and their consultants can view clothing images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'clothing-images' AND
    (
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id::text = (storage.foldername(name))[1]
        AND public.is_consultant_client_relationship(auth.uid(), p.id)
      )
    )
  );

CREATE POLICY "Users can update their own clothing images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'clothing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own clothing images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'clothing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
