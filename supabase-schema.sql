-- ═══════════════════════════════════════════════════════════════
--  ZIYA — Complete Supabase Schema
--  Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── 1. USERS ─────────────────────────────────────────────────
create table if not exists users (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  email           text not null unique,
  password        text not null,
  role            text not null default 'user' check (role in ('user', 'admin')),
  phone           text,
  avatar          text,
  addresses       jsonb default '[]'::jsonb,
  default_address jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_users_email on users(email);

-- ── 2. PRODUCTS ──────────────────────────────────────────────
create table if not exists products (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  description     text,
  category        text,
  subcategory     text,
  price           numeric not null default 0,
  discount_price  numeric,
  stock           integer not null default 0,
  sizes           text[] default '{}',
  colors          text[] default '{}',
  images          text[] default '{}',
  tags            text[] default '{}',
  sku             text,
  brand           text default 'Ziya',
  is_featured     boolean not null default false,
  is_new_product  boolean not null default true,
  is_trending     boolean not null default false,
  is_active       boolean not null default true,
  gst_enabled     boolean not null default true,
  rating          numeric not null default 0,
  review_count    integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_products_category   on products(category);
create index if not exists idx_products_is_active   on products(is_active);
create index if not exists idx_products_is_trending on products(is_trending);
create index if not exists idx_products_is_featured on products(is_featured);

-- Full-text search column
alter table products add column if not exists fts tsvector
  generated always as (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(category, '') || ' ' ||
      coalesce(brand, '')
    )
  ) stored;

create index if not exists idx_products_fts on products using gin(fts);

-- ── 3. ORDERS ────────────────────────────────────────────────
create table if not exists orders (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references users(id) on delete cascade,
  items             jsonb not null default '[]'::jsonb,
  shipping_address  jsonb,
  payment_method    text not null default 'razorpay',
  promo_code        text,
  subtotal          numeric not null default 0,
  shipping_cost     numeric not null default 0,
  discount          numeric not null default 0,
  cgst              numeric not null default 0,
  sgst              numeric not null default 0,
  gst               numeric not null default 0,
  total             numeric not null default 0,
  status            text not null default 'pending'
                      check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_status    text not null default 'pending'
                      check (payment_status in ('pending','paid','failed','refunded')),
  payment_id        text,
  razorpay_order_id text,
  tracking_number   text,
  courier_service   text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_orders_user_id        on orders(user_id);
create index if not exists idx_orders_status          on orders(status);
create index if not exists idx_orders_payment_status  on orders(payment_status);
create index if not exists idx_orders_created_at      on orders(created_at desc);

-- ── 4. REVIEWS ───────────────────────────────────────────────
create table if not exists reviews (
  id                   uuid primary key default uuid_generate_v4(),
  product_id           uuid not null references products(id) on delete cascade,
  user_id              uuid not null references users(id) on delete cascade,
  user_name            text not null default 'Customer',
  user_avatar          text,
  rating               integer not null check (rating >= 1 and rating <= 5),
  title                text,
  comment              text,
  images               text[] default '{}',
  videos               text[] default '{}',
  is_verified_purchase boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique(product_id, user_id)
);

create index if not exists idx_reviews_product_id on reviews(product_id);
create index if not exists idx_reviews_user_id    on reviews(user_id);
create index if not exists idx_reviews_rating     on reviews(rating);

-- ── 5. PROMO CODES ───────────────────────────────────────────
create table if not exists promo_codes (
  id              uuid primary key default uuid_generate_v4(),
  code            text not null unique,
  description     text,
  discount_type   text not null check (discount_type in ('percent','flat','shipping')),
  discount_value  numeric not null default 0,
  min_order_value numeric,
  max_uses        integer,
  used_count      integer not null default 0,
  is_active       boolean not null default true,
  expires_at      timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_promo_codes_code on promo_codes(code);

-- ── 6. NEWSLETTER COUPONS ────────────────────────────────────
create table if not exists newsletter_coupons (
  id              uuid primary key default uuid_generate_v4(),
  email           text not null,
  coupon_code     text not null unique,
  ip_address      text,
  is_used         boolean not null default false,
  used_at         timestamptz,
  used_by_user_id uuid references users(id) on delete set null,
  used_in_order_id uuid references orders(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_newsletter_coupons_email on newsletter_coupons(email);
create index if not exists idx_newsletter_coupons_code  on newsletter_coupons(coupon_code);

-- ── 7. COUPON LOGS ───────────────────────────────────────────
create table if not exists coupon_logs (
  id            uuid primary key default uuid_generate_v4(),
  email         text,
  coupon_code   text,
  action        text not null,
  reason        text,
  ip_address    text,
  user_id       uuid,
  order_id      uuid,
  is_admin_read boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_coupon_logs_action     on coupon_logs(action);
create index if not exists idx_coupon_logs_created_at on coupon_logs(created_at desc);

-- ═══════════════════════════════════════════════════════════════
--  RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Decrement product stock (clamped to 0)
create or replace function decrement_product_stock(p_id uuid, amount integer)
returns void
language plpgsql
security definer
as $$
begin
  update products
  set stock = greatest(stock - amount, 0),
      updated_at = now()
  where id = p_id;
end;
$$;

-- Increment promo code used_count
create or replace function increment_promo_used_count(p_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update promo_codes
  set used_count = used_count + 1
  where id = p_id;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
--  AUTO-UPDATE updated_at TRIGGER
-- ═══════════════════════════════════════════════════════════════

create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply trigger to all tables with updated_at
do $$
declare
  tbl text;
begin
  for tbl in select unnest(array['users','products','orders','reviews'])
  loop
    execute format(
      'drop trigger if exists set_updated_at on %I; '
      'create trigger set_updated_at before update on %I '
      'for each row execute function update_updated_at();',
      tbl, tbl
    );
  end loop;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
--  Disabled for service_role access. Enable if you add client-
--  side Supabase queries with anon key.
-- ═══════════════════════════════════════════════════════════════

-- RLS is disabled by default. The app uses service_role key
-- server-side, which bypasses RLS. No policies needed.
