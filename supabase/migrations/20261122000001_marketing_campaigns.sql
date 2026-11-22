-- ====================================================================
-- SHOPEASY MIGRATION: MARKETING CAMPAIGNS & PROMOTIONS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Discount', -- 'Discount', 'Product Launch', 'Shipping', 'Seasonal'
  description TEXT,
  thumbnail_url TEXT,
  banner_url TEXT,
  discount_rate TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Completed', 'Scheduled', 'Draft'
  reach INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created_at ON public.marketing_campaigns(created_at DESC);

-- Enable RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active marketing campaigns
CREATE POLICY "Public read active marketing campaigns"
  ON public.marketing_campaigns FOR SELECT
  USING (status = 'Active' OR is_admin());

-- Policy: Admin full management
CREATE POLICY "Admins manage all marketing campaigns"
  ON public.marketing_campaigns FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Seed initial campaigns from UI design reference
INSERT INTO public.marketing_campaigns (id, name, type, start_date, end_date, status, thumbnail_url, discount_rate, reach, clicks, conversions)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Summer Sale', 'Discount', 'Jul 1, 2025', 'Jul 31, 2025', 'Active', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400', '30%', 18400, 4920, 1240),
  ('d1000000-0000-0000-0000-000000000002', 'New Arrivals', 'Product Launch', 'Jun 15, 2025', 'Jul 15, 2025', 'Active', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400', NULL, 15300, 3850, 970),
  ('d1000000-0000-0000-0000-000000000003', 'Free Delivery', 'Shipping', 'Jun 1, 2025', 'Jun 30, 2025', 'Completed', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400', 'Free Shipping', 9200, 2150, 580),
  ('d1000000-0000-0000-0000-000000000004', 'Back to School', 'Seasonal', 'May 1, 2025', 'May 31, 2025', 'Completed', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400', '15%', 5850, 1460, 370)
ON CONFLICT (id) DO NOTHING;
