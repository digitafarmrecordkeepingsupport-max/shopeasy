'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { formatNaira, formatDate } from '../lib/utils';
import { Order, OrderStatus } from '../types';

interface RecentOrdersTableProps {
  orders: Order[];
  onViewOrder?: (order: Order) => void;
}

export default function RecentOrdersTable({
  orders,
  onViewOrder,
}: RecentOrdersTableProps) {
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
      <span className={`${c.bg} text-[11px] font-bold px-3 py-1 rounded-full inline-block`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="text-[#6515D5]">
            <ShoppingCart size={20} />
          </div>
          <h3 className="text-base font-black text-[#171428]">Recent Orders</h3>
        </div>
        <Link
          href="/orders"
          className="text-xs font-bold text-[#6515D5] hover:text-[#4A0D9B] transition"
        >
          See All →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#F0EBF8] text-[11px] font-bold uppercase tracking-wider text-[#77738A]">
              <th className="pb-3 font-semibold">Order #</th>
              <th className="pb-3 font-semibold">Customer</th>
              <th className="pb-3 font-semibold">Amount</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F2FA] text-sm">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#F9F7FE] transition">
                <td className="py-3.5 font-bold text-[#171428]">{order.order_number}</td>
                <td className="py-3.5 text-[#171428] font-medium">{order.customer_name || 'Customer'}</td>
                <td className="py-3.5 font-black text-[#171428]">{formatNaira(order.total_amount)}</td>
                <td className="py-3.5">{getStatusBadge(order.order_status)}</td>
                <td className="py-3.5 text-xs text-[#77738A]">{formatDate(order.created_at)}</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => onViewOrder?.(order)}
                    className="text-xs font-bold text-[#6515D5] hover:text-[#4A0D9B] hover:underline"
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
