import { Order, OrderStatus } from '../types';

export interface OrderFulfillmentData {
  orderStatus?: OrderStatus | string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  cancellationReason?: string;
  adminEmail?: string;
}

export const AdminOrderService = {
  /**
   * Fetches real orders from MongoDB Atlas
   */
  async getOrders(statusFilter = 'all'): Promise<Order[]> {
    try {
      const url = statusFilter !== 'all' ? `/api/orders?status=${statusFilter}` : '/api/orders';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const raw: any[] = Array.isArray(json.data) ? json.data : [];

        return raw.map((o: any) => ({
          id: o.id || o._id?.toString() || '',
          order_number: o.orderNumber || o.order_number || `SE-${o.id}`,
          customer_name: o.customerName || o.customer_name || o.deliveryAddress?.recipientName || 'Customer',
          customer_email: o.customerEmail || o.customer_email || '',
          customer_phone: o.customerPhone || o.customer_phone || o.deliveryAddress?.phone || '',
          total_amount: Number(o.totalAmount ?? o.total ?? 0),
          subtotal: Number(o.subtotal || 0),
          delivery_fee: Number(o.deliveryFee ?? o.delivery_fee ?? 0),
          discount: Number(o.discount || 0),
          currency: o.currency || 'NGN',
          payment_method: o.paymentMethod || o.payment_method || 'card',
          payment_status: o.paymentStatus || o.payment_status || 'pending',
          order_status: o.orderStatus || o.order_status || 'pending',
          tracking_number: o.trackingNumber || o.tracking_number || '',
          carrier: o.carrier || '',
          estimated_delivery: o.estimatedDelivery || o.estimated_delivery || '',
          cancellation_reason: o.cancellationReason || o.cancellation_reason || '',
          delivery_address_snapshot: {
            recipient_name: o.deliveryAddress?.recipientName || o.customerName || 'Customer',
            phone: o.deliveryAddress?.phone || o.customerPhone || '',
            address: o.deliveryAddress?.address || '',
            city: o.deliveryAddress?.city || 'Lagos',
            state: o.deliveryAddress?.state || 'Lagos State',
          },
          items: Array.isArray(o.items)
            ? o.items.map((it: any) => ({
                id: it.id || it._id?.toString() || it.productId || '',
                order_id: o.id || o._id?.toString() || '',
                product_name: it.productName || it.product_name || 'Product',
                product_image: it.productImage || it.product_image || '',
                unit_price: Number(it.unitPrice ?? it.unit_price ?? 0),
                quantity: Number(it.quantity || 1),
                subtotal: Number(it.total ?? it.totalPrice ?? (Number(it.unitPrice || 0) * Number(it.quantity || 1))),
              }))
            : [],
          created_at: o.createdAt || o.created_at || new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.error('Error fetching admin orders:', e);
    }
    return [];
  },

  /**
   * Updates order status in MongoDB Atlas
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
      return res.ok;
    } catch (e) {
      console.error('Error updating order status:', e);
      return false;
    }
  },

  /**
   * Updates order tracking, carrier, estimated delivery, and status
   */
  async updateOrderFulfillment(orderId: string, data: OrderFulfillmentData): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch (e) {
      console.error('Error updating order fulfillment:', e);
      return false;
    }
  },
};
