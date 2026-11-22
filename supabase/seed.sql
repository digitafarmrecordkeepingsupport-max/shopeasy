-- ====================================================================
-- SHOPEASY DATABASE SEED DATA
-- Matches visual references for Admin Dashboard & Customer Management
-- ====================================================================

-- 1. STORE SETTINGS
INSERT INTO public.store_settings (id, store_name, support_email, support_phone, default_currency, default_delivery_fee, vip_spending_threshold)
VALUES ('default', 'ShopEasy', 'admin@shopeasy.com', '+234 801 234 5678', 'NGN', 2000, 200000)
ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  support_email = EXCLUDED.support_email,
  default_delivery_fee = EXCLUDED.default_delivery_fee;

-- 2. CATEGORIES
INSERT INTO public.categories (id, name, slug, description, icon_name, color, image_url, is_active, item_count)
VALUES
  ('cat-fashion', 'Fashion', 'fashion', 'Trendy clothing, stylish footwear, and designer apparel', 'shirt-outline', '#F5F0FF', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop', true, 24),
  ('cat-electronics', 'Electronics', 'electronics', 'Laptops, smartphones, audio gear, and smart gadgets', 'laptop-outline', '#EFF6FF', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop', true, 38),
  ('cat-home', 'Home', 'home', 'Comfortable sofas, modern furniture, and smart living', 'home-outline', '#FFFBEB', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop', true, 19),
  ('cat-beauty', 'Beauty', 'beauty', 'Skincare, cosmetic bottles, fragrances, and self-care', 'sparkles-outline', '#FDF2F8', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', true, 15),
  ('cat-sports', 'Sports', 'sports', 'Football, training gear, fitness apparel, and balls', 'football-outline', '#F0FDF4', 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?q=80&w=800&auto=format&fit=crop', true, 28),
  ('cat-accessories', 'Accessories', 'accessories', 'Stylish leather handbags, wallets, belts, and jewelry', 'bag-handle-outline', '#FAF5FF', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop', true, 32)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- 3. PRODUCTS (Matches Admin Dashboard & Mobile Catalogue)
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
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  stock_quantity = EXCLUDED.stock_quantity;

-- 4. RECENT ORDERS (Matches Admin Dashboard & Mobile App)
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
ON CONFLICT (id) DO UPDATE SET
  order_status = EXCLUDED.order_status,
  payment_status = EXCLUDED.payment_status;

-- Order Items
INSERT INTO public.order_items (order_id, product_id, product_name, product_image, unit_price, quantity, subtotal)
VALUES
  ('ord-108', 'prod-headphones-04', 'Wireless Headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', 45000, 1, 45000),
  ('ord-107', 'prod-sneakers-01', 'Casual Sneakers', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop', 33000, 1, 33000),
  ('ord-106', 'prod-handbag-09', 'Handbag', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop', 26000, 1, 26000),
  ('ord-105', 'prod-watch-02', 'Smart Watch', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop', 45000, 1, 45000)
ON CONFLICT DO NOTHING;
