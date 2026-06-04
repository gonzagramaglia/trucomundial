-- Run this in the Supabase SQL Editor to sync custom_usernames to the profiles table
UPDATE profiles p
SET username = u.raw_user_meta_data->>'custom_username'
FROM auth.users u
WHERE p.id = u.id
AND u.raw_user_meta_data->>'custom_username' IS NOT NULL
AND p.username != u.raw_user_meta_data->>'custom_username';

-- Also, if there is a trigger that creates new profiles, you might want to update it to use custom_username if available:
-- (This is just an example of what the trigger function might look like if you need to update it)
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER SET search_path = public
-- AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, username, avatar_url)
--   VALUES (
--     new.id,
--     COALESCE(new.raw_user_meta_data->>'custom_username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
--     new.raw_user_meta_data->>'avatar_url'
--   );
--   RETURN new;
-- END;
-- $$;
