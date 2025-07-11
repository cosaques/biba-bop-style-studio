
-- First, add the default client relationship for all existing consultants who don't already have it
INSERT INTO public.consultant_clients (consultant_id, client_id)
SELECT 
  p.id as consultant_id,
  '32a7080b-8fbf-4a69-9f92-f40a7ad86889'::uuid as client_id
FROM public.profiles p
WHERE p.role = 'consultant'
  AND NOT EXISTS (
    SELECT 1 
    FROM public.consultant_clients cc 
    WHERE cc.consultant_id = p.id 
      AND cc.client_id = '32a7080b-8fbf-4a69-9f92-f40a7ad86889'::uuid
  );

-- Create a function to automatically assign the default client to new consultants
CREATE OR REPLACE FUNCTION public.assign_default_client_to_consultant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only run for consultant profiles
  IF NEW.role = 'consultant' THEN
    -- Insert the default client relationship
    INSERT INTO public.consultant_clients (consultant_id, client_id)
    VALUES (NEW.id, '32a7080b-8fbf-4a69-9f92-f40a7ad86889'::uuid)
    ON CONFLICT (consultant_id, client_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a trigger that fires after a new profile is inserted
CREATE TRIGGER on_consultant_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_client_to_consultant();
