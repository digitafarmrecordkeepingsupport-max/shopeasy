'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  ShoppingCart,
  Users,
  Coins,
  FileText,
  Calendar,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import MetricCard from '../../components/MetricCard';
import SalesOverviewChart from '../../components/SalesOverviewChart';
import RecentOrdersTable from '../../components/RecentOrdersTable';
import TopSellingProducts from '../../components/TopSellingProducts';
import { AdminDashboardService } from '../../services/adminDashboard.service';
import { AdminAuthService } from '../../services/adminAuth.service';
import { formatNaira } from '../../lib/utils';
import { DashboardStats, SalesDataPoint, Order, Product, AdminProfile } from '../../types';

export default function DashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Array<Product & { growth?: string }>>([]);
  const [chartPeriod, setChartPeriod] = useState<7 | 30 | 90>(7);
  const [dateRange, setDateRange] = useState('Last 7 Days');

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const currentAdmin = await AdminAuthService.getCurrentAdmin();
    if (!currentAdmin) {
      router.push('/admin-login');
      return;
    }
    setAdmin(currentAdmin);
    loadData(7);
  };

  const loadData = async (period: 7 | 30 | 90) => {
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
  };

  const handlePeriodChange = (p: 7 | 30 | 90) => {
    setChartPeriod(p);
    loadData(p);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F6FD]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="p-8 space-y-7 max-w-7xl mx-auto w-full">
          {/* Welcome Banner Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#171428] tracking-tight flex items-center gap-2">
                <span>Welcome back, {admin?.full_name ? admin.full_name.split(' ')[0] : 'Admin'}!</span>
                <span className="text-2xl">👋</span>
              </h1>
              <p className="text-sm text-[#77738A] mt-1 font-medium">
                Live dashboard connected to MongoDB Atlas & Cloudinary.
              </p>
            </div>

            {/* Date Range Selector Pill */}
            <div className="flex items-center bg-white px-4 py-2.5 rounded-2xl border border-[#EAE6F3] shadow-sm space-x-2 text-xs font-bold text-[#171428]">
              <Calendar size={15} className="text-[#6515D5]" />
              <select
                value={dateRange}
                onChange={(e) => {
                  const val = e.target.value;
                  setDateRange(val);
                  if (val === 'Last 7 Days') handlePeriodChange(7);
                  else if (val === 'Last 30 Days') handlePeriodChange(30);
                  else if (val === 'Last 90 Days') handlePeriodChange(90);
                }}
                className="bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
              </select>
            </div>
          </div>

          {/* 4 Overview Metric Cards with Real Live Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard
              title="Total Products"
              value={stats ? stats.total_products.toLocaleString() : '0'}
              trend={stats?.products_growth || 'Active'}
              variant="purple"
              icon={<ShoppingBag size={24} />}
            />

            <MetricCard
              title="Total Orders"
              value={stats ? stats.total_orders.toLocaleString() : '0'}
              trend={stats?.orders_growth || 'Total'}
              variant="blue"
              icon={<ShoppingCart size={24} />}
            />

            <MetricCard
              title="Total Customers"
              value={stats ? stats.total_customers.toLocaleString() : '0'}
              trend={stats?.customers_growth || 'Registered'}
              variant="green"
              icon={<Users size={24} />}
            />

            <MetricCard
              title="Total Sales"
              value={formatNaira(stats?.total_sales ?? 0)}
              trend={stats?.sales_growth || 'Live'}
              variant="orange"
              icon={<Coins size={24} />}
            />
          </div>

          {/* Middle Row: Sales Overview (2/3) & Quick Actions + Promo (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Sales Chart (8 Cols) */}
            <div className="lg:col-span-8">
              <SalesOverviewChart
                data={salesData}
                period={chartPeriod}
                onPeriodChange={handlePeriodChange}
              />
            </div>

            {/* Quick Actions (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm">
                <div className="flex items-center space-x-2 text-sm font-black text-[#171428] mb-4">
                  <Sparkles size={18} className="text-[#6515D5]" />
                  <span>Quick Actions</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/products"
                    className="p-3.5 rounded-2xl bg-[#F8F6FD] hover:bg-[#F2EDFB] border border-[#EAE6F3] flex flex-col items-center justify-center text-center transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#6515D5] shadow-sm mb-2 group-hover:scale-105 transition">
                      <Package size={18} />
                    </div>
                    <span className="text-xs font-bold text-[#171428]">Add Product</span>
                  </Link>

                  <Link
                    href="/orders"
                    className="p-3.5 rounded-2xl bg-[#F8F6FD] hover:bg-[#F2EDFB] border border-[#EAE6F3] flex flex-col items-center justify-center text-center transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#2563EB] shadow-sm mb-2 group-hover:scale-105 transition">
                      <ShoppingCart size={18} />
                    </div>
                    <span className="text-xs font-bold text-[#171428]">View Orders</span>
                  </Link>

                  <Link
                    href="/customers"
                    className="p-3.5 rounded-2xl bg-[#F8F6FD] hover:bg-[#F2EDFB] border border-[#EAE6F3] flex flex-col items-center justify-center text-center transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#16A34A] shadow-sm mb-2 group-hover:scale-105 transition">
                      <Users size={18} />
                    </div>
                    <span className="text-xs font-bold text-[#171428]">Customers</span>
                  </Link>

                  <Link
                    href="/analytics"
                    className="p-3.5 rounded-2xl bg-[#F8F6FD] hover:bg-[#F2EDFB] border border-[#EAE6F3] flex flex-col items-center justify-center text-center transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#D97706] shadow-sm mb-2 group-hover:scale-105 transition">
                      <FileText size={18} />
                    </div>
                    <span className="text-xs font-bold text-[#171428]">Analytics</span>
                  </Link>
                </div>
              </div>

              {/* Status Banner */}
              <div className="bg-gradient-to-tr from-[#6515D5] to-[#8B5CF6] rounded-2xl p-6 text-white shadow-lg shadow-purple-600/20 relative overflow-hidden">
                <div className="relative z-10 max-w-xs">
                  <h4 className="text-lg font-black tracking-tight">Database Connected</h4>
                  <p className="text-xs text-purple-100/90 mt-1 mb-4 leading-relaxed">
                    MongoDB Atlas & Cloudinary are connected with real-time sync to the Expo mobile app.
                  </p>
                  <Link
                    href="/products"
                    className="inline-block py-2.5 px-4 rounded-xl bg-[#FFB21A] hover:bg-[#E69E10] text-[#171428] text-xs font-bold shadow-md transition"
                  >
                    Manage Products →
                  </Link>
                </div>

                <div className="absolute -bottom-2 -right-4 w-28 h-28 opacity-25 pointer-events-none">
                  <ShoppingCart size={110} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Recent Orders (8 Cols) & Top Selling Products (4 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            <div className="lg:col-span-8">
              <RecentOrdersTable
                orders={recentOrders}
                onViewOrder={(o) => router.push('/orders')}
              />
            </div>

            <div className="lg:col-span-4">
              <TopSellingProducts products={topProducts} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
