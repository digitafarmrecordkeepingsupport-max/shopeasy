import { AuditLogItem } from '../types';

export const AdminAuditService = {
  async getAuditLogs(entityType = 'all', limit = 100): Promise<AuditLogItem[]> {
    try {
      const url = `/api/audit-logs?entityType=${entityType}&limit=${limit}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : [];
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    }
    return [];
  },

  async logAction(params: {
    adminEmail: string;
    adminName?: string;
    action: string;
    entityType: string;
    entityId?: string;
    details: string;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return res.ok;
    } catch (e) {
      console.error('Error recording audit log:', e);
      return false;
    }
  },
};
