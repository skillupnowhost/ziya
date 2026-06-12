-- ─────────────────────────────────────────────────────────────
--  Ziya E-Commerce — Supabase PostgreSQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

-- ── Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tables ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name              TEXT        NOT NULL,
  email             TEXT        NOT NULL UNIQUE,
  password          TEXT        NOT NULL,
  role              TEXT        DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  phone             TEXT,
  avatar            TEXT,
  addresses         JSONB       DEFAULT '[]'::jsonb,
  default_address   INTEGER     DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id               UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT           NOT NULL,
  description      TEXT           NOT NULL,
  category         TEXT           NOT NULL CHECK (category IN ('accessories','dresses','stationery','beauty','gifts')),
  subcategory      TEXT,
  price            NUMERIC(10,2)  NOT NULL CHECK (price >= 0),
  discount_price   NUMERIC(10,2)  CHECK (discount_price >= 0),
  stock            INTEGER        NOT NULL DEFAULT 0,
  sizes            TEXT[]         DEFAULT '{}',
  colors           TEXT[]         DEFAULT '{}',
  images           TEXT[]         DEFAULT '{}',
  tags             TEXT[]         DEFAULT '{}',
  sku              TEXT           UNIQUE,
  brand            TEXT           DEFAULT 'Ziya',
  rating           NUMERIC(3,1)   DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count     INTEGER        DEFAULT 0,
  is_featured      BOOLEAN        DEFAULT false,
  is_new_product   BOOLEAN        DEFAULT true,
  is_trending      BOOLEAN        DEFAULT false,
  is_active        BOOLEAN        DEFAULT true,
  created_at       TIMESTAMPTZ    DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id                UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID           NOT NULL REFERENCES users(id),
  items             JSONB          NOT NULL DEFAULT '[]'::jsonb,
  shipping_address  JSONB          NOT NULL DEFAULT '{}'::jsonb,
  payment_method    TEXT           NOT NULL CHECK (payment_method IN ('razorpay','upi','cod','manual')),
  payment_status    TEXT           DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_id        TEXT,
  razorpay_order_id TEXT,
  subtotal          NUMERIC(10,2)  NOT NULL,
  shipping_cost     NUMERIC(10,2)  NOT NULL DEFAULT 0,
  discount          NUMERIC(10,2)  NOT NULL DEFAULT 0,
  total             NUMERIC(10,2)  NOT NULL,
  promo_code        TEXT,
  status            TEXT           DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  tracking_number   TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ    DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID        NOT NULL REFERENCES users(id),
  product_id           UUID        NOT NULL REFERENCES products(id),
  user_name            TEXT        NOT NULL,
  user_avatar          TEXT,
  rating               INTEGER     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title                TEXT,
  comment              TEXT        NOT NULL,
  images               TEXT[]      DEFAULT '{}',
  videos               TEXT[]      DEFAULT '{}',
  is_verified_purchase BOOLEAN     DEFAULT false,
  helpful              INTEGER     DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id              UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  code            TEXT           NOT NULL UNIQUE,
  description     TEXT,
  discount_type   TEXT           NOT NULL CHECK (discount_type IN ('percent','flat','shipping')),
  discount_value  NUMERIC(10,2)  NOT NULL CHECK (discount_value >= 0),
  min_order_value NUMERIC(10,2),
  max_uses        INTEGER,
  used_count      INTEGER        DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN        DEFAULT true,
  created_at      TIMESTAMPTZ    DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_logs (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT        NOT NULL,
  coupon_code   TEXT        NOT NULL,
  action        TEXT        NOT NULL CHECK (action IN ('claimed','used','rejected_already_used','rejected_not_first_order','rejected_not_found','duplicate_email_attempt')),
  reason        TEXT,
  ip_address    TEXT,
  user_id       UUID        REFERENCES users(id),
  order_id      UUID        REFERENCES orders(id),
  is_admin_read BOOLEAN     DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_coupons (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email            TEXT        NOT NULL UNIQUE,
  coupon_code      TEXT        NOT NULL UNIQUE,
  is_used          BOOLEAN     DEFAULT false,
  used_at          TIMESTAMPTZ,
  used_by_user_id  UUID        REFERENCES users(id),
  used_in_order_id UUID        REFERENCES orders(id),
  ip_address       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category_active  ON products (category, is_active);
CREATE INDEX IF NOT EXISTS idx_products_flags            ON products (is_trending, is_new_product, is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_created       ON orders   (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created     ON orders   (status,  created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_product_created   ON reviews  (product_id, created_at DESC);

-- Full-text search: trigger-maintained tsvector column
-- (generated columns also require IMMUTABLE; triggers do not)
ALTER TABLE products ADD COLUMN IF NOT EXISTS fts tsvector;

CREATE OR REPLACE FUNCTION products_fts_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    array_to_string(NEW.tags, ' ')
  );
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER products_fts_trigger
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION products_fts_update();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_products_fts ON products USING gin(fts);

-- ── updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER users_updated_at        BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER products_updated_at     BEFORE UPDATE ON products     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER orders_updated_at       BEFORE UPDATE ON orders       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER reviews_updated_at      BEFORE UPDATE ON reviews      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER promo_codes_updated_at  BEFORE UPDATE ON promo_codes  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Atomic helpers (called via supabase.rpc) ──────────────────
CREATE OR REPLACE FUNCTION decrement_product_stock(p_id UUID, amount INTEGER)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE products SET stock = stock - amount, updated_at = NOW() WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION increment_promo_used_count(p_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE promo_codes SET used_count = used_count + 1, updated_at = NOW() WHERE id = p_id;
$$;

-- ── Migration: add videos column to reviews (run once on existing DBs) ──
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

-- ── Row Level Security (disabled — auth handled by custom JWT) ─
ALTER TABLE users              DISABLE ROW LEVEL SECURITY;
ALTER TABLE products           DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders             DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews            DISABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes        DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_logs        DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_coupons DISABLE ROW LEVEL SECURITY;
