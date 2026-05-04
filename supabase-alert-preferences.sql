-- Alert preferences table for email notifications
CREATE TABLE IF NOT EXISTS alert_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  email text,
  email_enabled boolean DEFAULT false,
  config jsonb DEFAULT '{"inactiveBranches":true,"highSupplierSaldo":true,"negativeBalance":true,"noWeeklyActivity":true,"unusualVolume":true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id)
);

ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own alert preferences" ON alert_preferences
  FOR ALL USING (account_id = public.get_my_account_id());

CREATE POLICY "Superadmin full access on alert_preferences" ON alert_preferences
  FOR ALL USING (public.is_superadmin());
