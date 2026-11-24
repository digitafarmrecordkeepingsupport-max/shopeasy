import { NotificationBroadcastItem } from '../types';

export const AdminNotificationService = {
  async getNotifications(targetAudience = 'all'): Promise<NotificationBroadcastItem[]> {
    try {
      const url = targetAudience !== 'all' ? `/api/notifications?targetAudience=${targetAudience}` : '/api/notifications';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : [];
      }
    } catch (e) {
      console.error('Error fetching broadcast notifications:', e);
    }
    return [];
  },

  async broadcastNotification(params: {
    title: string;
    message: string;
    targetAudience?: 'all' | 'vip' | 'new' | 'single';
    type?: string;
    customerId?: string;
    sentBy?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (res.ok) {
        return { success: true, data: json.data };
      }
      return { success: false, error: json.error || 'Failed to broadcast notification' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
};
