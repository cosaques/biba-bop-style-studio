-- Rollback script for consultant-client invitation feature

-- Remove relationship table first due to foreign key constraints
DROP TABLE IF EXISTS public.consultant_clients CASCADE;
DROP TABLE IF EXISTS public.client_invites CASCADE;
