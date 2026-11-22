import { Order, OrderStatus, AdminStats } from '../types';
import { MOCK_ORDERS } from '../data/mock-orders';
import { StorageService, StorageKeys } from './storage.service';
import { supabase, isSupabaseConfigured } from './supabase';
import { ProductService } from './product.service';

export const OrderService = {
  /**
   * Initialize orders with mock data if not seeded
   */
  async initializeOrders(): Promise<Order[]> {
    const existing = await StorageService.getItem<Order[]>(StorageKeys.ORDERS, []);
    if (!existing || existing.length === 0 || !existing.some((o) => o.id === 'ord-001')) {
      await StorageService.setItem(StorageKeys.ORDERS, MOCK_ORDERS);
      return MOCK_ORDERS;
    }
    return existing;
  },

  /**
   * Get all orders (for Admin) or filtered by customerId (for Customer)
   */
  async getOrders(customerId?: string): Promise<Order[]> {
    let orders: Order[] = [];

    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        orders = data.map((d: any) => ({
          id: d.id,
          order_number: d.order_number,
          customer_id: d.customer_id,
          customer_name: d.delivery_address?.recipient_name || 'Customer',
          customer_email: d.delivery_address?.email || '',
          customer_phone: d.delivery_address?.phone_number || '',
          subtotal: Number(d.subtotal || 0),
          delivery_fee: Number(d.delivery_fee || 0),
          total: Number(d.total_amount ?? d.total ?? 0),
          payment_method: d.payment_method,
          payment_status: d.payment_status,
          order_status: d.order_status,
          delivery_address: d.delivery_address,
          created_at: d.created_at,
          updated_at: d.updated_at,
          items: d.order_items?.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            unit_price: Number(item.unit_price),
            quantity: item.quantity,
            total: Number(item.total_price ?? (item.unit_price * item.quantity)),
          })) || [],
        }));
      }
    }

    if (orders.length === 0) {
      orders = await this.initializeOrders();
    }

    if (customerId) {
      return orders.filter((o) => o.customer_id === customerId);
    }
    return orders;
  },

  /**
   * Get an order by its ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === orderId) || null;
  },

  /**
   * Create a new order during checkout
   */
  async createOrder(orderInput: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<Order> {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `SE-${randomDigits}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderInput,
      id: 'ord-' + Date.now().toString(36),
      order_number: orderNumber,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: insertedOrder, error: orderErr } = await supabase
          .from('orders')
          .insert([
            {
              order_number: orderNumber,
              customer_id: orderInput.customer_id,
              subtotal: orderInput.subtotal,
              delivery_fee: orderInput.delivery_fee,
              total_amount: orderInput.total,
              currency: 'NGN',
              payment_method: orderInput.payment_method,
              payment_status: orderInput.payment_status,
              order_status: orderInput.order_status,
              delivery_address: orderInput.delivery_address,
            },
          ])
          .select()
          .single();

        if (insertedOrder && orderInput.items?.length) {
          const itemsToInsert = orderInput.items.map((item) => ({
            order_id: insertedOrder.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            unit_price: item.unit_price,
            quantity: item.quantity,
            total_price: item.total,
          }));
          await supabase.from('order_items').insert(itemsToInsert);
          newOrder.id = insertedOrder.id;
        }
      } catch (e) {
        console.warn('Could not insert order into Supabase, fallback to local storage:', e);
      }
    }

    const currentOrders = await this.initializeOrders();
    const updated = [newOrder, ...currentOrders];
    await StorageService.setItem(StorageKeys.ORDERS, updated);

    return newOrder;
  },

  /**
   * Admin: Update the status of an order
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    if (isSupabaseConfigured() && supabase) {
      await supabase
        .from('orders')
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
    }

    const orders = await this.initializeOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      throw new Error(`Order ${orderId} not found`);
    }

    orders[index] = {
      ...orders[index],
      order_status: status,
      updated_at: new Date().toISOString(),
    };

    await StorageService.setItem(StorageKeys.ORDERS, orders);
    return orders[index];
  },

  /**
   * Admin: Compute sales metrics and revenue summaries
   */
  async getAdminStats(): Promise<AdminStats> {
    const orders = await this.initializeOrders();
    const products = await ProductService.getAllProductsForAdmin();

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.order_status === 'pending' || o.order_status === 'processing').length;
    const totalSales = orders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total : 0), 0);
    const uniqueCustomers = new Set(orders.map((o) => o.customer_email)).size || 12;

    const monthlyRevenue = [
      { month: 'Jun', amount: 180000 },
      { month: 'Jul', amount: 240000 },
      { month: 'Aug', amount: 310000 },
      { month: 'Sep', amount: 290000 },
      { month: 'Oct', amount: 420000 },
      { month: 'Nov', amount: totalSales > 0 ? totalSales : 390000 },
    ];

    return {
      total_products: products.length,
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      total_customers: uniqueCustomers,
      total_sales: totalSales > 0 ? totalSales : 98000,
      monthly_revenue: monthlyRevenue,
    };
  },
};
