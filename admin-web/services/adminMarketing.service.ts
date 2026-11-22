import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { MarketingCampaign, MarketingStats } from '../types';

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'camp-1',
    name: 'Summer Sale',
    type: 'Discount',
    start_date: 'Jul 1, 2025',
    end_date: 'Jul 31, 2025',
    status: 'Active',
    thumbnail_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400',
    discount_rate: '30%',
    reach: 18400,
    clicks: 4920,
    conversions: 1240,
  },
  {
    id: 'camp-2',
    name: 'New Arrivals',
    type: 'Product Launch',
    start_date: 'Jun 15, 2025',
    end_date: 'Jul 15, 2025',
    status: 'Active',
    thumbnail_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400',
    reach: 15300,
    clicks: 3850,
    conversions: 970,
  },
  {
    id: 'camp-3',
    name: 'Free Delivery',
    type: 'Shipping',
    start_date: 'Jun 1, 2025',
    end_date: 'Jun 30, 2025',
    status: 'Completed',
    thumbnail_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400',
    reach: 9200,
    clicks: 2150,
    conversions: 580,
  },
  {
    id: 'camp-4',
    name: 'Back to School',
    type: 'Seasonal',
    start_date: 'May 1, 2025',
    end_date: 'May 31, 2025',
    status: 'Completed',
    thumbnail_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400',
    reach: 5850,
    clicks: 1460,
    conversions: 370,
  },
];

let localCampaigns = [...INITIAL_CAMPAIGNS];

export const AdminMarketingService = {
  async getMarketingStats(): Promise<MarketingStats> {
    return {
      total_campaigns: 5,
      campaigns_growth: '+25%',
      total_reach: 48750,
      reach_growth: '+40%',
      total_clicks: 12380,
      clicks_growth: '+55%',
      conversion_rate: 25.4,
      conversion_growth: '+12%',
    };
  },

  async getCampaigns(): Promise<MarketingCampaign[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as MarketingCampaign[];
        }
      } catch (e) {
        console.warn('Fallback to local campaigns', e);
      }
    }
    return localCampaigns;
  },

  async createCampaign(campaign: Omit<MarketingCampaign, 'id'>): Promise<MarketingCampaign> {
    const newCamp: MarketingCampaign = {
      ...campaign,
      id: 'camp-' + Date.now().toString(36),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .insert([newCamp])
          .select()
          .single();
        if (!error && data) {
          return data as MarketingCampaign;
        }
      } catch (e) {
        console.warn('Supabase campaign insert fallback', e);
      }
    }

    localCampaigns = [newCamp, ...localCampaigns];
    return newCamp;
  },

  async deleteCampaign(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('marketing_campaigns').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase campaign delete fallback', e);
      }
    }
    localCampaigns = localCampaigns.filter((c) => c.id !== id);
    return true;
  },

  async sendNewsletter(subject: string): Promise<{ success: boolean; message: string }> {
    // Simulated newsletter broadcast to all active customers
    return {
      success: true,
      message: `Newsletter "${subject}" successfully scheduled and dispatched to 3,240 subscribers!`,
    };
  },
};
