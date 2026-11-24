import { AppNotification } from '../types';
import { StorageService, StorageKeys } from './storage.service';
import { supabase, isSupabaseConfigured } from './supabase';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to ShopEasy! 🎉',
    message: 'Start exploring our premium product catalog with fast nationwide delivery in Nigeria.',
    type: 'system',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Weekend Flash Promo: 10% Off',
    message: 'Use coupon code EASY10 at checkout to enjoy 10% off your order today!',
    type: 'promo',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export const NotificationService = {
  /**
   * Get all notifications for the customer
   */
  async getNotifications(customerId?: string): Promise<AppNotification[]> {
    if (isSupabaseConfigured() && supabase && customerId) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: AppNotification[] = data.map((d: any) => ({
            id: String(d.id),
            customer_id: d.customer_id,
            title: d.title,
            message: d.message,
            type: d.type || 'system',
            related_id: d.related_id,
            is_read: Boolean(d.is_read),
            created_at: d.created_at,
          }));
          await StorageService.setItem(StorageKeys.NOTIFICATIONS, mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase notifications fetch error:', e);
      }
    }

    const saved = await StorageService.getItem<AppNotification[]>(StorageKeys.NOTIFICATIONS, []);
    if (!saved || saved.length === 0) {
      await StorageService.setItem(StorageKeys.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    return saved;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(customerId?: string): Promise<number> {
    const list = await this.getNotifications(customerId);
    return list.filter((n) => !n.is_read).length;
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(id: string): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, is_read: true } : n));

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (e) {
        console.warn('Supabase mark notification read error:', e);
      }
    }

    await StorageService.setItem(StorageKeys.NOTIFICATIONS, updated);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(customerId?: string): Promise<void> {
    const list = await this.getNotifications(customerId);
    const updated = list.map((n) => ({ ...n, is_read: true }));

    if (isSupabaseConfigured() && supabase && customerId) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('customer_id', customerId);
      } catch (e) {
        console.warn('Supabase mark all notifications read error:', e);
      }
    }

    await StorageService.setItem(StorageKeys.NOTIFICATIONS, updated);
  },

  /**
   * Add a new notification
   */
  async addNotification(notif: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>): Promise<AppNotification> {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now().toString(36),
      is_read: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert([
            {
              customer_id: newNotif.customer_id,
              title: newNotif.title,
              message: newNotif.message,
              type: newNotif.type,
              related_id: newNotif.related_id,
              is_read: false,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          newNotif.id = String(data.id);
        }
      } catch (e) {
        console.warn('Supabase add notification error:', e);
      }
    }

    const current = await this.getNotifications(notif.customer_id);
    const updated = [newNotif, ...current];
    await StorageService.setItem(StorageKeys.NOTIFICATIONS, updated);
    return newNotif;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.filter((n) => n.id !== id);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('notifications').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete notification error:', e);
      }
    }

    await StorageService.setItem(StorageKeys.NOTIFICATIONS, updated);
  },
};
