'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  ShoppingBag,
  ShoppingCart,
  Users,
  Box,
  TrendingUp,
  Lightbulb,
  Trophy,
  ChevronDown,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { AdminAuthService } from '../../services/adminAuth.service';
import { AdminDashboardService } from '../../services/adminDashboard.service';
import { formatNaira, formatDate } from '../../lib/utils';
import { DashboardStats, SalesDataPoint, Order, Product } from '../../types';

export default function AnalyticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Array<Product & { growth?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoad();
  }, [period]);

  const checkAuthAndLoad = async () => {
    const admin = await AdminAuthService.getCurrentAdmin();
    if (!admin) {
      router.push('/admin-login');
      return;
    }

    setIsLoading(true);
    try {
      const [statsRes, chartRes, ordersRes, productsRes] = await Promise.all([
        AdminDashboardService.getStats(),
        AdminDashboardService.getSalesChart(period),
        AdminDashboardService.getRecentOrders(),
        AdminDashboardService.getTopSellingProducts(),
      ]);

      setStats(statsRes);
      setSalesData(chartRes);
      setRecentOrders(ordersRes);
      setTopProducts(productsRes);
    } catch (e) {
      console.error('Error loading analytics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const maxAmount = Math.max(...salesData.map((d) => d.amount), 100000);

  return (
    <div className="flex min-h-screen bg-[#F8F6FD]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader searchPlaceholder="Search analytics..." />

        <main className="p-8 space-y-7 max-w-7xl mx-auto w-full">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#6515D5] flex items-center justify-center text-white shadow-md shadow-purple-600/20">
                <BarChart3 size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#171428] tracking-tight">
                  Live Analytics Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-[#77738A] mt-0.5 font-medium">
                  Real-time sales, order volume, and customer data from MongoDB Atlas.
                </p>
              </div>
            </div>

            {/* Period selector */}
            <div className="flex items-center bg-white border border-[#EAE6F3] p-1 rounded-2xl shadow-sm">
              {([7, 30, 90] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    period === p ? 'bg-[#6515D5] text-white shadow-sm' : 'text-[#77738A] hover:text-[#171428]'
                  }`}
                >
                  Last {p} Days
                </button>
              ))}
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Sales */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAE6F3] shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#6515D5] flex items-center justify-center text-white shadow-sm">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Sales</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">
                    {formatNaira(stats?.total_sales || 0)}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A]">{stats?.sales_growth || 'Live'}</span>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAE6F3] shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shadow-sm">
                  <ShoppingCart size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Orders</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">
                    {stats?.total_orders || 0}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A]">{stats?.orders_growth || 'Live'}</span>
            </div>

            {/* Total Customers */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAE6F3] shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#16A34A] flex items-center justify-center text-white shadow-sm">
                  <Users size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Customers</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">
                    {stats?.total_customers || 0}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A]">{stats?.customers_growth || 'Live'}</span>
            </div>

            {/* Total Products */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAE6F3] shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#D97706] flex items-center justify-center text-white shadow-sm">
                  <Box size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Products</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">
                    {stats?.total_products || 0}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A]">{stats?.products_growth || 'Live'}</span>
            </div>
          </div>

          {/* Row 2: Sales Overview Chart & Key Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Sales Overview Card */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={20} className="text-[#6515D5]" />
                  <h3 className="font-bold text-base text-[#171428]">Sales Overview ({period} Days)</h3>
                </div>
              </div>

              {/* Bar / Column Chart Representation */}
              <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-4 border-b border-[#F0EBF8]">
                {salesData.map((d, index) => {
                  const heightPercent = maxAmount > 0 ? Math.max((d.amount / maxAmount) * 100, 6) : 6;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition bg-[#171428] text-white text-[11px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-md">
                        {formatNaira(d.amount)} ({d.orders} orders)
                      </div>

                      <div className="w-full max-w-[48px] bg-purple-50 hover:bg-purple-100 rounded-t-xl overflow-hidden h-48 flex items-end">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full ${
                            d.amount > 0 ? 'bg-gradient-to-t from-[#6515D5] to-[#8B5CF6]' : 'bg-purple-200/50'
                          } rounded-t-xl transition-all duration-500`}
                        />
                      </div>

                      <span className="text-[11px] font-bold text-[#77738A]">{d.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 text-xs text-[#77738A]">
                <span>Total Period Revenue: <strong className="text-[#171428]">{formatNaira(salesData.reduce((s, d) => s + d.amount, 0))}</strong></span>
                <span>Total Orders: <strong className="text-[#171428]">{salesData.reduce((s, d) => s + d.orders, 0)}</strong></span>
              </div>
            </div>

            {/* Key Insights Card */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-[#6515D5] mb-4">
                  <Lightbulb size={20} />
                  <h3 className="font-bold text-base text-[#171428]">Store Insights</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#F8F6FD] rounded-xl border border-purple-100">
                    <div className="text-xs font-bold text-[#6515D5] uppercase tracking-wide">Live Orders</div>
                    <div className="text-sm font-semibold text-[#171428] mt-1">
                      {recentOrders.length} order(s) recorded in MongoDB database.
                    </div>
                  </div>

                  <div className="p-4 bg-[#F0FDF4] rounded-xl border border-emerald-100">
                    <div className="text-xs font-bold text-[#16A34A] uppercase tracking-wide">Catalog Status</div>
                    <div className="text-sm font-semibold text-[#171428] mt-1">
                      {stats?.total_products || 0} active product(s) published to customer mobile app.
                    </div>
                  </div>

                  <div className="p-4 bg-[#F0F7FF] rounded-xl border border-blue-100">
                    <div className="text-xs font-bold text-[#0284C7] uppercase tracking-wide">Backend Connection</div>
                    <div className="text-sm font-semibold text-[#171428] mt-1">
                      Real-time synchronized with Vercel Production API.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Top Selling Products & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Top Products */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm">
              <div className="flex items-center space-x-2 mb-4 text-[#D97706]">
                <Trophy size={20} />
                <h3 className="font-bold text-base text-[#171428]">Top Selling Products</h3>
              </div>

              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#77738A]">No sales records yet. Products will rank as customer orders come in.</div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[#F0EBF8]">
                      <div className="flex items-center space-x-3">
                        <img src={p.image_urls[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-purple-50" />
                        <div>
                          <div className="text-sm font-bold text-[#171428] line-clamp-1">{p.name}</div>
                          <div className="text-xs font-bold text-[#6515D5]">{formatNaira(p.price)}</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-purple-50 text-[#6515D5] rounded-md">
                        {p.growth || 'In Stock'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders Table */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart size={20} className="text-[#6515D5]" />
                  <h3 className="font-bold text-base text-[#171428]">Recent Orders</h3>
                </div>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#77738A]">No orders placed yet. Orders made via the mobile app will appear here live.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#F0EBF8] text-[11px] font-bold uppercase text-[#77738A]">
                        <th className="pb-3">Order #</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F2FA]">
                      {recentOrders.map((o) => (
                        <tr key={o.id}>
                          <td className="py-3 font-bold text-[#171428]">{o.order_number}</td>
                          <td className="py-3 text-[#171428]">{o.customer_name}</td>
                          <td className="py-3 font-bold text-[#171428]">{formatNaira(o.total_amount)}</td>
                          <td className="py-3">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#6515D5]">
                              {o.order_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
