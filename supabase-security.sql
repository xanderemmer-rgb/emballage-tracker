-- ═══════════════════════════════════════════════════════════════════════════════
-- REGGY: Supabase Security Setup
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- ────────── 1. CREATE CONTACT_REQUESTS TABLE ──────────
CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text DEFAULT 'general',
  outlets integer,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Allow anonymous inserts (from landing page) but no reads
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact requests" ON contact_requests;
CREATE POLICY "Anyone can insert contact requests" ON contact_requests
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only superadmin can read contact requests" ON contact_requests;
CREATE POLICY "Only superadmin can read contact requests" ON contact_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
  );


-- ────────── 2. RLS POLICIES FOR ACCOUNTS ──────────
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Superadmin can do everything
DROP POLICY IF EXISTS "Superadmin full access on accounts" ON accounts;
CREATE POLICY "Superadmin full access on accounts" ON accounts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
  );

-- Users can only see their own account
DROP POLICY IF EXISTS "Users see own account" ON accounts;
CREATE POLICY "Users see own account" ON accounts
  FOR SELECT USING (
    id IN (SELECT account_id FROM profiles WHERE profiles.id = auth.uid())
  );


-- ────────── 3. RLS POLICIES FOR PROFILES ──────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Superadmin can see all profiles
DROP POLICY IF EXISTS "Superadmin full access on profiles" ON profiles;
CREATE POLICY "Superadmin full access on profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'superadmin')
  );

-- Users can see profiles in their own account
DROP POLICY IF EXISTS "Users see own account profiles" ON profiles;
CREATE POLICY "Users see own account profiles" ON profiles
  FOR SELECT USING (
    account_id IN (SELECT account_id FROM profiles WHERE profiles.id = auth.uid())
  );

-- Users can update their own profile
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Allow insert during registration (user creates own profile)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());


-- ────────── 4. RLS POLICIES FOR TRANSACTIONS ──────────
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Superadmin can see all transactions
DROP POLICY IF EXISTS "Superadmin full access on transactions" ON transactions;
CREATE POLICY "Superadmin full access on transactions" ON transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
  );

-- Users can only see transactions in their own account
DROP POLICY IF EXISTS "Users see own account transactions" ON transactions;
CREATE POLICY "Users see own account transactions" ON transactions
  FOR SELECT USING (
    account_id IN (SELECT account_id FROM profiles WHERE profiles.id = auth.uid())
  );

-- Users can insert transactions in their own account
DROP POLICY IF EXISTS "Users insert own account transactions" ON transactions;
CREATE POLICY "Users insert own account transactions" ON transactions
  FOR INSERT WITH CHECK (
    account_id IN (SELECT account_id FROM profiles WHERE profiles.id = auth.uid())
  );

-- Users can update/delete transactions in their own account
DROP POLICY IF EXISTS "Users modify own account transactions" ON transactions;
CREATE POLICY "Users modify own account transactions" ON transactions
  FOR UPDATE USING (
    account_id IN (SELECT account_id FROM profiles WHERE profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "Users delete own account transactions" ON transactions;
CREATE POLICY "Users delete own account transactions" ON transactions
  FOR DELETE USING (
    account_id IN (SELECT account_id FROM profiles WHERE profiles.id = auth.uid())
  );


-- ────────── 5. RLS POLICIES FOR EMBALLAGE_TYPES ──────────
ALTER TABLE emballage_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin full access on emballage_types" ON emballage_types;
CREATE POLICY "Superadmin full access on emballage_types" ON emballage_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
  );

DROP POLICY IF EXISTS "Users manage own account emballage" ON emballage_types;
CREATE POLICY "Users manage own account emballage" ON emballage_types
  FOR ALL USING (
    account_id IN (SELECT account_id FROM profiles WHERE profiles.id = auth.uid())
  );


-- ────────── 6. RLS POLICIES FOR SUPPLIERS ──────────
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin full access on suppliers" ON suppliers;
CREATE POLICY "Superadmin full access on suppliers" ON suppliers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
  );

DROP POLICY IF EXISTS "Users manage own account suppliers" ON suppliers;
CREATE POLICY "Users manage own account suppliers" ON suppliers
  FOR ALL USING (
    account_id IN (SELECT account_id FROM profiles WHERE profiles.id = auth.uid())
  );


-- ────────── 7. RLS POLICIES FOR BRANCHES ──────────
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin full access on branches" ON branches;
CREATE POLICY "Superadmin full access on branches" ON branches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
  );

DROP POLICY IF EXISTS "Users manage own account branches" ON branches;
CREATE POLICY "Users manage own account branches" ON branches
  FOR ALL USING (
    account_id IN (SELECT account_id FROM profiles WHERE profiles.id = auth.uid())
  );


-- ────────── 8. DEFAULT_SUPPLIER_EMBALLAGE (public read, superadmin write) ──────────
ALTER TABLE default_supplier_emballage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read default catalog" ON default_supplier_emballage;
CREATE POLICY "Anyone can read default catalog" ON default_supplier_emballage
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Superadmin manages default catalog" ON default_supplier_emballage;
CREATE POLICY "Superadmin manages default catalog" ON default_supplier_emballage
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE! All tables are now secured with Row Level Security.
--
-- Summary:
-- • contact_requests: anyone can insert, only superadmin can read
-- • accounts: users see own, superadmin sees all
-- • profiles: users see own account, update own, superadmin sees all
-- • transactions: users CRUD own account, superadmin sees all
-- • emballage_types: users CRUD own account, superadmin sees all
-- • suppliers: users CRUD own account, superadmin sees all
-- • branches: users CRUD own account, superadmin sees all
-- • default_supplier_emballage: anyone can read, superadmin can write
-- ═══════════════════════════════════════════════════════════════════════════════
