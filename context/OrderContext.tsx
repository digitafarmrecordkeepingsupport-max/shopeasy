import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus, AdminStats } from '../types';
import { OrderService } from '../services/order.service';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  placeOrder: (orderInput: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<Order>;
  getOrderById: (orderId: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
  getAdminStats: () => Promise<AdminStats>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, role } = useAuth();

  useEffect(() => {
    loadOrders();
  }, [user?.id, role]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      // If admin, load all orders; if customer, load customer's orders
      const customerFilter = role === 'admin' ? undefined : user?.id;
      const data = await OrderService.getOrders(customerFilter);
      setOrders(data);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOrders = async () => {
    await loadOrders();
  };

  const placeOrder = async (
    orderInput: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>
  ): Promise<Order> => {
    const created = await OrderService.createOrder(orderInput);
    setOrders((prev) => [created, ...prev]);
    return created;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
    const updated = await OrderService.updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    return updated;
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find((o) => o.id === orderId);
  };

  const getAdminStats = async (): Promise<AdminStats> => {
    return await OrderService.getAdminStats();
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        placeOrder,
        updateOrderStatus,
        getOrderById,
        refreshOrders,
        getAdminStats,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
