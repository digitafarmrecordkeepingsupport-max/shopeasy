import { CouponItem } from '../types';

export const AdminCouponService = {
  async getCoupons(): Promise<CouponItem[]> {
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : [];
      }
    } catch (e) {
      console.error('Error fetching coupons:', e);
    }
    return [];
  },

  async createCoupon(coupon: Partial<CouponItem>, adminEmail?: string): Promise<{ success: boolean; data?: CouponItem; error?: string }> {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...coupon, adminEmail }),
      });
      const json = await res.json();
      if (res.ok) {
        return { success: true, data: json.data };
      }
      return { success: false, error: json.error || 'Failed to save coupon' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async deleteCoupon(code: string, adminEmail?: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}&adminEmail=${encodeURIComponent(adminEmail || '')}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('Error deleting coupon:', e);
      return false;
    }
  },
};
