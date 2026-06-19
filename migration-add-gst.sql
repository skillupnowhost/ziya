-- ═══════════════════════════════════════════════════════════════
--  Migration: Add GST support
--  Run this in Supabase SQL Editor to add GST columns
-- ═══════════════════════════════════════════════════════════════

-- Add gst_enabled to products (default: true)
ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_enabled BOOLEAN NOT NULL DEFAULT true;

-- Add GST fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cgst NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sgst NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst  NUMERIC NOT NULL DEFAULT 0;
