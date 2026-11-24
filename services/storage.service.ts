import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  ONBOARDING_COMPLETED: 'shopeasy_onboarding_completed',
  USER_SESSION: 'shopeasy_user_session',
  PRODUCTS: 'shopeasy_products',
  CATEGORIES: 'shopeasy_categories',
  CART: 'shopeasy_cart',
  WISHLIST: 'shopeasy_wishlist',
  ORDERS: 'shopeasy_orders',
  ADDRESSES: 'shopeasy_addresses',
  NOTIFICATIONS: 'shopeasy_notifications',
  REVIEWS: 'shopeasy_reviews',
  SUPPORT_TICKETS: 'shopeasy_support_tickets',
  APPLIED_COUPON: 'shopeasy_applied_coupon',
};

export const StorageService = {
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value) as T;
      }
      return defaultValue;
    } catch (error) {
      console.warn(`Error reading key ${key} from AsyncStorage:`, error);
      return defaultValue;
    }
  },

  async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error saving key ${key} to AsyncStorage:`, error);
      return false;
    }
  },

  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing key ${key} from AsyncStorage:`, error);
      return false;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  },
};
