import { SupportTicketItem } from '../types';

export const AdminSupportService = {
  async getTickets(status: 'all' | 'open' | 'in_progress' | 'resolved' | 'closed' = 'all'): Promise<SupportTicketItem[]> {
    try {
      const url = status !== 'all' ? `/api/support?status=${status}` : '/api/support';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : [];
      }
    } catch (e) {
      console.error('Error fetching support tickets:', e);
    }
    return [];
  },

  async updateTicket(
    id: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed',
    adminNotes?: string,
    adminEmail?: string
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, adminNotes, adminEmail }),
      });
      return res.ok;
    } catch (e) {
      console.error('Error updating support ticket:', e);
      return false;
    }
  },
};
