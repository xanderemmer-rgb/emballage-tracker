-- Reggy: Add logo columns for company and branch personalization
-- Run this in your Supabase SQL Editor

-- Add logo_url column to accounts table (stores base64 data URL)
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add branch_logo_url column to profiles table (stores base64 data URL per branch user)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch_logo_url TEXT;
