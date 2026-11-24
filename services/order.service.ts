import { Order, OrderStatus, AdminStats } from '../types';
import { StorageService, StorageKeys } from './storage.service';
import { supabase, isSupabaseConfigured } from './supabase';
import { ProductService } from './product.service';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://shopeasy-sepia.vercel.app/api').replace(/\/$/, '');

/**
 * Normalizes backend MongoDB / REST payloads into the mobile Order interface
 */
function mapOrder(o: any): Order {
  const items = Array.isArray(o.items)
    ? o.items.map((item: any) => ({
        id: String(item.id || item._id || item.productId || `oi-${Date.now()}`),
        product_id: String(item.product_id || item.productId || ''),
        product_name: String(item.product_name || item.productName || 'Product'),
        product_image: String(item.product_image || item.productImage || ''),
        unit_price: Number(item.unit_price ?? item.unitPrice ?? 0),
        quantity: Number(item.quantity || 1),
        total: Number(
          item.total ??
          item.totalPrice ??
          (Number(item.unit_price ?? item.unitPrice ?? 0) * Number(item.quantity || 1))
        ),
      }))
    : [];

  const subtotal = Number(o.subtotal || 0);
  const deliveryFee = Number(o.delivery_fee ?? o.deliveryFee ?? 0);
  const total = Number(o.total ?? o.totalAmount ?? (subtotal + deliveryFee));

  return {
    id: String(o.id || o._id || `ord-${Date.now()}`),
    order_number: String(o.order_number || o.orderNumber || `SE-${Math.floor(10000 + Math.random() * 90000)}`),
    customer_id: String(o.customer_id || o.customerId || 'anonymous'),
    customer_name: String(
      o.customer_name ||
      o.customerName ||
      o.delivery_address?.recipient_name ||
      o.deliveryAddress?.recipientName ||
      'Customer'
    ),
    customer_email: String(o.customer_email || o.customerEmail || ''),
    customer_phone: o.customer_phone || o.customerPhone || o.delivery_address?.phone_number || o.deliveryAddress?.phone || '',
    subtotal,
    delivery_fee: deliveryFee,
    total,
    payment_method: o.payment_method || o.paymentMethod || 'card',
    payment_status: o.payment_status || o.paymentStatus || 'pending',
    order_status: o.order_status || o.orderStatus || 'pending',
    delivery_address: {
      id: o.delivery_address?.id || 'addr-1',
      recipient_name:
        o.delivery_address?.recipient_name ||
        o.deliveryAddress?.recipientName ||
        o.customer_name ||
        o.customerName ||
        'Customer',
      phone_number:
        o.delivery_address?.phone_number ||
        o.deliveryAddress?.phone ||
        o.customer_phone ||
        o.customerPhone ||
        '',
      street_address:
        o.delivery_address?.street_address ||
        o.deliveryAddress?.address ||
        '',
      city:
        o.delivery_address?.city ||
        o.deliveryAddress?.city ||
        'Lagos',
      state:
        o.delivery_address?.state ||
        o.deliveryAddress?.state ||
        'Lagos State',
      is_default: true,
    },
    created_at: o.created_at || o.createdAt || new Date().toISOString(),
    updated_at: o.updated_at || o.updatedAt || new Date().toISOString(),
    items,
  };
}

