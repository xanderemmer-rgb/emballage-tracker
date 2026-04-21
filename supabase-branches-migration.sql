-- Reggy: Separate branches from users
-- Branches are now a first-class entity, users are assigned to branches
-- Run this in your Supabase SQL Editor

-- 1. Create branches table
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies for branches
DROP POLICY IF EXISTS branches_select ON public.branches;
CREATE POLICY branches_select ON public.branches FOR SELECT
  USING (account_id = get_my_account_id());

DROP POLICY IF EXISTS branches_insert ON public.branches;
CREATE POLICY branches_insert ON public.branches FOR INSERT
  WITH CHECK (account_id = get_my_account_id());

DROP POLICY IF EXISTS branches_update ON public.branches;
CREATE POLICY branches_update ON public.branches FOR UPDATE
  USING (account_id = get_my_account_id());

DROP POLICY IF EXISTS branches_delete ON public.branches;
CREATE POLICY branches_delete ON public.branches FOR DELETE
  USING (account_id = get_my_account_id());

-- 4. Add new profile fields for extended user info
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- 5. Add max_users_per_branch to accounts (default 2)
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS max_users_per_branch INTEGER DEFAULT 2;
