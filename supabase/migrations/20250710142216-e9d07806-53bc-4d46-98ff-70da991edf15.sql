
-- Créer une fonction pour l'authentification admin temporaire
CREATE OR REPLACE FUNCTION public.admin_impersonate_user(
  user_email text,
  admin_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  target_user_data json;
BEGIN
  -- Vérifier le mot de passe admin temporaire
  IF admin_password != 'super-admin-mdp' THEN
    RAISE EXCEPTION 'Mot de passe administrateur incorrect';
  END IF;
  
  -- Trouver l'utilisateur par email dans la table profiles
  SELECT id INTO target_user_id
  FROM public.profiles
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé avec cet email: %', user_email;
  END IF;
  
  -- Récupérer les données de l'utilisateur
  SELECT json_build_object(
    'id', p.id,
    'email', p.email,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'role', p.role,
    'profile_photo_url', p.profile_photo_url
  ) INTO target_user_data
  FROM public.profiles p
  WHERE p.id = target_user_id;
  
  -- Log de l'impersonation pour audit
  INSERT INTO public.admin_logs (action, details, created_at)
  VALUES (
    'user_impersonation',
    json_build_object(
      'target_user_id', target_user_id,
      'target_email', user_email,
      'timestamp', now()
    ),
    now()
  );
  
  RETURN target_user_data;
END;
$$;

-- Créer une table pour logger les actions admin (pour audit)
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details json,
  created_at timestamp with time zone DEFAULT now()
);

-- Activer RLS sur admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Seuls les super admins peuvent voir les logs (pour le moment, pas de politique restrictive)
CREATE POLICY "Admin logs are private" ON public.admin_logs FOR ALL USING (false);
