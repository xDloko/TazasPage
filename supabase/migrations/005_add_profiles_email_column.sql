-- Migration: Add email column to profiles
-- The handle_new_user trigger inserts new.email into profiles, but the column
-- was missing, causing "Database error saving new user" on signup.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;