-- ═══════════════════════════════════════════════════════════════════════════
-- REGGY — Row Level Security (RLS) Policies
-- Voer dit uit in de Supabase SQL Editor (Settings > SQL Editor)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Helper functie: haal account_id op van de ingelogde gebruiker ───────
CREATE OR REPLACE FUNCTION public.get_my_account_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT account_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ─── Helper functie: haal role op van de ingelogde gebruiker ─────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ─── Helper functie: haal branch op van de ingelogde gebruiker ──────────
CREATE OR REPLACE FUNCTION public.get_my_branch()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT branch FROM public.profiles WHERE id = auth.uid();
$$;


-- ═══════════════════════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Iedereen kan hun eigen profiel lezen
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Master/superadmin kan alle profielen van hun account zien
CREATE POLICY "profiles_select_account"
  ON public.profiles FOR SELECT
  USING (
    account_id = public.get_my_account_id()
    OR public.get_my_role() = 'superadmin'
  );

-- Gebruiker kan eigen profiel updaten
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Master kan profielen aanmaken voor hun account
CREATE POLICY "profiles_insert_master"
  ON public.profiles FOR INSERT
  WITH CHECK (
    account_id = public.get_my_account_id()
    AND (public.get_my_role() = 'master' OR public.get_my_role() = 'superadmin')
  );

-- Master kan branch profielen verwijderen van hun account
CREATE POLICY "profiles_delete_master"
  ON public.profiles FOR DELETE
  USING (
    account_id = public.get_my_account_id()
    AND role = 'branch'
    AND (public.get_my_role() = 'master' OR public.get_my_role() = 'superadmin')
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- ACCOUNTS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Gebruiker kan alleen hun eigen account zien
CREATE POLICY "accounts_select_own"
  ON public.accounts FOR SELECT
  USING (
    id = public.get_my_account_id()
    OR public.get_my_role() = 'superadmin'
  );

-- Alleen master/superadmin kan account updaten
CREATE POLICY "accounts_update_own"
  ON public.accounts FOR UPDATE
  USING (
    id = public.get_my_account_id()
    AND (public.get_my_role() = 'master' OR public.get_my_role() = 'superadmin')
  );

-- Iedereen kan een nieuw account aanmaken (registratie)
CREATE POLICY "accounts_insert"
  ON public.accounts FOR INSERT
  WITH CHECK (true);

-- Alleen superadmin kan accounts verwijderen
CREATE POLICY "accounts_delete_superadmin"
  ON public.accounts FOR DELETE
  USING (public.get_my_role() = 'superadmin');


-- ═══════════════════════════════════════════════════════════════════════════
-- TRANSACTIONS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Master kan alle transacties van hun account zien
-- Branch kan alleen transacties van hun eigen branch zien
CREATE POLICY "transactions_select"
  ON public.transactions FOR SELECT
  USING (
    account_id = public.get_my_account_id()
    AND (
      public.get_my_role() IN ('master', 'superadmin')
      OR branch = public.get_my_branch()
    )
  );

-- Branch kan transacties toevoegen voor hun branch
-- Master kan voor alle branches toevoegen
CREATE POLICY "transactions_insert"
  ON public.transactions FOR INSERT
  WITH CHECK (
    account_id = public.get_my_account_id()
    AND (
      public.get_my_role() IN ('master', 'superadmin')
      OR branch = public.get_my_branch()
    )
  );

-- Zelfde logica voor updates
CREATE POLICY "transactions_update"
  ON public.transactions FOR UPDATE
  USING (
    account_id = public.get_my_account_id()
    AND (
      public.get_my_role() IN ('master', 'superadmin')
      OR branch = public.get_my_branch()
    )
  );

-- Zelfde logica voor deletes
CREATE POLICY "transactions_delete"
  ON public.transactions FOR DELETE
  USING (
    account_id = public.get_my_account_id()
    AND (
      public.get_my_role() IN ('master', 'superadmin')
      OR branch = public.get_my_branch()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- EMBALLAGE_TYPES
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.emballage_types ENABLE ROW LEVEL SECURITY;

-- Alle gebruikers van een account kunnen emballage types zien
CREATE POLICY "emballage_types_select"
  ON public.emballage_types FOR SELECT
  USING (account_id = public.get_my_account_id());

-- Alleen master kan emballage types beheren
CREATE POLICY "emballage_types_insert"
  ON public.emballage_types FOR INSERT
  WITH CHECK (
    account_id = public.get_my_account_id()
    AND public.get_my_role() IN ('master', 'superadmin')
  );

CREATE POLICY "emballage_types_update"
  ON public.emballage_types FOR UPDATE
  USING (
    account_id = public.get_my_account_id()
    AND public.get_my_role() IN ('master', 'superadmin')
  );

CREATE POLICY "emballage_types_delete"
  ON public.emballage_types FOR DELETE
  USING (
    account_id = public.get_my_account_id()
    AND public.get_my_role() IN ('master', 'superadmin')
  );

-- Iedereen mag insert bij registratie (voor default types)
CREATE POLICY "emballage_types_insert_registration"
  ON public.emballage_types FOR INSERT
  WITH CHECK (true);


-- ═══════════════════════════════════════════════════════════════════════════
-- SUPPLIERS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_select"
  ON public.suppliers FOR SELECT
  USING (account_id = public.get_my_account_id());

CREATE POLICY "suppliers_insert"
  ON public.suppliers FOR INSERT
  WITH CHECK (
    account_id = public.get_my_account_id()
    AND public.get_my_role() IN ('master', 'superadmin')
  );

-- Registratie flow mag ook suppliers inserten
CREATE POLICY "suppliers_insert_registration"
  ON public.suppliers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "suppliers_delete"
  ON public.suppliers FOR DELETE
  USING (
    account_id = public.get_my_account_id()
    AND public.get_my_role() IN ('master', 'superadmin')
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- BRANCHES
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branches_select"
  ON public.branches FOR SELECT
  USING (account_id = public.get_my_account_id());

CREATE POLICY "branches_insert"
  ON public.branches FOR INSERT
  WITH CHECK (
    account_id = public.get_my_account_id()
    AND public.get_my_role() IN ('master', 'superadmin')
  );

CREATE POLICY "branches_delete"
  ON public.branches FOR DELETE
  USING (
    account_id = public.get_my_account_id()
    AND public.get_my_role() IN ('master', 'superadmin')
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT_LOG
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select"
  ON public.audit_log FOR SELECT
  USING (
    public.get_my_role() IN ('master', 'superadmin')
  );

CREATE POLICY "audit_log_insert"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);


-- ═══════════════════════════════════════════════════════════════════════════
-- DONE! Alle tabellen zijn nu beveiligd met RLS.
-- ═══════════════════════════════════════════════════════════════════════════
