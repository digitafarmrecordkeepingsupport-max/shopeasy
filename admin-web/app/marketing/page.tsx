'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Calendar,
  Users,
  Eye,
  MousePointer,
  ShoppingCart,
  Send,
  Mail,
  Zap,
  Tag,
  BarChart3,
  Settings,
  Pencil,
  Trash2,
  X,
  Plus,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { AdminMarketingService } from '../../services/adminMarketing.service';
import { AdminAuthService } from '../../services/adminAuth.service';
import { MarketingCampaign, MarketingStats } from '../../types';

export default function MarketingPage() {
  const router = useRouter();
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  // Modals
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [viewingCampaign, setViewingCampaign] = useState<MarketingCampaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
  const [promoForm, setPromoForm] = useState({
    name: '',
    type: 'Discount',
    start_date: 'Aug 1, 2025',
    end_date: 'Aug 31, 2025',
    discount_rate: '20%',
    status: 'Active' as const,
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const admin = await AdminAuthService.getCurrentAdmin();
    if (!admin) {
      router.push('/admin-login');
      return;
    }
    const s = await AdminMarketingService.getMarketingStats();
    const c = await AdminMarketingService.getCampaigns();
    setStats(s);
    setCampaigns(c);
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterSubject.trim()) return;

    const res = await AdminMarketingService.sendNewsletter(newsletterSubject);
    setNewsletterStatus(res.message);
    setNewsletterSubject('');
    setTimeout(() => setNewsletterStatus(null), 4000);
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.name.trim()) return;

    if (editingCampaign) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === editingCampaign.id
            ? {
                ...c,
                name: promoForm.name,
                type: promoForm.type,
                start_date: promoForm.start_date,
                end_date: promoForm.end_date,
                discount_rate: promoForm.discount_rate,
                status: promoForm.status,
              }
            : c
        )
      );
    } else {
      const created = await AdminMarketingService.createCampaign({
        name: promoForm.name,
        type: promoForm.type,
        start_date: promoForm.start_date,
        end_date: promoForm.end_date,
        status: promoForm.status,
        thumbnail_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=400',
        discount_rate: promoForm.discount_rate,
        reach: 12000,
        clicks: 3100,
        conversions: 780,
      });

      if (created) {
        setCampaigns((prev) => [created, ...prev]);
      }
    }

    setIsPromoModalOpen(false);
    setEditingCampaign(null);
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete campaign "${name}"?`)) {
      await AdminMarketingService.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleEdit = (c: MarketingCampaign) => {
    setEditingCampaign(c);
    setPromoForm({
      name: c.name,
      type: c.type,
      start_date: c.start_date,
      end_date: c.end_date,
      discount_rate: c.discount_rate || '20%',
      status: c.status as any,
    });
    setIsPromoModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F6FD]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader searchPlaceholder="Search marketing tools, campaigns..." />

        <main className="p-8 space-y-7 max-w-7xl mx-auto w-full">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#6515D5] flex items-center justify-center text-white shadow-md shadow-purple-600/20">
                <Megaphone size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#171428] tracking-tight">
                  Marketing
                </h1>
                <p className="text-xs sm:text-sm text-[#77738A] mt-0.5 font-medium">
                  Promote your store and attract more customers.
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

          {/* 4 Metric Cards matching Image 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Campaigns */}
            <div className="bg-[#FAF5FF] rounded-2xl p-5 border border-purple-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#6515D5] flex items-center justify-center text-white shadow-sm">
                  <Users size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Campaigns</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">
                    {stats?.total_campaigns || 5}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] flex items-center">
                ↑ +25%
              </span>
            </div>

            {/* Total Reach */}
            <div className="bg-[#F0F7FF] rounded-2xl p-5 border border-blue-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shadow-sm">
                  <Eye size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Reach</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">
                    {stats?.total_reach.toLocaleString() || '48,750'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] flex items-center">
                ↑ +40%
              </span>
            </div>

            {/* Total Clicks */}
            <div className="bg-[#F0FDF4] rounded-2xl p-5 border border-emerald-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#16A34A] flex items-center justify-center text-white shadow-sm">
                  <MousePointer size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Clicks</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">
                    {stats?.total_clicks.toLocaleString() || '12,380'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] flex items-center">
                ↑ +55%
              </span>
            </div>

            {/* Conversion Rate */}
            <div className="bg-[#FFF9EB] rounded-2xl p-5 border border-amber-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#D97706] flex items-center justify-center text-white shadow-sm">
                  <ShoppingCart size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Conversion Rate</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">
                    {stats?.conversion_rate || 25.4}%
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] flex items-center">
                ↑ +12%
              </span>
            </div>
          </div>

          {/* Row 2: Promo Banner (col-8) & Newsletter Card (col-4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Promo Banner Card (col-8) */}
            <div className="lg:col-span-8 bg-gradient-to-r from-[#4A0D9B] via-[#5C11BE] to-[#6515D5] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px]">
              {/* Subtle background circles */}
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                {/* 3D Shopping Cart Illustration */}
                <div className="shrink-0 w-36 h-36 relative flex items-center justify-center">
                  <div className="w-28 h-28 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-inner">
                    <ShoppingCart size={54} className="text-[#FFB21A]" />
                  </div>
                </div>

                {/* Offer Content */}
                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <span className="text-sm font-semibold text-purple-200">
                    Special Offer!
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    Up to 30% OFF
                  </h2>
                  <p className="text-xs text-purple-200/90 font-medium">
                    Shop more. Save more.
                  </p>
                </div>

                {/* Yellow Action Button */}
                <button
                  onClick={() => {
                    setEditingCampaign(null);
                    setPromoForm({
                      name: '',
                      type: 'Discount',
                      start_date: 'Aug 1, 2025',
                      end_date: 'Aug 31, 2025',
                      discount_rate: '30%',
                      status: 'Active',
                    });
                    setIsPromoModalOpen(true);
                  }}
                  className="bg-[#FFB21A] hover:bg-[#E69E10] text-[#171428] font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center space-x-1"
                >
                  <span>Create Promotion →</span>
                </button>
              </div>

              {/* Carousel Dots */}
              <div className="flex items-center justify-center space-x-1.5 pt-4">
                <span className="w-6 h-1.5 rounded-full bg-white transition-all" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>
            </div>

            {/* Newsletter Campaign Card (col-4) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#EAE6F3] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Mail size={18} className="text-[#6515D5]" />
                      <h3 className="font-bold text-sm text-[#171428]">
                        Newsletter Campaign
                      </h3>
                    </div>
                    <p className="text-xs text-[#77738A] mt-1 font-medium">
                      Reach your customers via email.
                    </p>
                  </div>

                  {/* Mail icon graphic */}
                  <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706] relative shadow-2xs">
                    <Mail size={22} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                      1
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSendNewsletter} className="mt-5 space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Enter campaign subject..."
                      value={newsletterSubject}
                      onChange={(e) => setNewsletterSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6F3] text-xs text-[#171428] placeholder-[#77738A] focus:outline-none focus:border-[#6515D5]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#6515D5] hover:bg-[#530FB8] text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-purple-600/20 flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Send Newsletter</span>
                  </button>
                </form>

                {newsletterStatus && (
                  <div className="mt-2.5 p-2 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl text-[11px] font-semibold text-[#16A34A] flex items-center space-x-1.5 animate-in fade-in">
                    <CheckCircle2 size={14} />
                    <span>{newsletterStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Campaigns Table (col-8) & Quick Actions (col-4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Campaigns Table (col-8) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-[#EAE6F3] shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-6 pb-4 flex items-center justify-between border-b border-[#EAE6F3]">
                  <div className="flex items-center space-x-2.5">
                    <Megaphone size={18} className="text-[#6515D5]" />
                    <h3 className="font-bold text-sm text-[#171428]">Campaigns</h3>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCampaign(null);
                      setIsPromoModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#6515D5] hover:underline"
                  >
                    See All →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#EAE6F3] bg-[#FAF8FE]/50 text-[10px] font-bold text-[#77738A] uppercase">
                        <th className="py-3.5 px-6">Campaign Name</th>
                        <th className="py-3.5 px-6">Type</th>
                        <th className="py-3.5 px-6">Start Date</th>
                        <th className="py-3.5 px-6">End Date</th>
                        <th className="py-3.5 px-6">Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE6F3]">
                      {campaigns.map((camp) => (
                        <tr key={camp.id} className="hover:bg-purple-50/20 transition">
                          {/* Name + Thumbnail */}
                          <td className="py-3.5 px-6">
                            <div className="flex items-center space-x-3">
                              <img
                                src={camp.thumbnail_url}
                                alt={camp.name}
                                className="w-9 h-9 rounded-lg object-cover border border-[#EAE6F3]"
                              />
                              <span className="font-bold text-[#171428]">{camp.name}</span>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-6">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                camp.type === 'Discount'
                                  ? 'bg-[#F3E8FF] text-[#7C3AED]'
                                  : camp.type === 'Product Launch'
                                  ? 'bg-[#E0F2FE] text-[#0284C7]'
                                  : camp.type === 'Shipping'
                                  ? 'bg-[#FEF3C7] text-[#D97706]'
                                  : 'bg-[#DCFCE7] text-[#16A34A]'
                              }`}
                            >
                              {camp.type}
                            </span>
                          </td>

                          {/* Start Date */}
                          <td className="py-3.5 px-6 text-[#77738A] font-medium">
                            {camp.start_date}
                          </td>

                          {/* End Date */}
                          <td className="py-3.5 px-6 text-[#77738A] font-medium">
                            {camp.end_date}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-6">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                camp.status === 'Active'
                                  ? 'bg-[#DCFCE7] text-[#16A34A]'
                                  : 'bg-[#F3E8FF] text-[#7C3AED]'
                              }`}
                            >
                              {camp.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-6 text-right">
                            <div className="inline-flex items-center space-x-2">
                              {/* View */}
                              <button
                                onClick={() => setViewingCampaign(camp)}
                                title="View Campaign"
                                className="w-7 h-7 rounded-lg border border-[#EAE6F3] hover:border-[#6515D5] hover:bg-purple-50 text-[#7C3AED] flex items-center justify-center transition"
                              >
                                <Eye size={13} />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleEdit(camp)}
                                title="Edit Campaign"
                                className="w-7 h-7 rounded-lg border border-[#EAE6F3] hover:border-[#6515D5] hover:bg-purple-50 text-[#7C3AED] flex items-center justify-center transition"
                              >
                                <Pencil size={13} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                                title="Delete Campaign"
                                className="w-7 h-7 rounded-lg border border-[#FEE2E2] hover:bg-red-50 text-[#EF4444] flex items-center justify-center transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quick Actions (col-4) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-5">
                  <Zap size={18} className="text-[#6515D5]" />
                  <h3 className="font-bold text-sm text-[#171428]">Quick Actions</h3>
                </div>

                {/* 2x2 Action Tiles */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* 1. Create Promotion */}
                  <button
                    onClick={() => {
                      setEditingCampaign(null);
                      setIsPromoModalOpen(true);
                    }}
                    className="p-4 rounded-2xl bg-[#F3E8FF] hover:bg-[#E9D5FF] transition flex flex-col items-center justify-center text-center space-y-2 cursor-pointer shadow-2xs group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#7C3AED] shadow-2xs group-hover:scale-105 transition">
                      <Tag size={20} />
                    </div>
                    <span className="text-xs font-bold text-[#171428]">
                      Create Promotion
                    </span>
                  </button>

                  {/* 2. Send Newsletter */}
                  <button
                    onClick={() => {
                      setNewsletterSubject('Exclusive Weekend Sale — Up to 40% OFF');
                    }}
                    className="p-4 rounded-2xl bg-[#DCFCE7] hover:bg-[#BBF7D0] transition flex flex-col items-center justify-center text-center space-y-2 cursor-pointer shadow-2xs group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#16A34A] shadow-2xs group-hover:scale-105 transition">
                      <Mail size={20} />
                    </div>
                    <span className="text-xs font-bold text-[#171428]">
                      Send Newsletter
                    </span>
                  </button>

                  {/* 3. View Reports */}
                  <Link
                    href="/analytics"
                    className="p-4 rounded-2xl bg-[#FEF3C7] hover:bg-[#FDE68A] transition flex flex-col items-center justify-center text-center space-y-2 cursor-pointer shadow-2xs group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#D97706] shadow-2xs group-hover:scale-105 transition">
                      <BarChart3 size={20} />
                    </div>
                    <span className="text-xs font-bold text-[#171428]">
                      View Reports
                    </span>
                  </Link>

                  {/* 4. Manage Templates */}
                  <button
                    onClick={() => alert('Templates Manager: 4 email templates ready (Welcome, Sale Alert, Cart Recovery, Receipt).')}
                    className="p-4 rounded-2xl bg-[#E0F2FE] hover:bg-[#BAE6FD] transition flex flex-col items-center justify-center text-center space-y-2 cursor-pointer shadow-2xs group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0284C7] shadow-2xs group-hover:scale-105 transition">
                      <Settings size={20} />
                    </div>
                    <span className="text-xs font-bold text-[#171428]">
                      Manage Templates
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Promotion / Campaign Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE6F3]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6F3]">
              <div className="flex items-center space-x-2">
                <Tag size={18} className="text-[#6515D5]" />
                <h3 className="text-lg font-bold text-[#171428]">
                  {editingCampaign ? 'Edit Campaign' : 'Create New Promotion'}
                </h3>
              </div>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Weekend Sale"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6F3] text-sm text-[#171428] focus:outline-none focus:border-[#6515D5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#171428] uppercase mb-1">
                    Campaign Type
                  </label>
                  <select
                    value={promoForm.type}
                    onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE6F3] text-xs font-semibold text-[#171428] focus:outline-none focus:border-[#6515D5]"
                  >
                    <option value="Discount">Discount</option>
                    <option value="Product Launch">Product Launch</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Seasonal">Seasonal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171428] uppercase mb-1">
                    Discount Rate
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 25% or Free"
                    value={promoForm.discount_rate}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, discount_rate: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE6F3] text-xs text-[#171428] focus:outline-none focus:border-[#6515D5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#171428] uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={promoForm.start_date}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, start_date: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE6F3] text-xs text-[#171428] focus:outline-none focus:border-[#6515D5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171428] uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={promoForm.end_date}
                    onChange={(e) => setPromoForm({ ...promoForm, end_date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE6F3] text-xs text-[#171428] focus:outline-none focus:border-[#6515D5]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#EAE6F3] text-xs font-semibold text-[#77738A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#6515D5] text-white text-xs font-bold shadow-md shadow-purple-600/20"
                >
                  {editingCampaign ? 'Save Changes' : 'Launch Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Details View Modal */}
      {viewingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE6F3]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6F3]">
              <h3 className="text-lg font-bold text-[#171428]">Campaign Performance</h3>
              <button
                onClick={() => setViewingCampaign(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src={viewingCampaign.thumbnail_url}
                  alt={viewingCampaign.name}
                  className="w-14 h-14 rounded-xl object-cover border border-[#EAE6F3]"
                />
                <div>
                  <h4 className="text-base font-bold text-[#171428]">
                    {viewingCampaign.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-xs text-[#77738A]">{viewingCampaign.type}</span>
                    <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                      {viewingCampaign.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF8FE] p-3 rounded-xl border border-[#EAE6F3] text-center">
                  <div className="text-[10px] text-[#77738A] uppercase font-bold">Reach</div>
                  <div className="text-sm font-black text-[#171428] mt-1">
                    {viewingCampaign.reach?.toLocaleString() || '18,400'}
                  </div>
                </div>

                <div className="bg-[#FAF8FE] p-3 rounded-xl border border-[#EAE6F3] text-center">
                  <div className="text-[10px] text-[#77738A] uppercase font-bold">Clicks</div>
                  <div className="text-sm font-black text-[#171428] mt-1">
                    {viewingCampaign.clicks?.toLocaleString() || '4,920'}
                  </div>
                </div>

                <div className="bg-[#FAF8FE] p-3 rounded-xl border border-[#EAE6F3] text-center">
                  <div className="text-[10px] text-[#77738A] uppercase font-bold">Conversions</div>
                  <div className="text-sm font-black text-[#16A34A] mt-1">
                    {viewingCampaign.conversions?.toLocaleString() || '1,240'}
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#77738A] space-y-1 pt-2 border-t border-[#F1ECF9]">
                <div>
                  <span className="font-semibold text-[#171428]">Schedule: </span>
                  {viewingCampaign.start_date} – {viewingCampaign.end_date}
                </div>
                {viewingCampaign.discount_rate && (
                  <div>
                    <span className="font-semibold text-[#171428]">Offer Discount: </span>
                    {viewingCampaign.discount_rate}
                  </div>
                )}
              </div>

              <button
                onClick={() => setViewingCampaign(null)}
                className="w-full mt-2 py-2.5 rounded-xl bg-[#6515D5] text-white font-bold text-xs"
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
