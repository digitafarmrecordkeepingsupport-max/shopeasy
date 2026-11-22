-- ====================================================================
-- SHOPEASY UNIFIED MASTER DATABASE SCHEMA & SEED
-- Full PostgreSQL & Supabase Setup Script
-- Tables, Functions, Triggers, RLS, Storage & Seeds
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('card', 'transfer', 'paystack', 'cash_on_delivery');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE movement_type AS ENUM ('sale', 'restock', 'return', 'adjustment', 'cancellation');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer'::user_role NOT NULL,
  account_status account_status DEFAULT 'active'::account_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT ('cat-' || substr(md5(random()::text), 1, 8)),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT DEFAULT 'grid-outline' NOT NULL,
  color TEXT DEFAULT '#F7F5FC',
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  item_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT ('prod-' || substr(md5(random()::text), 1, 10)),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  category_name TEXT,
  price BIGINT NOT NULL CHECK (price >= 0),
  original_price BIGINT CHECK (original_price >= price),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  sku TEXT NOT NULL UNIQUE,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  rating NUMERIC(2, 1) DEFAULT 5.0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'Nigeria' NOT NULL,
  is_default BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. CARTS TABLE
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(cart_id, product_id)
);

-- 10. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT ('ord-' || substr(md5(random()::text), 1, 10)),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subtotal BIGINT NOT NULL CHECK (subtotal >= 0),
  delivery_fee BIGINT NOT NULL DEFAULT 2000 CHECK (delivery_fee >= 0),
  discount BIGINT NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
  currency TEXT DEFAULT 'NGN' NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'paystack',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  order_status order_status NOT NULL DEFAULT 'pending',
  delivery_address_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL,
  unit_price BIGINT NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal BIGINT NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. WISHLIST ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(customer_id, product_id)
);

-- 13. INVENTORY MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  related_order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT DEFAULT 'ShopEasy' NOT NULL,
  support_email TEXT DEFAULT 'support@shopeasy.com' NOT NULL,
  support_phone TEXT DEFAULT '+234 800 000 0000' NOT NULL,
  default_currency TEXT DEFAULT 'NGN' NOT NULL,
  default_delivery_fee BIGINT DEFAULT 2000 NOT NULL,
  vip_spending_threshold BIGINT DEFAULT 200000 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_customer ON public.wishlist_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ====================================================================
-- FUNCTIONS & PROCEDURES
-- ====================================================================

-- A. Auto profile creator
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role := 'customer'::user_role;
  v_full_name TEXT;
