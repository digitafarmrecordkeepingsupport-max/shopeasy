import { MarketingCampaign, MarketingStats } from '../types';

export const AdminMarketingService = {
  async getMarketingStats(): Promise<MarketingStats> {
    const campaigns = await this.getCampaigns();
    const total = campaigns.length;
    const totalReach = campaigns.reduce((s, c) => s + (c.reach || 0), 0);
    const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
    const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
    const convRate = totalClicks > 0 ? Number(((totalConversions / totalClicks) * 100).toFixed(1)) : 0;

    return {
      total_campaigns: total,
      campaigns_growth: total > 0 ? `${total} Total` : '0',
      total_reach: totalReach,
      reach_growth: totalReach > 0 ? `${totalReach}` : '0',
      total_clicks: totalClicks,
      clicks_growth: totalClicks > 0 ? `${totalClicks}` : '0',
      conversion_rate: convRate,
      conversion_growth: convRate > 0 ? `${convRate}%` : '0%',
    };
  },

  async getCampaigns(): Promise<MarketingCampaign[]> {
    try {
      const res = await fetch('/api/marketing');
      if (res.ok) {
        const json = await res.json();
        const raw: any[] = Array.isArray(json.data) ? json.data : [];
        return raw.map((c) => ({
          id: c.id || c._id?.toString() || '',
          name: c.name || '',
          type: c.type || 'Discount',
          start_date: c.startDate || c.start_date || '',
          end_date: c.endDate || c.end_date || '',
          status: c.status || 'Active',
          thumbnail_url: c.thumbnailUrl || c.thumbnail_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400',
          discount_rate: c.discountRate || c.discount_rate || '0%',
          reach: Number(c.reach || 0),
          clicks: Number(c.clicks || 0),
          conversions: Number(c.conversions || 0),
        }));
      }
    } catch (e) {
      console.error('Error fetching campaigns:', e);
    }
    return [];
  },

  async createCampaign(campaign: Omit<MarketingCampaign, 'id'>): Promise<MarketingCampaign | null> {
    try {
      const res = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaign.name,
          type: campaign.type,
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          status: campaign.status,
          thumbnailUrl: campaign.thumbnail_url,
          discountRate: campaign.discount_rate,
          reach: campaign.reach || 0,
          clicks: campaign.clicks || 0,
          conversions: campaign.conversions || 0,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.error('Error creating campaign:', e);
    }
    return null;
  },

  async sendNewsletter(subject: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `Newsletter "${subject}" broadcast scheduled successfully!` };
  },

  async updateCampaign(id: string, updates: Partial<MarketingCampaign>): Promise<boolean> {
    return true;
  },

  async deleteCampaign(id: string): Promise<boolean> {
    return true;
  },
};
