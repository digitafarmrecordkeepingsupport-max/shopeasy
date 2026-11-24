import { Customer, AccountStatus } from '../types';

export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  new_customers: number;
  vip_customers: number;
  total_growth: string;
  active_growth: string;
  new_growth: string;
  vip_growth: string;
}

export const AdminCustomerService = {
  /**
   * Computes real customer metrics from MongoDB Atlas
   */
  async getStats(): Promise<CustomerStats> {
    try {
      const customers = await this.getCustomers('all');
      const total = customers.length;
      const active = customers.filter((c) => c.account_status === 'active').length;
      const vip = customers.filter((c) => (c.total_spent || 0) >= 100000).length;
      const newCust = customers.filter((c) => {
        if (!c.created_at) return false;
        const diffDays = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      }).length;

      return {
        total_customers: total,
        active_customers: active,
        new_customers: newCust,
        vip_customers: vip,
        total_growth: total > 0 ? `${total} Registered` : '0',
        active_growth: active > 0 ? `${active} Active` : '0',
        new_growth: newCust > 0 ? `${newCust} This Month` : '0',
        vip_growth: vip > 0 ? `${vip} VIPs` : '0',
      };
    } catch (e) {
      console.error('Error fetching customer stats:', e);
      return {
        total_customers: 0,
        active_customers: 0,
        new_customers: 0,
        vip_customers: 0,
        total_growth: '0%',
        active_growth: '0%',
        new_growth: '0%',
        vip_growth: '0%',
      };
    }
  },

  /**
   * Fetches real customers from MongoDB Atlas API and builds records from real orders
   */
  async getCustomers(statusFilter = 'all', searchQuery = ''): Promise<Customer[]> {
    try {
      const [custRes, orderRes] = await Promise.all([
        fetch('/api/customers').then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/orders').then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      const rawCusts: any[] = Array.isArray(custRes.data) ? custRes.data : [];
      const rawOrders: any[] = Array.isArray(orderRes.data) ? orderRes.data : [];

      // Build customer aggregation map
      const customerMap = new Map<string, Customer>();

      // 1. Add registered users
      rawCusts.forEach((c) => {
        const email = (c.email || '').toLowerCase().trim();
        if (email) {
          customerMap.set(email, {
            id: c.id || c._id?.toString() || '',
            full_name: c.fullName || c.full_name || email.split('@')[0],
            email,
            phone_number: c.phoneNumber || c.phone_number || '',
            avatar_url: c.avatarUrl || c.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
            role: 'customer',
            account_status: (c.accountStatus || c.account_status || 'active') as AccountStatus,
            created_at: c.createdAt || c.created_at || new Date().toISOString(),
            total_orders: Number(c.totalOrders ?? c.total_orders ?? 0),
            total_spent: Number(c.totalSpent ?? c.total_spent ?? 0),
          });
        }
      });

      // 2. Add or update with real customer orders
      rawOrders.forEach((o) => {
        const email = (o.customerEmail || o.customer_email || '').toLowerCase().trim();
        if (!email) return;

        const name = o.customerName || o.customer_name || o.deliveryAddress?.recipientName || email.split('@')[0];
        const phone = o.customerPhone || o.customer_phone || o.deliveryAddress?.phone || '';
        const orderTotal = Number(o.totalAmount ?? o.total ?? 0);

        if (customerMap.has(email)) {
          const existing = customerMap.get(email)!;
          existing.total_orders = Math.max(existing.total_orders || 0, 1);
          existing.total_spent = (existing.total_spent || 0) + orderTotal;
        } else {
          customerMap.set(email, {
            id: `cust-${email.replace(/[^a-z0-9]/g, '')}`,
            full_name: name,
            email,
            phone_number: phone,
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
            role: 'customer',
            account_status: 'active',
            created_at: o.createdAt || o.created_at || new Date().toISOString(),
            total_orders: 1,
            total_spent: orderTotal,
          });
        }
      });

      let result = Array.from(customerMap.values());

      if (statusFilter !== 'all') {
        result = result.filter((c) => c.account_status === statusFilter);
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        result = result.filter(
          (c) => c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
        );
      }

      return result;
    } catch (e) {
      console.error('Error fetching customers:', e);
      return [];
    }
  },

  async updateStatus(customerId: string, status: AccountStatus): Promise<boolean> {
    return true;
  },
};
