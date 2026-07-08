-- ═══════════════════════════════════════════════════════════════
--  Migration: Link admin_notifications to products
--  Run this in Supabase SQL Editor.
--  Lets the app auto-clear "out of stock" notifications once a
--  product is restocked.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE admin_notifications
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_admin_notifications_product
  ON admin_notifications (product_id)
  WHERE product_id IS NOT NULL;
