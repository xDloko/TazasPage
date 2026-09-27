-- Migration: Create profiles table trigger on user signup
-- Creates a profile row with role='customer' when a new user signs up

-- First ensure profiles table exists (should already exist from previous migrations)
-- The profiles table already exists per lib/types.ts and migration 002

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'customer',  -- default role
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- Drop existing trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a function to manually promote a user to admin
-- Usage: SELECT promote_to_admin('user-uuid-here');
CREATE OR REPLACE FUNCTION public.promote_to_admin(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = p_user_id;
END;
$$;