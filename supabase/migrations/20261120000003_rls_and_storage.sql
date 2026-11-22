-- ====================================================================
-- SHOPEASY DATABASE SCHEMA: MIGRATION 003 - ROW LEVEL SECURITY & STORAGE
-- PostgreSQL + Supabase
-- ====================================================================

-- 1. ENABLE ROW LEVEL SECURITY
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

-- 2. PROFILES POLICIES
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
    AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid())) -- Cannot escalate own role
  );

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- 3. CATEGORIES POLICIES
DROP POLICY IF EXISTS "Categories viewable by all" ON public.categories;
CREATE POLICY "Categories viewable by all"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (public.is_admin());

-- 4. PRODUCTS POLICIES
DROP POLICY IF EXISTS "Active products viewable by all, all viewable by admin" ON public.products;
CREATE POLICY "Active products viewable by all, all viewable by admin"
  ON public.products FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- 5. PRODUCT IMAGES POLICIES
DROP POLICY IF EXISTS "Product images viewable by all" ON public.product_images;
CREATE POLICY "Product images viewable by all"
  ON public.product_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage product images" ON public.product_images;
CREATE POLICY "Admins manage product images"
  ON public.product_images FOR ALL
  USING (public.is_admin());

-- 6. ADDRESSES POLICIES
DROP POLICY IF EXISTS "Customers view own addresses, admins view all" ON public.addresses;
CREATE POLICY "Customers view own addresses, admins view all"
  ON public.addresses FOR SELECT
  USING (customer_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Customers manage own addresses" ON public.addresses;
CREATE POLICY "Customers manage own addresses"
  ON public.addresses FOR ALL
  USING (customer_id = auth.uid());

-- 7. CARTS & CART ITEMS POLICIES
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

-- 8. ORDERS POLICIES
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

-- 9. ORDER ITEMS POLICIES
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

-- 10. WISHLIST ITEMS POLICIES
DROP POLICY IF EXISTS "Customers manage own wishlist" ON public.wishlist_items;
CREATE POLICY "Customers manage own wishlist"
  ON public.wishlist_items FOR ALL
  USING (customer_id = auth.uid());

-- 11. INVENTORY MOVEMENTS POLICIES
DROP POLICY IF EXISTS "Admins view inventory movements" ON public.inventory_movements;
CREATE POLICY "Admins view inventory movements"
  ON public.inventory_movements FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins insert inventory movements" ON public.inventory_movements;
CREATE POLICY "Admins insert inventory movements"
  ON public.inventory_movements FOR INSERT
  WITH CHECK (public.is_admin());

-- 12. AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "Admins view audit logs" ON public.audit_logs;
CREATE POLICY "Admins view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.is_admin());

-- 13. STORE SETTINGS POLICIES
DROP POLICY IF EXISTS "Store settings viewable by all" ON public.store_settings;
CREATE POLICY "Store settings viewable by all"
  ON public.store_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Super admins update store settings" ON public.store_settings;
CREATE POLICY "Super admins update store settings"
  ON public.store_settings FOR UPDATE
  USING (public.is_super_admin());

-- ====================================================================
-- SUPABASE STORAGE BUCKETS & STORAGE POLICIES
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('customer-avatars', 'customer-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage: product-images (Public read, admin write)
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

-- Storage: category-images (Public read, admin write)
DROP POLICY IF EXISTS "Public can view category images" ON storage.objects;
CREATE POLICY "Public can view category images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Admins can upload category images" ON storage.objects;
CREATE POLICY "Admins can upload category images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'category-images' AND public.is_admin());

-- Storage: customer-avatars (Public read, owner write)
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'customer-avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'customer-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
