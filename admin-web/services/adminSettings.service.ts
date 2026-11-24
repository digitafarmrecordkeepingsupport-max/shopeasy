import { StoreSettingsData } from '../types';

export const AdminSettingsService = {
  async getSettings(): Promise<StoreSettingsData> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return {
            storeName: json.data.storeName || 'ShopEasy',
            supportEmail: json.data.supportEmail || 'support@shopeasy.com',
            supportPhone: json.data.supportPhone || '+234 800 000 0000',
            currency: json.data.currency || 'NGN',
            deliveryFee: Number(json.data.deliveryFee ?? 2000),
            freeShippingThreshold: Number(json.data.freeShippingThreshold ?? 50000),
            bankName: json.data.bankName || 'ShopEasy Microfinance / Paystack',
            bankAccountNumber: json.data.bankAccountNumber || '0123456789',
            bankAccountName: json.data.bankAccountName || 'ShopEasy Commerce Nigeria',
            maintenanceMode: !!json.data.maintenanceMode,
          };
        }
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }

    return {
      storeName: 'ShopEasy',
      supportEmail: 'support@shopeasy.com',
      supportPhone: '+234 800 000 0000',
      currency: 'NGN',
      deliveryFee: 2000,
      freeShippingThreshold: 50000,
      bankName: 'ShopEasy Microfinance / Paystack',
      bankAccountNumber: '0123456789',
      bankAccountName: 'ShopEasy Commerce Nigeria',
      maintenanceMode: false,
    };
  },

  async updateSettings(settings: Partial<StoreSettingsData>, adminEmail?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, adminEmail }),
      });
      const json = await res.json();
      return { success: res.ok, error: json.error };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
};
