-- ====================================================================
-- SHOPEASY DATABASE SCHEMA: MIGRATION 002 - FUNCTIONS & TRIGGERS
-- PostgreSQL + Supabase
-- ====================================================================

-- 1. AUTOMATIC PROFILE CREATION TRIGGER ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role := 'customer'::user_role;
  v_full_name TEXT;
BEGIN
  -- If email or metadata designates admin, assign role (safe default is customer)
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

  -- Initialize empty cart for the customer
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

-- 2. SECURITY DEFINER ROLE CHECK HELPERS
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

-- 3. INVENTORY ATOMIC DEDUCTION FUNCTION
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
    -- Lock row and check stock
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

    -- Update product stock
    UPDATE public.products
    SET stock_quantity = v_new_stock,
        updated_at = NOW()
    WHERE id = v_item.product_id;

    -- Record movement
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

-- 4. INVENTORY RESTORATION FUNCTION ON CANCELLATION
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

-- 5. ADMIN DASHBOARD METRICS FUNCTION
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

-- 6. SALES ANALYTICS TIME-SERIES FUNCTION
CREATE OR REPLACE FUNCTION public.get_sales_analytics(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  period_label TEXT,
  sales_amount BIGINT,
  orders_count BIGINT
) AS $$
BEGIN
  IF p_days <= 7 THEN
    -- Return day-by-day for the last 7 days
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
    -- Group by intervals for 30 or 90 days
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

-- 7. CUSTOMER METRICS CALCULATION FUNCTION
CREATE OR REPLACE FUNCTION public.get_customer_metrics()
RETURNS JSONB AS $$
DECLARE
  v_total_customers INTEGER;
  v_active_customers INTEGER;
  v_new_customers INTEGER;
  v_vip_customers INTEGER;
  v_vip_threshold BIGINT := 200000; -- ₦200,000 threshold
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

  -- VIP Customers: Total spent >= threshold
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