BEGIN
  IF (NEW.raw_user_meta_data->>'role') = 'super_admin' THEN
    v_role := 'super_admin'::user_role;
  ELSIF (NEW.raw_user_meta_data->>'role') = 'admin' THEN
    v_role := 'admin'::user_role;
  END IF;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (id, email, full_name, phone_number, avatar_url, role, account_status)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'avatar_url',
    v_role,
    'active'::account_status
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  INSERT INTO public.carts (customer_id)
  VALUES (NEW.id)
  ON CONFLICT (customer_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. Role helpers
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (role = 'admin'::user_role OR role = 'super_admin'::user_role)
      AND account_status = 'active'::account_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'::user_role
      AND account_status = 'active'::account_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Inventory management
CREATE OR REPLACE FUNCTION public.process_order_inventory(p_order_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_item RECORD;
  v_current_stock INTEGER;
  v_new_stock INTEGER;
BEGIN
  FOR v_item IN
    SELECT product_id, quantity, product_name
    FROM public.order_items
    WHERE order_id = p_order_id
  LOOP
    SELECT stock_quantity INTO v_current_stock
    FROM public.products
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF v_current_stock IS NULL THEN
      RAISE EXCEPTION 'Product % does not exist', v_item.product_id;
    END IF;

    IF v_current_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product "%". Available: %, Requested: %',
        v_item.product_name, v_current_stock, v_item.quantity;
    END IF;

    v_new_stock := v_current_stock - v_item.quantity;

    UPDATE public.products
    SET stock_quantity = v_new_stock,
        updated_at = NOW()
    WHERE id = v_item.product_id;

    INSERT INTO public.inventory_movements (
      product_id,
      movement_type,
      quantity,
      previous_stock,
      new_stock,
      related_order_id,
      created_by
    ) VALUES (
      v_item.product_id,
      'sale'::movement_type,
      v_item.quantity,
      v_current_stock,
      v_new_stock,
      p_order_id,
      auth.uid()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.restore_order_inventory(p_order_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_item RECORD;
  v_current_stock INTEGER;
  v_new_stock INTEGER;
BEGIN
  FOR v_item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id
  LOOP
    SELECT stock_quantity INTO v_current_stock
    FROM public.products
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF v_current_stock IS NOT NULL THEN
      v_new_stock := v_current_stock + v_item.quantity;

      UPDATE public.products
      SET stock_quantity = v_new_stock,
          updated_at = NOW()
      WHERE id = v_item.product_id;

      INSERT INTO public.inventory_movements (
        product_id,
        movement_type,
        quantity,
        previous_stock,
        new_stock,
        related_order_id,
        created_by
      ) VALUES (
        v_item.product_id,
        'cancellation'::movement_type,
        v_item.quantity,
        v_current_stock,
        v_new_stock,
        p_order_id,
        auth.uid()
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- D. Analytics calculation
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics(p_days INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
  v_total_products INTEGER;
  v_total_orders INTEGER;
  v_total_customers INTEGER;
  v_total_sales BIGINT;
  v_cutoff_date TIMESTAMPTZ := NOW() - (p_days || ' days')::INTERVAL;
BEGIN
  SELECT COUNT(*) INTO v_total_products FROM public.products WHERE is_active = TRUE;
  SELECT COUNT(*) INTO v_total_orders FROM public.orders WHERE created_at >= v_cutoff_date;
  SELECT COUNT(*) INTO v_total_customers FROM public.profiles WHERE role = 'customer'::user_role;
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_sales
  FROM public.orders
  WHERE payment_status = 'paid'::payment_status
    AND order_status != 'cancelled'::order_status
    AND created_at >= v_cutoff_date;

  RETURN jsonb_build_object(
    'total_products', v_total_products,
    'total_orders', v_total_orders,
    'total_customers', v_total_customers,
    'total_sales', v_total_sales
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_sales_analytics(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  period_label TEXT,
  sales_amount BIGINT,
  orders_count BIGINT
) AS $$
BEGIN
  IF p_days <= 7 THEN
    RETURN QUERY
    WITH date_series AS (
      SELECT generate_series(
        date_trunc('day', NOW() - INTERVAL '6 days'),
        date_trunc('day', NOW()),
        INTERVAL '1 day'
      ) AS day_date
    )
    SELECT
      to_char(ds.day_date, 'Dy') AS period_label,
      COALESCE(SUM(o.total_amount), 0)::BIGINT AS sales_amount,
      COUNT(o.id)::BIGINT AS orders_count
    FROM date_series ds
    LEFT JOIN public.orders o
      ON date_trunc('day', o.created_at) = ds.day_date
     AND o.payment_status = 'paid'::payment_status
     AND o.order_status != 'cancelled'::order_status
    GROUP BY ds.day_date
    ORDER BY ds.day_date;
  ELSE
    RETURN QUERY
    WITH date_series AS (
      SELECT generate_series(
        date_trunc('day', NOW() - (p_days || ' days')::INTERVAL),
        date_trunc('day', NOW()),
        INTERVAL '5 days'
      ) AS day_date
    )
    SELECT
      to_char(ds.day_date, 'Mon DD') AS period_label,
      COALESCE(SUM(o.total_amount), 0)::BIGINT AS sales_amount,
      COUNT(o.id)::BIGINT AS orders_count
    FROM date_series ds
    LEFT JOIN public.orders o
      ON o.created_at >= ds.day_date
     AND o.created_at < ds.day_date + INTERVAL '5 days'
     AND o.payment_status = 'paid'::payment_status
     AND o.order_status != 'cancelled'::order_status
    GROUP BY ds.day_date
    ORDER BY ds.day_date;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_customer_metrics()
RETURNS JSONB AS $$
DECLARE
  v_total_customers INTEGER;
  v_active_customers INTEGER;
  v_new_customers INTEGER;
  v_vip_customers INTEGER;
  v_vip_threshold BIGINT := 200000;
BEGIN
  SELECT COALESCE(vip_spending_threshold, 200000) INTO v_vip_threshold
  FROM public.store_settings WHERE id = 'default';

  SELECT COUNT(*) INTO v_total_customers
  FROM public.profiles WHERE role = 'customer'::user_role;

  SELECT COUNT(*) INTO v_active_customers
  FROM public.profiles
  WHERE role = 'customer'::user_role AND account_status = 'active'::account_status;

  SELECT COUNT(*) INTO v_new_customers
  FROM public.profiles
  WHERE role = 'customer'::user_role
    AND created_at >= (NOW() - INTERVAL '30 days');

  SELECT COUNT(DISTINCT customer_id) INTO v_vip_customers
  FROM public.orders
  WHERE payment_status = 'paid'::payment_status
  GROUP BY customer_id
  HAVING SUM(total_amount) >= v_vip_threshold;

  IF v_vip_customers IS NULL THEN
    v_vip_customers := 0;
  END IF;

  RETURN jsonb_build_object(
    'total_customers', v_total_customers,
    'active_customers', v_active_customers,
    'new_customers', v_new_customers,
    'vip_customers', v_vip_customers
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles viewable by self or admin" ON public.profiles;
CREATE POLICY "Profiles viewable by self or admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  );

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Categories Policies
DROP POLICY IF EXISTS "Categories viewable by all" ON public.categories;
CREATE POLICY "Categories viewable by all"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- Products Policies
DROP POLICY IF EXISTS "Active products viewable by all, all viewable by admin" ON public.products;
CREATE POLICY "Active products viewable by all, all viewable by admin"
  ON public.products FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- Product Images Policies
DROP POLICY IF EXISTS "Product images viewable by all" ON public.product_images;
CREATE POLICY "Product images viewable by all"
  ON public.product_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage product images" ON public.product_images;
CREATE POLICY "Admins manage product images"
  ON public.product_images FOR ALL
  USING (public.is_admin());

-- Addresses Policies
DROP POLICY IF EXISTS "Customers view own addresses, admins view all" ON public.addresses;
CREATE POLICY "Customers view own addresses, admins view all"
  ON public.addresses FOR SELECT
  USING (customer_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Customers manage own addresses" ON public.addresses;
CREATE POLICY "Customers manage own addresses"
  ON public.addresses FOR ALL
  USING (customer_id = auth.uid());

-- Carts & Cart Items Policies
DROP POLICY IF EXISTS "Customers view own cart" ON public.carts;
CREATE POLICY "Customers view own cart"
  ON public.carts FOR SELECT
  USING (customer_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Customers manage own cart items" ON public.cart_items;
CREATE POLICY "Customers manage own cart items"
  ON public.cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
        AND (carts.customer_id = auth.uid() OR public.is_admin())
    )
  );

-- Orders Policies
DROP POLICY IF EXISTS "Orders viewable by customer or admin" ON public.orders;
CREATE POLICY "Orders viewable by customer or admin"
  ON public.orders FOR SELECT
  USING (customer_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Authenticated users or guests can place orders" ON public.orders;
CREATE POLICY "Authenticated users or guests can place orders"
  ON public.orders FOR INSERT
  WITH CHECK (customer_id = auth.uid() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- Order Items Policies
DROP POLICY IF EXISTS "Order items viewable by owner or admin" ON public.order_items;
CREATE POLICY "Order items viewable by owner or admin"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.customer_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Order items insertable on order creation" ON public.order_items;
CREATE POLICY "Order items insertable on order creation"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- Wishlist Policies
DROP POLICY IF EXISTS "Customers manage own wishlist" ON public.wishlist_items;
CREATE POLICY "Customers manage own wishlist"
  ON public.wishlist_items FOR ALL
  USING (customer_id = auth.uid());

-- Inventory Movements Policies
DROP POLICY IF EXISTS "Admins manage inventory movements" ON public.inventory_movements;
CREATE POLICY "Admins manage inventory movements"
  ON public.inventory_movements FOR ALL
  USING (public.is_admin());

-- Audit Logs Policies
DROP POLICY IF EXISTS "Admins view and insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins view and insert audit logs"
  ON public.audit_logs FOR ALL
  USING (public.is_admin());

-- Store Settings Policies
DROP POLICY IF EXISTS "Store settings viewable by all" ON public.store_settings;
CREATE POLICY "Store settings viewable by all"
  ON public.store_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Super admins update store settings" ON public.store_settings;
CREATE POLICY "Super admins update store settings"
  ON public.store_settings FOR UPDATE
  USING (public.is_super_admin());

-- ====================================================================
-- STORAGE BUCKETS & POLICIES
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('customer-avatars', 'customer-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Public can view category images" ON storage.objects;
CREATE POLICY "Public can view category images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Admins can upload category images" ON storage.objects;
CREATE POLICY "Admins can upload category images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'category-images' AND public.is_admin());

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'customer-avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'customer-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ====================================================================
-- SEED INITIAL DATA
-- ====================================================================
INSERT INTO public.store_settings (id, store_name, support_email, support_phone, default_currency, default_delivery_fee, vip_spending_threshold)
VALUES ('default', 'ShopEasy', 'admin@shopeasy.com', '+234 801 234 5678', 'NGN', 2000, 200000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (id, name, slug, description, icon_name, color, image_url, is_active, item_count)
VALUES
  ('cat-fashion', 'Fashion', 'fashion', 'Trendy clothing, stylish footwear, and designer apparel', 'shirt-outline', '#F5F0FF', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop', true, 24),
  ('cat-electronics', 'Electronics', 'electronics', 'Laptops, smartphones, audio gear, and smart gadgets', 'laptop-outline', '#EFF6FF', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop', true, 38),
  ('cat-home', 'Home', 'home', 'Comfortable sofas, modern furniture, and smart living', 'home-outline', '#FFFBEB', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop', true, 19),
  ('cat-beauty', 'Beauty', 'beauty', 'Skincare, cosmetic bottles, fragrances, and self-care', 'sparkles-outline', '#FDF2F8', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', true, 15),
  ('cat-sports', 'Sports', 'sports', 'Football, training gear, fitness apparel, and balls', 'football-outline', '#F0FDF4', 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?q=80&w=800&auto=format&fit=crop', true, 28),
  ('cat-accessories', 'Accessories', 'accessories', 'Stylish leather handbags, wallets, belts, and jewelry', 'bag-handle-outline', '#FAF5FF', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop', true, 32)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, category_name, price, original_price, stock_quantity, sku, image_urls, is_featured, is_active, rating, rating_count)
VALUES
  (
    'prod-earbuds-03',
    'Wireless Earbuds',
    'wireless-earbuds',
    'White wireless earbuds with charging case, active noise cancellation, deep bass enhancement, transparent hearing mode, and up to 30 hours of playback.',
    'cat-electronics',
    'Electronics',
    25000,
    32000,
    45,
    'SE-EBD-003',
    ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop'],
    true,
    true,
    4.8,
    210
  ),
  (
    'prod-watch-02',
    'Smart Watch',
    'smart-watch',
    'Black smartwatch featuring an AMOLED display, continuous heart rate tracking, sleep stage monitoring, blood oxygen sensors, and seamless Bluetooth calling.',
    'cat-electronics',
    'Electronics',
    45000,
    60000,
    28,
    'SE-WTC-002',
    ARRAY['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop'],
    true,
    true,
    4.9,
    89
  ),
  (
    'prod-sneakers-01',
    'Casual Sneakers',
    'casual-sneakers',
    'Black-and-white sneakers built with breathable synthetic leather and cushioned shock-absorbing insoles for all-day comfort. Perfect for streetwear and daily style.',
    'cat-fashion',
    'Fashion',
    35000,
    50000,
    32,
    'SE-SNK-001',
    ARRAY['https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop'],
    true,
    true,
    4.8,
    124
  ),
  (
    'prod-headphones-04',
    'Wireless Headphones',
    'wireless-headphones',
    'Stylish wireless over-ear headphones with hi-res audio certification, 40mm titanium drivers, hybrid ANC, ultra-soft memory foam earcups, and up to 45 hours battery life.',
    'cat-electronics',
    'Electronics',
    47000,
    65000,
    19,
    'SE-HDP-004',
    ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'],
    true,
    true,
    4.9,
    340
  ),
  (
    'prod-handbag-09',
    'Handbag',
    'handbag',
    'Luxurious maroon leather handbag with signature gold hardware, detachable shoulder strap, multiple inner compartments, and water-resistant finish.',
    'cat-accessories',
    'Accessories',
    28000,
    36000,
    14,
    'SE-HBG-009',
    ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop'],
    true,
    true,
    4.8,
    92
  ),
  (
    'prod-whitesneakers-15',
    'White Street Sneakers',
    'white-street-sneakers',
    'Clean minimalist white sneakers with cushioned rubber outsole and ergonomic insole. Crisp modern style that pairs effortlessly with any outfit.',
    'cat-fashion',
    'Fashion',
    35000,
    45000,
    22,
    'SE-WSN-015',
    ARRAY['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop'],
    true,
    true,
    4.7,
    140
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.orders (id, order_number, subtotal, delivery_fee, discount, total_amount, currency, payment_method, payment_status, order_status, delivery_address_snapshot, created_at)
VALUES
  (
    'ord-108',
    'SE20251125-108',
    45000,
    2000,
    0,
    47000,
    'NGN',
    'card',
    'paid',
    'delivered',
    '{"recipient_name": "John Doe", "phone": "08012345678", "city": "Lagos", "address": "12 Admiralty Way, Lekki"}',
    '2025-11-25T14:20:00Z'
  ),
  (
    'ord-107',
    'SE20251125-107',
    33000,
    2000,
    0,
    35000,
    'NGN',
    'paystack',
    'paid',
    'shipped',
    '{"recipient_name": "Sarah Mike", "phone": "08023456789", "city": "Abuja", "address": "45 Gana Street, Maitama"}',
    '2025-11-25T11:45:00Z'
  ),
  (
    'ord-106',
    'SE20251124-106',
    26000,
    2000,
    0,
    28000,
    'NGN',
    'transfer',
    'paid',
    'processing',
    '{"recipient_name": "David King", "phone": "08034567890", "city": "Port Harcourt", "address": "18 Olu Obasanjo Road"}',
    '2025-11-24T16:10:00Z'
  ),
  (
    'ord-105',
    'SE20251124-105',
    50000,
    2000,
    0,
    52000,
    'NGN',
    'cash_on_delivery',
    'pending',
    'pending',
    '{"recipient_name": "Grace James", "phone": "08045678901", "city": "Ibadan", "address": "8 Ring Road"}',
    '2025-11-24T09:30:00Z'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, product_id, product_name, product_image, unit_price, quantity, subtotal)
VALUES
  ('ord-108', 'prod-headphones-04', 'Wireless Headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', 45000, 1, 45000),
  ('ord-107', 'prod-sneakers-01', 'Casual Sneakers', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop', 33000, 1, 33000),
  ('ord-106', 'prod-handbag-09', 'Handbag', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop', 26000, 1, 26000),
  ('ord-105', 'prod-watch-02', 'Smart Watch', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop', 45000, 1, 45000)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- SECTION 13: MARKETING CAMPAIGNS & PROMOTIONS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Discount',
  description TEXT,
  thumbnail_url TEXT,
  banner_url TEXT,
  discount_rate TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  reach INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created_at ON public.marketing_campaigns(created_at DESC);

ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active marketing campaigns"
  ON public.marketing_campaigns FOR SELECT
  USING (status = 'Active' OR is_admin());

CREATE POLICY "Admins manage all marketing campaigns"
  ON public.marketing_campaigns FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

INSERT INTO public.marketing_campaigns (id, name, type, start_date, end_date, status, thumbnail_url, discount_rate, reach, clicks, conversions)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Summer Sale', 'Discount', 'Jul 1, 2025', 'Jul 31, 2025', 'Active', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400', '30%', 18400, 4920, 1240),
  ('d1000000-0000-0000-0000-000000000002', 'New Arrivals', 'Product Launch', 'Jun 15, 2025', 'Jul 15, 2025', 'Active', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400', NULL, 15300, 3850, 970),
  ('d1000000-0000-0000-0000-000000000003', 'Free Delivery', 'Shipping', 'Jun 1, 2025', 'Jun 30, 2025', 'Completed', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400', 'Free Shipping', 9200, 2150, 580),
  ('d1000000-0000-0000-0000-000000000004', 'Back to School', 'Seasonal', 'May 1, 2025', 'May 31, 2025', 'Completed', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400', '15%', 5850, 1460, 370)
ON CONFLICT (id) DO NOTHING;
