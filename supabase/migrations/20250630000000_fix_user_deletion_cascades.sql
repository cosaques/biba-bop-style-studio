
-- Fix foreign key constraints to allow cascade deletion of users

-- Drop existing foreign key constraints that prevent cascade deletion
ALTER TABLE public.client_invites DROP CONSTRAINT IF EXISTS client_invites_consultant_id_fkey;
ALTER TABLE public.client_invites DROP CONSTRAINT IF EXISTS client_invites_used_by_fkey;

ALTER TABLE public.consultant_clients DROP CONSTRAINT IF EXISTS consultant_clients_consultant_id_fkey;
ALTER TABLE public.consultant_clients DROP CONSTRAINT IF EXISTS consultant_clients_client_id_fkey;

ALTER TABLE public.client_profiles DROP CONSTRAINT IF EXISTS client_profiles_user_id_fkey;

ALTER TABLE public.clothing_items DROP CONSTRAINT IF EXISTS clothing_items_user_id_fkey;

-- Recreate foreign key constraints with CASCADE DELETE
ALTER TABLE public.client_invites 
ADD CONSTRAINT client_invites_consultant_id_fkey 
FOREIGN KEY (consultant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.client_invites 
ADD CONSTRAINT client_invites_used_by_fkey 
FOREIGN KEY (used_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.consultant_clients 
ADD CONSTRAINT consultant_clients_consultant_id_fkey 
FOREIGN KEY (consultant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.consultant_clients 
ADD CONSTRAINT consultant_clients_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.client_profiles 
ADD CONSTRAINT client_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.clothing_items 
ADD CONSTRAINT clothing_items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update the delete_user_account function to handle the new cascade structure
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_uuid UUID;
BEGIN
  -- Get the current user's ID
  user_uuid := auth.uid();
  
  -- Check if user is authenticated
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to delete account';
  END IF;
  
  -- The CASCADE DELETE constraints will automatically handle:
  -- - client_invites (both consultant_id and used_by references)
  -- - consultant_clients (both consultant_id and client_id references)
  -- - client_profiles (user_id reference)
  -- - clothing_items (user_id reference)
  
  -- Delete from profiles (this will cascade to all related tables)
  DELETE FROM public.profiles WHERE id = user_uuid;
  
  -- Delete from auth.users (this will cascade to related auth tables)
  DELETE FROM auth.users WHERE id = user_uuid;
END;
$function$;
