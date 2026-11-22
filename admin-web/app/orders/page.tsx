'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Search,
  Eye,
  X,
  MapPin,
  Calendar,
  CreditCard,
  User,
  CheckCircle2,
  Clock,
  Truck,
  Package,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { AdminOrderService } from '../../services/adminOrder.service';
import { AdminAuthService } from '../../services/adminAuth.service';
import { formatNaira, formatDate } from '../../lib/utils';
import { Order, OrderStatus } from '../../types';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filterTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    checkAuthAndLoad();
  }, [statusFilter]);

  const checkAuthAndLoad = async () => {
    const admin = await AdminAuthService.getCurrentAdmin();
    if (!admin) {
      router.push('/admin-login');
      return;
    }
    const data = await AdminOrderService.getOrders(statusFilter);
    setOrders(data);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const success = await AdminOrderService.updateOrderStatus(orderId, newStatus);
    if (success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: newStatus });
      }
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config: Record<OrderStatus, { bg: string; text: string; label: string }> = {
      delivered: { bg: 'bg-[#DCFCE7] text-[#16A34A]', text: 'text-[#16A34A]', label: 'Delivered' },
      shipped: { bg: 'bg-[#DBEAFE] text-[#2563EB]', text: 'text-[#2563EB]', label: 'Shipped' },
      processing: { bg: 'bg-[#FEF3C7] text-[#D97706]', text: 'text-[#D97706]', label: 'Processing' },
      pending: { bg: 'bg-[#EDE9FE] text-[#7C3AED]', text: 'text-[#7C3AED]', label: 'Pending' },
      cancelled: { bg: 'bg-[#FEE2E2] text-[#EF4444]', text: 'text-[#EF4444]', label: 'Cancelled' },
    };
    const c = config[status] || config.pending;
    return (
      <span className={`${c.bg} text-xs font-bold px-3 py-1 rounded-full inline-block`}>
        {c.label}
      </span>
    );
  };

  const filteredOrders = orders.filter((o) => {
    const query = searchQuery.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(query) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex min-h-screen bg-[#F8F6FD]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader searchPlaceholder="Search order number or customer..." onSearch={setSearchQuery} />

        <main className="p-8 space-y-7 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#171428] tracking-tight flex items-center space-x-2.5">
                <ShoppingCart size={28} className="text-[#6515D5]" />
                <span>Order Management</span>
              </h1>
              <p className="text-sm text-[#77738A] mt-1 font-medium">
                Track, process, and update status of customer orders across Nigeria.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6F3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    statusFilter === tab.id
                      ? 'bg-[#6515D5] text-white shadow-sm'
                      : 'bg-[#F7F5FC] text-[#77738A] hover:text-[#171428]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full pl-9 pr-4 py-2 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs text-[#171428] placeholder-[#77738A] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/20 focus:border-[#6515D5]"
              />
              <Search size={15} className="absolute left-3 top-2.5 text-[#77738A]" />
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8FD] border-b border-[#EAE6F3] text-xs font-bold uppercase tracking-wider text-[#77738A]">
                  <tr>
                    <th className="py-4 px-6">Order #</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Payment</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Order Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2FA] text-sm">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FAF8FE] transition">
                      <td className="py-4 px-6 font-bold text-[#171428]">{o.order_number}</td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#171428]">{o.customer_name || 'Customer'}</div>
                        <div className="text-xs text-[#77738A]">{o.customer_email || 'Verified Buyer'}</div>
                      </td>
                      <td className="py-4 px-6 text-xs text-[#77738A]">{formatDate(o.created_at)}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                            o.payment_status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {o.payment_status.toUpperCase()} ({o.payment_method})
                        </span>
                      </td>
                      <td className="py-4 px-6 font-black text-[#6515D5]">{formatNaira(o.total_amount)}</td>
                      <td className="py-4 px-6">{getStatusBadge(o.order_status)}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-1.5 rounded-xl bg-[#F8F6FD] hover:bg-[#F0EAFB] text-[#6515D5] text-xs font-bold transition inline-flex items-center space-x-1"
                        >
                          <Eye size={14} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full border border-[#EAE6F3] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-[#77738A] hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-[#77738A]">Order Details</span>
                <h3 className="text-xl font-black text-[#171428]">{selectedOrder.order_number}</h3>
              </div>
              <div>{getStatusBadge(selectedOrder.order_status)}</div>
            </div>

            {/* Quick Status Control Bar */}
            <div className="my-5 p-4 rounded-2xl bg-[#F8F6FD] border border-[#EAE6F3]">
              <div className="text-xs font-bold text-[#171428] mb-2">Update Order Status:</div>
              <div className="flex flex-wrap gap-2">
                {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                      selectedOrder.order_status === st
                        ? 'bg-[#6515D5] text-white shadow-sm'
                        : 'bg-white border border-[#EAE6F3] text-[#77738A] hover:text-[#171428]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Delivery Details */}
            <div className="space-y-3 text-sm pb-5 border-b border-gray-100">
              <div className="text-xs font-bold text-[#77738A] uppercase">Delivery Address</div>
              <div className="font-bold text-[#171428]">{selectedOrder.customer_name || 'Customer'}</div>
              <div className="text-xs text-[#55516B]">
                {selectedOrder.delivery_address_snapshot?.address || '12 Victoria Island Boulevard'},{' '}
                {selectedOrder.delivery_address_snapshot?.city || 'Lagos'}
              </div>
              <div className="text-xs text-[#55516B]">
                Phone: {selectedOrder.customer_phone || selectedOrder.delivery_address_snapshot?.phone || '+234 801 234 5678'}
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="py-4 space-y-3 border-b border-gray-100">
              <div className="text-xs font-bold text-[#77738A] uppercase">Items Ordered</div>
              {(selectedOrder.items || [
                {
                  id: 'item-1',
                  order_id: selectedOrder.id,
                  product_name: 'Wireless Headphones',
                  product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
                  unit_price: selectedOrder.subtotal || 45000,
                  quantity: 1,
                  subtotal: selectedOrder.subtotal || 45000,
                },
              ]).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#EAE6F3]"
                    />
                    <div>
                      <div className="font-bold text-[#171428]">{item.product_name}</div>
                      <div className="text-xs text-[#77738A]">Qty: {item.quantity} × {formatNaira(item.unit_price)}</div>
                    </div>
                  </div>
                  <div className="font-bold text-[#171428]">{formatNaira(item.subtotal)}</div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#77738A]">
                <span>Subtotal</span>
                <span className="font-bold text-[#171428]">{formatNaira(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#77738A]">
                <span>Delivery Fee</span>
                <span className="font-bold text-[#171428]">{formatNaira(selectedOrder.delivery_fee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#171428] pt-2 border-t border-gray-100">
                <span>Grand Total</span>
                <span className="text-[#6515D5]">{formatNaira(selectedOrder.total_amount)}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="py-2.5 px-6 rounded-xl bg-[#6515D5] text-white font-bold text-sm hover:bg-[#520FB3] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
