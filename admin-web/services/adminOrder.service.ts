import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Order, OrderStatus } from '../types';

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-108',
    order_number: 'SE20251125-108',
    customer_name: 'John Doe',
    customer_email: 'john.doe@gmail.com',
    customer_phone: '+234 801 234 5678',
    total_amount: 47000,
    subtotal: 45000,
    delivery_fee: 2000,
    discount: 0,
    currency: 'NGN',
    payment_method: 'card',
    payment_status: 'paid',
    order_status: 'delivered',
    delivery_address_snapshot: {
      recipient_name: 'John Doe',
      phone: '+234 801 234 5678',
      address: '12 Admiralty Way',
      city: 'Lekki',
      state: 'Lagos',
    },
    items: [
      {
        id: 'item-1',
        order_id: 'ord-108',
        product_name: 'Wireless Headphones',
        product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
        unit_price: 45000,
        quantity: 1,
        subtotal: 45000,
      },
    ],
    created_at: '2025-11-25T14:20:00Z',
  },
  {
    id: 'ord-107',
    order_number: 'SE20251125-107',
    customer_name: 'Sarah Mike',
    customer_email: 'sarah.mike@gmail.com',
    customer_phone: '+234 802 345 6789',
    total_amount: 35000,
    subtotal: 33000,
    delivery_fee: 2000,
    discount: 0,
    currency: 'NGN',
    payment_method: 'paystack',
    payment_status: 'paid',
    order_status: 'shipped',
    delivery_address_snapshot: {
      recipient_name: 'Sarah Mike',
      phone: '+234 802 345 6789',
      address: '45 Gana Street',
      city: 'Maitama',
      state: 'Abuja',
    },
    items: [
      {
        id: 'item-2',
        order_id: 'ord-107',
        product_name: 'Casual Sneakers',
        product_image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800',
        unit_price: 33000,
        quantity: 1,
        subtotal: 33000,
      },
    ],
    created_at: '2025-11-25T11:45:00Z',
  },
  {
    id: 'ord-106',
    order_number: 'SE20251124-106',
    customer_name: 'David King',
    customer_email: 'david.king@gmail.com',
    customer_phone: '+234 803 456 7890',
    total_amount: 28000,
    subtotal: 26000,
    delivery_fee: 2000,
    discount: 0,
    currency: 'NGN',
    payment_method: 'transfer',
    payment_status: 'paid',
    order_status: 'processing',
    delivery_address_snapshot: {
      recipient_name: 'David King',
      phone: '+234 803 456 7890',
      address: '18 Olu Obasanjo Road',
      city: 'Port Harcourt',
      state: 'Rivers',
    },
    items: [
      {
        id: 'item-3',
        order_id: 'ord-106',
        product_name: 'Handbag',
        product_image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800',
        unit_price: 26000,
        quantity: 1,
        subtotal: 26000,
      },
    ],
    created_at: '2025-11-24T16:10:00Z',
  },
  {
    id: 'ord-105',
    order_number: 'SE20251124-105',
    customer_name: 'Grace James',
    customer_email: 'grace.james@gmail.com',
    customer_phone: '+234 804 567 8901',
    total_amount: 52000,
    subtotal: 50000,
    delivery_fee: 2000,
    discount: 0,
    currency: 'NGN',
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    order_status: 'pending',
    delivery_address_snapshot: {
      recipient_name: 'Grace James',
      phone: '+234 804 567 8901',
      address: '8 Ring Road',
      city: 'Ibadan',
      state: 'Oyo',
    },
    items: [
      {
        id: 'item-4',
        order_id: 'ord-105',
        product_name: 'Smart Watch',
        product_image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
        unit_price: 50000,
        quantity: 1,
        subtotal: 50000,
      },
    ],
    created_at: '2025-11-24T09:30:00Z',
  },
];

export const AdminOrderService = {
  async getOrders(statusFilter = 'all'): Promise<Order[]> {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('orders').select('*, items:order_items(*)');
      if (statusFilter !== 'all') {
        query = query.eq('order_status', statusFilter);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) {
        return data as Order[];
      }
    }

    if (statusFilter === 'all') return INITIAL_ORDERS;
    return INITIAL_ORDERS.filter((o) => o.order_status === statusFilter);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) return false;

      // If cancelling, call database function to restore stock
      if (status === 'cancelled') {
        await supabase.rpc('restore_order_inventory', { p_order_id: orderId });
      }
      return true;
    }

    const order = INITIAL_ORDERS.find((o) => o.id === orderId);
    if (order) {
      order.order_status = status;
    }
    return true;
  },
};
