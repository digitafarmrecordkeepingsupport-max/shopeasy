import { StorageService } from './storage.service';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://shopeasy-sepia.vercel.app/api').replace(/\/$/, '');
const SETTINGS_CACHE_KEY = '@shopeasy_store_settings';

export interface MobileStoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  deliveryFee: number;
  freeShippingThreshold: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export const SettingsService = {
  /**
   * Fetches store configuration from live cloud API (admin-configured)
   * Falls back to cached settings or standard defaults
   */
  async getSettings(): Promise<MobileStoreSettings> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const settings: MobileStoreSettings = {
            storeName: json.data.storeName || 'ShopEasy',
            supportEmail: json.data.supportEmail || 'support@shopeasy.com',
            supportPhone: json.data.supportPhone || '+234 800 000 0000',
            currency: json.data.currency || 'NGN',
            deliveryFee: Number(json.data.deliveryFee ?? 2000),
            freeShippingThreshold: Number(json.data.freeShippingThreshold ?? 50000),
            bankName: json.data.bankName || 'ShopEasy Microfinance / Paystack',
            bankAccountNumber: json.data.bankAccountNumber || '0123456789',
            bankAccountName: json.data.bankAccountName || 'ShopEasy Commerce Nigeria',
          };
          await StorageService.setItem(SETTINGS_CACHE_KEY, settings);
          return settings;
        }
      }
    } catch (e) {
      console.warn('Could not fetch remote store settings, using cached values:', e);
    }

    const cached = await StorageService.getItem<MobileStoreSettings>(SETTINGS_CACHE_KEY, {
      storeName: 'ShopEasy',
      supportEmail: 'support@shopeasy.com',
      supportPhone: '+234 800 000 0000',
      currency: 'NGN',
      deliveryFee: 2000,
      freeShippingThreshold: 50000,
      bankName: 'ShopEasy Microfinance / Paystack',
      bankAccountNumber: '0123456789',
      bankAccountName: 'ShopEasy Commerce Nigeria',
    });

    return cached;
  },
};
