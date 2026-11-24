import { DashboardStats, SalesDataPoint, Order, Product } from '../types';

export const AdminDashboardService = {
  /**
   * Fetches real live metrics directly from MongoDB Atlas API
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const [prodsRes, ordersRes, custsRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/orders').then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/customers').then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      const products: Product[] = Array.isArray(prodsRes.data) ? prodsRes.data : [];
      const orders: any[] = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const customers: any[] = Array.isArray(custsRes.data) ? custsRes.data : [];

      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalSales = orders.reduce(
        (sum, o) => sum + (o.paymentStatus === 'paid' || o.payment_status === 'paid' ? Number(o.totalAmount || o.total || 0) : 0),
        0
      );

      const uniqueCustomerCount = Math.max(
        customers.length,
        new Set(orders.map((o) => o.customerEmail || o.customer_email).filter(Boolean)).size
      );

      return {
        total_products: totalProducts,
        total_orders: totalOrders,
        total_customers: uniqueCustomerCount,
        total_sales: totalSales,
        products_growth: totalProducts > 0 ? `${totalProducts} Active` : '0 Active',
        orders_growth: totalOrders > 0 ? `${totalOrders} Orders` : '0 Orders',
        customers_growth: uniqueCustomerCount > 0 ? `${uniqueCustomerCount} Registered` : '0 Customers',
        sales_growth: totalSales > 0 ? 'Live Revenue' : 'No Sales Yet',
      };
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
      return {
        total_products: 0,
        total_orders: 0,
        total_customers: 0,
        total_sales: 0,
        products_growth: '0%',
        orders_growth: '0%',
        customers_growth: '0%',
        sales_growth: '0%',
      };
    }
  },

  /**
   * Computes sales trend data dynamically from real orders in MongoDB Atlas
   */
  async getSalesChart(days: 7 | 30 | 90 = 7): Promise<SalesDataPoint[]> {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      const orders: any[] = Array.isArray(json.data) ? json.data : [];

      if (days === 7) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result: SalesDataPoint[] = [];

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const label = dayNames[d.getDay()];

          const matchingOrders = orders.filter((o) => {
            const orderDate = (o.createdAt || o.created_at || '').split('T')[0];
            return orderDate === dateStr;
          });

          const dayAmount = matchingOrders.reduce(
            (sum, o) => sum + (o.paymentStatus === 'paid' || o.payment_status === 'paid' ? Number(o.totalAmount || o.total || 0) : 0),
            0
          );

          result.push({
            label,
            amount: dayAmount,
            orders: matchingOrders.length,
          });
        }

        return result;
      } else if (days === 30) {
        // Group into 4 weeks
        const result: SalesDataPoint[] = [
          { label: 'Week 1', amount: 0, orders: 0 },
          { label: 'Week 2', amount: 0, orders: 0 },
          { label: 'Week 3', amount: 0, orders: 0 },
          { label: 'Week 4', amount: 0, orders: 0 },
        ];

        const now = Date.now();
        orders.forEach((o) => {
          const orderTime = new Date(o.createdAt || o.created_at || now).getTime();
          const diffDays = Math.floor((now - orderTime) / (1000 * 60 * 60 * 24));
          const isPaid = o.paymentStatus === 'paid' || o.payment_status === 'paid';
          const amount = isPaid ? Number(o.totalAmount || o.total || 0) : 0;

          if (diffDays <= 7) {
            result[3].amount += amount;
            result[3].orders += 1;
          } else if (diffDays <= 14) {
            result[2].amount += amount;
            result[2].orders += 1;
          } else if (diffDays <= 21) {
            result[1].amount += amount;
            result[1].orders += 1;
          } else if (diffDays <= 30) {
            result[0].amount += amount;
            result[0].orders += 1;
          }
        });

        return result;
      } else {
        // 3 Months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();

        const result: SalesDataPoint[] = [
          { label: monthNames[(currentMonth - 2 + 12) % 12], amount: 0, orders: 0 },
          { label: monthNames[(currentMonth - 1 + 12) % 12], amount: 0, orders: 0 },
          { label: monthNames[currentMonth], amount: 0, orders: 0 },
        ];

        orders.forEach((o) => {
          const orderDate = new Date(o.createdAt || o.created_at || Date.now());
          const m = orderDate.getMonth();
          const isPaid = o.paymentStatus === 'paid' || o.payment_status === 'paid';
          const amount = isPaid ? Number(o.totalAmount || o.total || 0) : 0;

          if (m === currentMonth) {
            result[2].amount += amount;
            result[2].orders += 1;
          } else if (m === (currentMonth - 1 + 12) % 12) {
            result[1].amount += amount;
            result[1].orders += 1;
          } else if (m === (currentMonth - 2 + 12) % 12) {
            result[0].amount += amount;
            result[0].orders += 1;
          }
        });

        return result;
      }
    } catch (e) {
      console.error('Error computing sales chart:', e);
      return [
        { label: 'Mon', amount: 0, orders: 0 },
        { label: 'Tue', amount: 0, orders: 0 },
        { label: 'Wed', amount: 0, orders: 0 },
        { label: 'Thu', amount: 0, orders: 0 },
        { label: 'Fri', amount: 0, orders: 0 },
        { label: 'Sat', amount: 0, orders: 0 },
        { label: 'Sun', amount: 0, orders: 0 },
      ];
    }
  },

  /**
   * Fetches real recent orders from MongoDB Atlas
   */
  async getRecentOrders(): Promise<Order[]> {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      const raw: any[] = Array.isArray(json.data) ? json.data : [];

      return raw.slice(0, 6).map((o: any) => ({
        id: o.id || o._id?.toString() || '',
        order_number: o.orderNumber || o.order_number || `SE-${o.id}`,
        customer_name: o.customerName || o.customer_name || o.deliveryAddress?.recipientName || 'Customer',
        customer_email: o.customerEmail || o.customer_email || '',
        customer_phone: o.customerPhone || o.customer_phone || '',
        total_amount: Number(o.totalAmount ?? o.total ?? 0),
        subtotal: Number(o.subtotal || 0),
        delivery_fee: Number(o.deliveryFee ?? o.delivery_fee ?? 0),
        discount: Number(o.discount || 0),
        currency: o.currency || 'NGN',
        payment_method: o.paymentMethod || o.payment_method || 'card',
        payment_status: o.paymentStatus || o.payment_status || 'pending',
        order_status: o.orderStatus || o.order_status || 'pending',
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
    } catch (e) {
      console.error('Error fetching recent orders:', e);
      return [];
    }
  },

  /**
   * Fetches real top-selling products based on real order volume
   */
  async getTopSellingProducts(): Promise<Array<Product & { growth?: string }>> {
    try {
      const [prodsRes, ordersRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/orders').then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      const rawProducts: any[] = Array.isArray(prodsRes.data) ? prodsRes.data : [];
      const rawOrders: any[] = Array.isArray(ordersRes.data) ? ordersRes.data : [];

      // Count order sales by product ID
      const salesMap = new Map<string, number>();
      rawOrders.forEach((o) => {
        if (Array.isArray(o.items)) {
          o.items.forEach((it: any) => {
            const pId = it.productId || it.product_id;
            if (pId) {
              salesMap.set(pId, (salesMap.get(pId) || 0) + (it.quantity || 1));
            }
          });
        }
      });

      const products: Product[] = rawProducts.map((p: any) => ({
        id: p.id || p._id?.toString() || '',
        name: p.name || 'Product',
        slug: p.slug || '',
        description: p.description || '',
        category_id: p.categoryId || p.category_id || '',
        category_name: p.categoryName || p.category_name || '',
        price: Number(p.price || 0),
        original_price: p.originalPrice ? Number(p.originalPrice) : undefined,
        stock_quantity: Number(p.stockQuantity ?? p.stock_quantity ?? 0),
        sku: p.sku || '',
        image_urls: Array.isArray(p.imageUrls) ? p.imageUrls : (Array.isArray(p.image_urls) ? p.image_urls : []),
        is_featured: Boolean(p.isFeatured ?? p.is_featured),
        is_active: Boolean(p.isActive ?? p.is_active ?? true),
        created_at: p.createdAt || p.created_at || new Date().toISOString(),
      }));

      // Sort products by sales volume
      products.sort((a, b) => (salesMap.get(b.id) || 0) - (salesMap.get(a.id) || 0));

      return products.slice(0, 5).map((p) => {
        const sold = salesMap.get(p.id) || 0;
        return {
          ...p,
          growth: sold > 0 ? `${sold} sold` : 'In stock',
        };
      });
    } catch (e) {
      console.error('Error fetching top products:', e);
      return [];
    }
  },
};
