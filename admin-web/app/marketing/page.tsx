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
  Ticket,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { AdminMarketingService } from '../../services/adminMarketing.service';
import { AdminCouponService } from '../../services/adminCoupon.service';
import { AdminAuthService } from '../../services/adminAuth.service';
import { formatNaira } from '../../lib/utils';
import { MarketingCampaign, MarketingStats, CouponItem } from '../../types';

export default function MarketingPage() {
  const router = useRouter();
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  // Campaign Modals
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

  // Coupon Modals
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '10',
    minOrderAmount: '5000',
    maxDiscount: '10000',
    description: 'Promotional discount voucher',
    usageLimit: '500',
  });
  const [couponSubmitting, setCouponSubmitting] = useState(false);
  const [adminEmail, setAdminEmail] = useState('qazeembasitoladimeji@gmsail.com');

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const admin = await AdminAuthService.getCurrentAdmin();
    if (!admin) {
      router.push('/admin-login');
      return;
    }
    if (admin.email) setAdminEmail(admin.email);
    const [s, c, coup] = await Promise.all([
      AdminMarketingService.getMarketingStats(),
      AdminMarketingService.getCampaigns(),
      AdminCouponService.getCoupons(),
    ]);
    setStats(s);
    setCampaigns(c);
    setCoupons(coup);
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
        discount_rate: promoForm.discount_rate,
        status: promoForm.status,
      });
      if (created) {
        setCampaigns((prev) => [created, ...prev]);
      }
    }
    setIsPromoModalOpen(false);
    setEditingCampaign(null);
  };

  const handleEdit = (camp: MarketingCampaign) => {
    setEditingCampaign(camp);
    setPromoForm({
      name: camp.name,
      type: camp.type,
      start_date: camp.start_date,
      end_date: camp.end_date,
      discount_rate: camp.discount_rate || '20%',
      status: camp.status as any,
    });
    setIsPromoModalOpen(true);
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(`Delete campaign "${name}"?`)) return;
    await AdminMarketingService.deleteCampaign(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;

    setCouponSubmitting(true);
    const res = await AdminCouponService.createCoupon(
      {
        code: couponForm.code.toUpperCase().trim(),
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue) || 0,
        minOrderAmount: Number(couponForm.minOrderAmount) || 0,
        maxDiscount: Number(couponForm.maxDiscount) || 0,
        description: couponForm.description,
        usageLimit: Number(couponForm.usageLimit) || 100,
        isActive: true,
      },
      adminEmail
    );
    setCouponSubmitting(false);

    if (res.success) {
      setIsCouponModalOpen(false);
      setCouponForm({
        code: '',
        discountType: 'percentage',
        discountValue: '10',
        minOrderAmount: '5000',
        maxDiscount: '10000',
        description: 'Promotional discount voucher',
        usageLimit: '500',
      });
      const updated = await AdminCouponService.getCoupons();
      setCoupons(updated);
    } else {
      alert(`Error saving coupon: ${res.error || 'Failed'}`);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Permanently remove coupon "${code}"?`)) return;
    const ok = await AdminCouponService.deleteCoupon(code, adminEmail);
    if (ok) {
      setCoupons((prev) => prev.filter((c) => c.code !== code));
    } else {
      alert('Failed to delete coupon.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F6FD]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader searchPlaceholder="Search campaigns, promo codes, or newsletters..." />

        <main className="p-8 space-y-7 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#171428] tracking-tight flex items-center space-x-2.5">
                <Megaphone size={28} className="text-[#6515D5]" />
                <span>Marketing & Promotions</span>
              </h1>
              <p className="text-sm text-[#77738A] mt-1 font-medium">
                Manage promotional banners, coupon codes, and customer email campaigns.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="bg-[#6515D5] hover:bg-[#530FB8] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Create Coupon</span>
              </button>
            </div>
          </div>

          {/* Row 1: 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#FAF5FF] rounded-2xl p-5 border border-purple-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#6515D5] flex items-center justify-center text-white shadow-sm">
                  <Megaphone size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Active Campaigns</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">
                    {campaigns.filter((c) => c.status === 'Active').length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F0F9FF] rounded-2xl p-5 border border-sky-100 shadow-sm flex items-center justify-between">
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
            </div>

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
            </div>

            <div className="bg-[#FFF9EB] rounded-2xl p-5 border border-amber-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#D97706] flex items-center justify-center text-white shadow-sm">
                  <Ticket size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Active Coupons</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">{coupons.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Live Mobile Coupons Section */}
          <div className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE6F3] pb-4">
              <div className="flex items-center space-x-2.5">
                <Ticket size={20} className="text-[#6515D5]" />
                <div>
                  <h3 className="font-bold text-base text-[#171428]">Discount Coupons (Synced to Mobile App)</h3>
                  <p className="text-xs text-[#77738A]">
                    Customers can enter these codes at mobile app checkout for immediate discounts.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#6515D5] text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-200 transition flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Add Coupon</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#EAE6F3] bg-[#FAF8FE]/50 text-[10px] font-bold text-[#77738A] uppercase">
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Min. Spend</th>
                    <th className="py-3 px-4">Max. Cap</th>
                    <th className="py-3 px-4">Usage Limit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE6F3]">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#77738A]">
                        No active coupons configured.
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c) => (
                      <tr key={c.code} className="hover:bg-purple-50/20 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-[#6515D5] bg-[#FAF5FF] border border-purple-200 px-2.5 py-1 rounded-lg">
                            {c.code}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#171428]">
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `${formatNaira(c.discountValue)} OFF`}
                        </td>
                        <td className="py-3 px-4 text-[#77738A]">
                          {c.minOrderAmount ? formatNaira(c.minOrderAmount) : 'None'}
                        </td>
                        <td className="py-3 px-4 text-[#77738A]">
                          {c.maxDiscount ? formatNaira(c.maxDiscount) : 'No Cap'}
                        </td>
                        <td className="py-3 px-4 text-[#77738A]">
                          {c.usedCount || 0} / {c.usageLimit || 500}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.isActive ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {c.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(c.code)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete coupon"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Row 3: Promo Banner (col-8) & Newsletter Card (col-4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            <div className="lg:col-span-8 bg-gradient-to-r from-[#4A0D9B] via-[#5C11BE] to-[#6515D5] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px]">
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="shrink-0 w-36 h-36 relative flex items-center justify-center">
                  <div className="w-28 h-28 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-inner">
                    <ShoppingCart size={54} className="text-[#FFB21A]" />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <span className="text-sm font-semibold text-purple-200">Special Mobile Banner</span>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    Up to 30% OFF
                  </h2>
                  <p className="text-xs text-purple-200/90 font-medium">
                    Shop more. Save more. Syncs directly to the mobile app home slider.
                  </p>
                </div>

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
            </div>

            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#EAE6F3] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Mail size={18} className="text-[#6515D5]" />
                      <h3 className="font-bold text-sm text-[#171428]">Newsletter Campaign</h3>
                    </div>
                    <p className="text-xs text-[#77738A] mt-1 font-medium">
                      Reach registered customers via email blast.
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shadow-sm">
                    <Mail size={22} />
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
        </main>
      </div>

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EAE6F3]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6F3]">
              <div className="flex items-center space-x-2">
                <Ticket size={20} className="text-[#6515D5]" />
                <h3 className="text-lg font-black text-[#171428]">Create Discount Coupon</h3>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#171428] uppercase mb-1">Coupon Promo Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30 or FREESHIP"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6F3] text-sm font-mono font-bold text-[#6515D5] uppercase focus:outline-none focus:border-[#6515D5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171428] uppercase mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e: any) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE6F3] text-xs font-semibold text-[#171428]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Naira (₦)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#171428] uppercase mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 20"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE6F3] text-xs font-semibold text-[#171428]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171428] uppercase mb-1">Minimum Order (₦)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE6F3] text-xs font-semibold text-[#171428]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#171428] uppercase mb-1">Max Cap (₦)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE6F3] text-xs font-semibold text-[#171428]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#171428] uppercase mb-1">Usage Limit</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={couponForm.usageLimit}
                  onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EAE6F3] text-xs font-semibold text-[#171428]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EAE6F3] text-xs font-semibold text-[#77738A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={couponSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#6515D5] text-white text-xs font-bold shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {couponSubmitting ? 'Saving...' : 'Publish Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    onChange={(e) => setPromoForm({ ...promoForm, discount_rate: e.target.value })}
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
    </div>
  );
}
