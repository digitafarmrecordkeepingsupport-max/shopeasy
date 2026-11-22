'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  PieChart as PieIcon,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { formatNaira } from '../../lib/utils';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(8); // Default to Nov 18

  // Time-series data points matching reference image 2
  const timeSeriesData = [
    { date: 'Oct 25', amount: 260000, y: 74 },
    { date: 'Oct 28', amount: 370000, y: 63 },
    { date: 'Oct 31', amount: 340000, y: 66 },
    { date: 'Nov 3', amount: 480000, y: 52 },
    { date: 'Nov 6', amount: 420000, y: 58 },
    { date: 'Nov 9', amount: 360000, y: 64 },
    { date: 'Nov 12', amount: 510000, y: 49 },
    { date: 'Nov 15', amount: 620000, y: 38 },
    { date: 'Nov 18', amount: 782000, y: 22 }, // Active reference point
    { date: 'Nov 21', amount: 690000, y: 31 },
    { date: 'Nov 24', amount: 680000, y: 32 },
  ];

  // Top selling products matching image 2
  const topProducts = [
    {
      id: 1,
      rank: 1,
      name: 'Wireless Sneakers',
      price: 35000,
      sold: 245,
      progress: 88,
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=300',
    },
    {
      id: 2,
      rank: 2,
      name: 'Smart Watch',
      price: 45000,
      sold: 189,
      progress: 68,
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=300',
    },
    {
      id: 3,
      rank: 3,
      name: 'Wireless Earbuds',
      price: 25000,
      sold: 143,
      progress: 52,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=300',
    },
  ];

  // Recent orders matching image 2
  const recentOrders = [
    {
      order_number: '#SE20251124-106',
      customer: 'Grace James',
      amount: 52000,
      status: 'Delivered',
      date: 'Nov 24, 2025',
    },
    {
      order_number: '#SE20251124-105',
      customer: 'David King',
      amount: 28000,
      status: 'Processing',
      date: 'Nov 24, 2025',
    },
    {
      order_number: '#SE20251124-104',
      customer: 'Sarah Mike',
      amount: 35000,
      status: 'Shipped',
      date: 'Nov 23, 2025',
    },
    {
      order_number: '#SE20251124-103',
      customer: 'John Doe',
      amount: 47000,
      status: 'Pending',
      date: 'Nov 23, 2025',
    },
    {
      order_number: '#SE20251124-102',
      customer: 'Jane Doe',
      amount: 25000,
      status: 'Delivered',
      date: 'Nov 22, 2025',
    },
  ];

  // SVG spline path generator
  const getSplinePath = () => {
    const points = timeSeriesData.map((d, index) => {
      const x = (index / (timeSeriesData.length - 1)) * 1000;
      const y = (d.y / 100) * 260 + 20;
      return [x, y];
    });

    let path = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
    }
    return path;
  };

  const splinePath = getSplinePath();
  const areaPath = `${splinePath} L 1000 300 L 0 300 Z`;

  return (
    <div className="flex min-h-screen bg-[#F8F6FD]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader searchPlaceholder="Search anything..." />

        <main className="p-8 space-y-7 max-w-7xl mx-auto w-full">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#6515D5] flex items-center justify-center text-white shadow-md shadow-purple-600/20">
                <BarChart3 size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#171428] tracking-tight">
                  Analytics Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-[#77738A] mt-0.5 font-medium">
                  Track your store performance and grow your business.
                </p>
              </div>
            </div>

            {/* Date filter dropdown */}
            <div className="relative self-start sm:self-auto">
              <div className="flex items-center space-x-2 bg-white border border-[#EAE6F3] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#171428] shadow-sm cursor-pointer hover:bg-purple-50/50 transition">
                <Calendar size={16} className="text-[#6515D5]" />
                <span>Last 30 Days</span>
                <ChevronDown size={14} className="text-[#77738A]" />
              </div>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Sales */}
            <div className="bg-[#FAF5FF] rounded-2xl p-5 border border-purple-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#6515D5] flex items-center justify-center text-white shadow-sm">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Sales</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">₦1,245,000</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] flex items-center">
                ↑ +22%
              </span>
            </div>

            {/* Total Orders */}
            <div className="bg-[#F0F7FF] rounded-2xl p-5 border border-blue-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shadow-sm">
                  <ShoppingCart size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Orders</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">856</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] flex items-center">
                ↑ +18%
              </span>
            </div>

            {/* Total Customers */}
            <div className="bg-[#F0FDF4] rounded-2xl p-5 border border-emerald-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#16A34A] flex items-center justify-center text-white shadow-sm">
                  <Users size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Customers</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">3,240</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] flex items-center">
                ↑ +15%
              </span>
            </div>

            {/* Total Products */}
            <div className="bg-[#FFF9EB] rounded-2xl p-5 border border-amber-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#D97706] flex items-center justify-center text-white shadow-sm">
                  <Box size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Products</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">248</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] flex items-center">
                ↑ +12%
              </span>
            </div>
          </div>

          {/* Row 2: Sales Overview Chart (col-8) & Key Insights (col-4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Sales Overview Card */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={20} className="text-[#6515D5]" />
                  <h3 className="font-bold text-base text-[#171428]">Sales Overview</h3>
                </div>

                {/* Period Pills */}
                <div className="flex items-center bg-[#F7F5FC] p-1 rounded-xl">
                  <button
                    onClick={() => setPeriod(7)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      period === 7
                        ? 'bg-[#6515D5] text-white shadow-xs'
                        : 'text-[#77738A] hover:text-[#171428]'
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setPeriod(30)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      period === 30
                        ? 'bg-[#6515D5] text-white shadow-xs'
                        : 'text-[#77738A] hover:text-[#171428]'
                    }`}
                  >
                    30 Days
                  </button>
                  <button
                    onClick={() => setPeriod(90)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      period === 90
                        ? 'bg-[#6515D5] text-white shadow-xs'
                        : 'text-[#77738A] hover:text-[#171428]'
                    }`}
                  >
                    90 Days
                  </button>
                </div>
              </div>

              {/* Chart Visual with exact Tooltip */}
              <div className="relative w-full h-64 mt-2">
                {/* Y Axis Guide Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] text-[#77738A] font-semibold">
                  <div className="flex items-center justify-between border-b border-[#F1ECF9]">
                    <span>1M</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F1ECF9]">
                    <span>750k</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F1ECF9]">
                    <span>500k</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F1ECF9]">
                    <span>250k</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>0</span>
                  </div>
                </div>

                {/* SVG Spline */}
                <svg
                  viewBox="0 0 1000 300"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="purpleGradientArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area Fill */}
                  <path d={areaPath} fill="url(#purpleGradientArea)" />

                  {/* Spline Stroke Line */}
                  <path
                    d={splinePath}
                    fill="none"
                    stroke="#6515D5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Circles on Points */}
                  {timeSeriesData.map((d, idx) => {
                    const x = (idx / (timeSeriesData.length - 1)) * 1000;
                    const y = (d.y / 100) * 260 + 20;
                    const isHovered = hoveredPoint === idx;
                    return (
                      <g key={idx} className="cursor-pointer">
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 6 : 4}
                          fill="#6515D5"
                          stroke="#FFFFFF"
                          strokeWidth={isHovered ? 3 : 2}
                          onMouseEnter={() => setHoveredPoint(idx)}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Active Tooltip (Nov 18, 2025 - ₦782,000) */}
                {hoveredPoint !== null && (
                  <div
                    className="absolute pointer-events-none -translate-x-1/2 -translate-y-full transition-all duration-150"
                    style={{
                      left: `${(hoveredPoint / (timeSeriesData.length - 1)) * 100}%`,
                      top: `${timeSeriesData[hoveredPoint].y}%`,
                    }}
                  >
                    <div className="bg-[#171428] text-white px-3 py-1.5 rounded-xl shadow-xl text-center mb-2.5">
                      <div className="text-xs font-black text-white">
                        {formatNaira(timeSeriesData[hoveredPoint].amount)}
                      </div>
                      <div className="text-[10px] text-purple-200/90 font-medium">
                        ● {timeSeriesData[hoveredPoint].date}, 2025
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between items-center text-[11px] font-semibold text-[#77738A] mt-4 pt-2 border-t border-[#F1ECF9]">
                {timeSeriesData.map((d, idx) => (
                  <span
                    key={idx}
                    onClick={() => setHoveredPoint(idx)}
                    className={`cursor-pointer hover:text-[#6515D5] transition ${
                      hoveredPoint === idx ? 'text-[#6515D5] font-bold' : ''
                    }`}
                  >
                    {d.date}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Insights Card (col-4) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb size={20} className="text-[#6515D5]" />
                <h3 className="font-bold text-base text-[#171428]">Key Insights</h3>
              </div>

              <div className="space-y-4">
                {/* 1. Sales Growth */}
                <div className="bg-[#FAF8FE] rounded-2xl p-4 border border-[#EAE6F3] flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0 font-bold">
                      ↑
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#77738A]">Sales Growth</div>
                      <div className="text-xl font-black text-[#171428]">+22%</div>
                      <div className="text-[10px] text-[#77738A]">Compared to previous 30 days</div>
                    </div>
                  </div>
                  {/* Mini Sparkline Green */}
                  <svg viewBox="0 0 70 30" className="w-16 h-8 shrink-0">
                    <path
                      d="M 2 24 C 18 20, 32 10, 48 14 C 58 16, 62 4, 68 2"
                      fill="none"
                      stroke="#16A34A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* 2. Order Growth */}
                <div className="bg-[#FAF8FE] rounded-2xl p-4 border border-[#EAE6F3] flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] shrink-0">
                      <ShoppingCart size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#77738A]">Order Growth</div>
                      <div className="text-xl font-black text-[#171428]">+18%</div>
                      <div className="text-[10px] text-[#77738A]">Compared to previous 30 days</div>
                    </div>
                  </div>
                  {/* Mini Sparkline Purple */}
                  <svg viewBox="0 0 70 30" className="w-16 h-8 shrink-0">
                    <path
                      d="M 2 26 C 20 22, 30 18, 45 12 C 55 8, 62 6, 68 3"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* 3. Customer Growth */}
                <div className="bg-[#FAF8FE] rounded-2xl p-4 border border-[#EAE6F3] flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#77738A]">Customer Growth</div>
                      <div className="text-xl font-black text-[#171428]">+15%</div>
                      <div className="text-[10px] text-[#77738A]">Compared to previous 30 days</div>
                    </div>
                  </div>
                  {/* Mini Sparkline Orange */}
                  <svg viewBox="0 0 70 30" className="w-16 h-8 shrink-0">
                    <path
                      d="M 2 25 C 22 25, 30 15, 45 16 C 55 18, 60 5, 68 3"
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: 3 Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            {/* Column 1: Top Selling Products */}
            <div className="bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-2">
                    <Trophy size={18} className="text-[#D97706]" />
                    <h3 className="font-bold text-sm text-[#171428]">Top Selling Products</h3>
                  </div>
                  <Link
                    href="/products"
                    className="text-xs font-bold text-[#6515D5] hover:underline"
                  >
                    See All →
                  </Link>
                </div>

                <div className="space-y-4">
                  {topProducts.map((prod) => (
                    <div key={prod.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                              prod.rank === 1
                                ? 'bg-[#FFB21A] text-white'
                                : prod.rank === 2
                                ? 'bg-gray-300 text-gray-800'
                                : 'bg-amber-600 text-white'
                            }`}
                          >
                            {prod.rank}
                          </span>
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#EAE6F3]"
                          />
                          <div>
                            <div className="text-xs font-bold text-[#171428]">{prod.name}</div>
                            <div className="text-[11px] text-[#77738A]">
                              {formatNaira(prod.price)}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs font-bold text-[#77738A]">{prod.sold} sold</div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-[#F3E8FF] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#6515D5] h-full rounded-full transition-all duration-500"
                          style={{ width: `${prod.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Orders by Status (Donut Chart) */}
            <div className="bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <PieIcon size={18} className="text-[#6515D5]" />
                  <h3 className="font-bold text-sm text-[#171428]">Orders by Status</h3>
                </div>

                {/* Donut Chart with center text */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {/* Delivered 52% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#10B981"
                        strokeWidth="14"
                        strokeDasharray="124.1 238.7"
                        strokeDashoffset="0"
                      />
                      {/* Processing 24% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#F59E0B"
                        strokeWidth="14"
                        strokeDasharray="57.3 238.7"
                        strokeDashoffset="-124.1"
                      />
                      {/* Pending 12% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#3B82F6"
                        strokeWidth="14"
                        strokeDasharray="28.6 238.7"
                        strokeDashoffset="-181.4"
                      />
                      {/* Cancelled 12% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#EF4444"
                        strokeWidth="14"
                        strokeDasharray="28.6 238.7"
                        strokeDashoffset="-210.0"
                      />
                    </svg>

                    {/* Donut Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-2xl font-black text-[#171428]">856</span>
                      <span className="text-[10px] text-[#77738A] font-semibold">Total Orders</span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#F1ECF9] text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-[#171428]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      <span>Delivered</span>
                    </span>
                    <span className="font-bold text-[#10B981]">52.0%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-[#171428]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                      <span>Processing</span>
                    </span>
                    <span className="font-bold text-[#F59E0B]">24.0%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-[#171428]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                      <span>Pending</span>
                    </span>
                    <span className="font-bold text-[#3B82F6]">12.0%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-[#171428]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                      <span>Cancelled</span>
                    </span>
                    <span className="font-bold text-[#EF4444]">12.0%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Recent Orders Table */}
            <div className="bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart size={18} className="text-[#6515D5]" />
                    <h3 className="font-bold text-sm text-[#171428]">Recent Orders</h3>
                  </div>
                  <Link
                    href="/orders"
                    className="text-xs font-bold text-[#6515D5] hover:underline"
                  >
                    See All →
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#EAE6F3] text-[10px] font-bold text-[#77738A] uppercase">
                        <th className="pb-2">Order #</th>
                        <th className="pb-2">Customer</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1ECF9]">
                      {recentOrders.map((ord, idx) => (
                        <tr key={idx} className="hover:bg-purple-50/20">
                          <td className="py-2.5 font-bold text-[#171428]">{ord.order_number}</td>
                          <td className="py-2.5 text-[#77738A]">{ord.customer}</td>
                          <td className="py-2.5 font-bold text-[#171428]">
                            {formatNaira(ord.amount)}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.status === 'Delivered'
                                  ? 'bg-[#DCFCE7] text-[#16A34A]'
                                  : ord.status === 'Processing'
                                  ? 'bg-[#FEF3C7] text-[#D97706]'
                                  : ord.status === 'Shipped'
                                  ? 'bg-[#E0F2FE] text-[#0284C7]'
                                  : 'bg-[#F3E8FF] text-[#7C3AED]'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-[#77738A]">{ord.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
