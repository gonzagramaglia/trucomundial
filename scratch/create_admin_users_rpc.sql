-- Ejecuta este script en el SQL Editor de tu panel de Supabase
-- Esto creará una función segura que solo los administradores pueden usar para leer los correos.

CREATE OR REPLACE FUNCTION get_admin_users_data()
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    username VARCHAR,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.email::VARCHAR,
        p.username::VARCHAR,
        au.created_at,
        au.last_sign_in_at
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id;
END;
$$;