export const OrderService = {
  /**
   * Initialize orders cache
   */
  async initializeOrders(): Promise<Order[]> {
    const existing = await StorageService.getItem<Order[]>(StorageKeys.ORDERS, []);
    return existing || [];
  },

  /**
   * Get all orders (for Admin) or filtered by customerId (for Customer)
   * Prioritizes live cloud backend (Vercel + MongoDB Atlas), then cached storage
   */
  async getOrders(customerId?: string): Promise<Order[]> {
    // 1. Try Live Cloud API (Vercel + MongoDB Atlas)
    try {
      const url = customerId
        ? `${API_BASE_URL}/orders?customerId=${encodeURIComponent(customerId)}`
        : `${API_BASE_URL}/orders`;

      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        const raw = json.data || json;
        if (Array.isArray(raw)) {
          const mapped = raw.map(mapOrder);
          await StorageService.setItem(StorageKeys.ORDERS, mapped);
          if (customerId) {
            return mapped.filter((o) => o.customer_id === customerId);
          }
          return mapped;
        }
      }
    } catch (apiErr) {
      console.log('Live orders API unreachable, checking alternatives:', apiErr);
    }

    // 2. Try Supabase fallback
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
        if (customerId) {
          query = query.eq('customer_id', customerId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped = data.map((d: any) =>
            mapOrder({
              ...d,
              items: d.order_items?.map((item: any) => ({
                id: item.id,
                productId: item.product_id,
                productName: item.product_name,
                productImage: item.product_image,
                unitPrice: Number(item.unit_price),
                quantity: item.quantity,
                total: Number(item.total_price ?? item.unit_price * item.quantity),
              })),
            })
          );
          return mapped;
        }
      } catch (sbErr) {
        console.log('Supabase orders fetch failed:', sbErr);
      }
    }

    // 3. Fallback to Local Storage cache
    const orders = await this.initializeOrders();
    if (customerId) {
      return orders.filter((o) => o.customer_id === customerId);
    }
    return orders;
  },

  /**
   * Get an order by its ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          return mapOrder(json.data);
        }
      }
    } catch (apiErr) {
      console.log(`Live order ${orderId} lookup failed:`, apiErr);
    }

    const orders = await this.getOrders();
    return orders.find((o) => o.id === orderId || o.order_number === orderId) || null;
  },

  /**
   * Create a new order during checkout
   * Posts to live cloud backend (MongoDB Atlas), decrements product stock, updates stats,
   * and preserves offline fallback
   */
  async createOrder(
    orderInput: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>
  ): Promise<Order> {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `SE-${randomDigits}`;
    const now = new Date().toISOString();

    const fallbackOrder: Order = {
      ...orderInput,
      id: 'ord-' + Date.now().toString(36),
      order_number: orderNumber,
      created_at: now,
      updated_at: now,
    };

    // 1. Try Live Cloud API (POST /api/orders)
    try {
      const payload = {
        customerId: orderInput.customer_id,
        customerName: orderInput.customer_name,
        customerEmail: orderInput.customer_email,
        customerPhone: orderInput.customer_phone,
        subtotal: orderInput.subtotal,
        deliveryFee: orderInput.delivery_fee,
        totalAmount: orderInput.total,
        currency: 'NGN',
        paymentMethod: orderInput.payment_method,
        paymentStatus: orderInput.payment_status,
        orderStatus: orderInput.order_status,
        deliveryAddress: {
          recipientName: orderInput.delivery_address.recipient_name,
          phone: orderInput.delivery_address.phone_number,
          city: orderInput.delivery_address.city,
          state: orderInput.delivery_address.state,
          address: orderInput.delivery_address.street_address,
        },
        items: orderInput.items.map((item) => ({
          productId: item.product_id,
          productName: item.product_name,
          productImage: item.product_image,
          unitPrice: item.unit_price,
          quantity: item.quantity,
          total: item.total,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const created = mapOrder(json.data);
          const current = await StorageService.getItem<Order[]>(StorageKeys.ORDERS, []);
          await StorageService.setItem(StorageKeys.ORDERS, [created, ...current]);
          return created;
        }
      }
    } catch (apiErr) {
      console.warn('Live API create order failed, falling back to Supabase/local:', apiErr);
    }

    // 2. Try Supabase fallback
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
          fallbackOrder.id = insertedOrder.id;
        }
      } catch (e) {
        console.warn('Could not insert order into Supabase, fallback to local storage:', e);
      }
    }

    // 3. Fallback to Local Storage
    const currentOrders = await this.initializeOrders();
    const updated = [fallbackOrder, ...currentOrders];
    await StorageService.setItem(StorageKeys.ORDERS, updated);

    return fallbackOrder;
  },

  /**
   * Admin: Update the status of an order
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    // 1. Try Live Cloud API (PATCH /api/orders/:id)
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ orderStatus: status }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const updated = mapOrder(json.data);
          const current = await StorageService.getItem<Order[]>(StorageKeys.ORDERS, []);
          const index = current.findIndex((o) => o.id === orderId);
          if (index !== -1) {
            current[index] = updated;
            await StorageService.setItem(StorageKeys.ORDERS, current);
          }
          return updated;
        }
      }
    } catch (apiErr) {
      console.warn('Live API update order status failed:', apiErr);
    }

    // 2. Try Supabase fallback
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ order_status: status, updated_at: new Date().toISOString() })
          .eq('id', orderId);
      } catch (sbErr) {
        console.warn('Supabase update order status failed:', sbErr);
      }
    }

    // 3. Fallback to Local Storage
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
   * Customer: Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      throw new Error(`Order ${orderId} not found`);
    }

    const order = orders[index];
    if (order.order_status === 'delivered') {
      throw new Error('Delivered orders cannot be cancelled');
    }

    const updatedOrder: Order = {
      ...order,
      order_status: 'cancelled',
      cancellation_reason: reason || 'Cancelled by customer',
      updated_at: new Date().toISOString(),
    };

    try {
      await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ orderStatus: 'cancelled', cancellationReason: reason }),
      });
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('orders')
          .update({
            order_status: 'cancelled',
            cancellation_reason: reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      } catch {}
    }

    const current = await StorageService.getItem<Order[]>(StorageKeys.ORDERS, []);
    const localIdx = current.findIndex((o) => o.id === orderId);
    if (localIdx !== -1) {
      current[localIdx] = updatedOrder;
      await StorageService.setItem(StorageKeys.ORDERS, current);
    }

    return updatedOrder;
  },

  /**
   * Admin: Compute sales metrics and revenue summaries directly from real orders
   */
  async getAdminStats(): Promise<AdminStats> {
    const orders = await this.getOrders();
    const products = await ProductService.getAllProductsForAdmin();

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.order_status === 'pending' || o.order_status === 'processing').length;
    const totalSales = orders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total : 0), 0);
    const uniqueCustomers = new Set(orders.map((o) => o.customer_email).filter(Boolean)).size;

    // Build real 6-month revenue from real orders
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(currentMonthIdx - 5 + i);
      return {
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        amount: 0,
      };
    });

    for (const order of orders) {
      if (order.payment_status === 'paid' && order.created_at) {
        const orderDate = new Date(order.created_at);
        const match = last6Months.find(
          (m) => m.monthNum === orderDate.getMonth() && m.year === orderDate.getFullYear()
        );
        if (match) {
          match.amount += order.total;
        }
      }
    }

    const monthlyRevenue = last6Months.map(({ month, amount }) => ({ month, amount }));

    return {
      total_products: products.length,
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      total_customers: uniqueCustomers,
      total_sales: totalSales,
      monthly_revenue: monthlyRevenue,
    };
  },
};
