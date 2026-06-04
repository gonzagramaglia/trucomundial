-- Run this in the Supabase SQL Editor to force update everyone's username to custom_username or email prefix
UPDATE profiles p
SET username = COALESCE(
  u.raw_user_meta_data->>'custom_username',
  split_part(u.email, '@', 1)
)
FROM auth.users u
WHERE p.id = u.id;
