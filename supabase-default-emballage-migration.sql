-- Default supplier emballage catalog (managed by superadmin)
-- This table stores the default emballage items per supplier that new customers can import

CREATE TABLE IF NOT EXISTS default_supplier_emballage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  emballage_name TEXT NOT NULL,
  value NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(supplier_name, emballage_name)
);

-- No RLS needed — superadmin reads directly, customers read via a function or public read
ALTER TABLE default_supplier_emballage ENABLE ROW LEVEL SECURITY;

-- Everyone can read defaults (they're global catalog data)
CREATE POLICY "default_emballage_read" ON default_supplier_emballage
  FOR SELECT USING (true);

-- Only superadmin can insert/update/delete (via service role or direct SQL)
-- For now we allow authenticated users to read, superadmin manages via the panel
CREATE POLICY "default_emballage_write" ON default_supplier_emballage
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Seed with Hanos defaults
INSERT INTO default_supplier_emballage (supplier_name, emballage_name, value) VALUES
  ('Hanos', 'Bierkrat (24 flesjes)', 3.90),
  ('Hanos', 'Bierkrat (12 flesjes)', 3.90),
  ('Hanos', 'Frisdrankbak', 4.20),
  ('Hanos', 'Fustje 20L', 30.00),
  ('Hanos', 'Fustje 50L', 75.00),
  ('Hanos', 'Rolcontainer', 75.00),
  ('Hanos', 'Pallet (Europallet)', 25.00),
  ('Hanos', 'Melkkrat', 5.00),
  ('Hanos', 'Broodkrat', 5.00),
  ('Hanos', 'Groentebak', 3.50),
  ('Hanos', 'Viskist (EPS)', 2.50),
  ('Hanos', 'Dolly (transportkar)', 50.00)
ON CONFLICT (supplier_name, emballage_name) DO NOTHING;
