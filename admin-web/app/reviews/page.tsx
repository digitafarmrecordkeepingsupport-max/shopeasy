'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Filter,
  Check,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { AdminReviewService } from '../../services/adminReview.service';
import { AdminAuthService } from '../../services/adminAuth.service';
import { ProductReviewItem } from '../../types';

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');
  const [adminEmail, setAdminEmail] = useState('qazeembasitoladimeji@gmsail.com');

  useEffect(() => {
    checkAuthAndLoad();
  }, [filterStatus]);

  const checkAuthAndLoad = async () => {
    const admin = await AdminAuthService.getCurrentAdmin();
    if (!admin) {
      router.push('/admin-login');
      return;
    }
    if (admin.email) setAdminEmail(admin.email);
    await loadReviews();
  };

  const loadReviews = async () => {
    setLoading(true);
    const data = await AdminReviewService.getReviews(filterStatus);
    setReviews(data);
    setLoading(false);
  };

  const handleModerate = async (id: string, isApproved: boolean) => {
    const ok = await AdminReviewService.moderateReview(id, isApproved, adminEmail);
    if (ok) {
      await loadReviews();
    } else {
      alert('Failed to update review status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    const ok = await AdminReviewService.deleteReview(id);
    if (ok) {
      await loadReviews();
    } else {
      alert('Failed to delete review.');
    }
  };

  const totalReviews = reviews.length;
  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  return (
    <div className="flex min-h-screen bg-[#F5F2FA]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader title="Customer Reviews & Ratings" />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#171428] tracking-tight">Customer Reviews</h1>
              <p className="text-xs text-[#77738A] mt-1">
                Moderate customer product feedback and ratings before or after display in the mobile app.
              </p>
            </div>
            <button
              onClick={loadReviews}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-[#EAE6F3] text-[#171428] hover:bg-[#FAF8FE] px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Reviews</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EAE6F3] shadow-sm">
              <div className="flex items-center justify-between text-[#77738A] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Feedback</span>
                <MessageSquare size={18} className="text-[#6515D5]" />
              </div>
              <div className="text-2xl font-black text-[#171428]">{totalReviews}</div>
              <div className="text-[11px] text-[#77738A] mt-1">Submitted product reviews</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAE6F3] shadow-sm">
              <div className="flex items-center justify-between text-[#77738A] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Average Store Rating</span>
                <Star size={18} className="text-[#F59E0B] fill-[#F59E0B]" />
              </div>
              <div className="text-2xl font-black text-[#F59E0B] flex items-baseline space-x-1">
                <span>{avgRating}</span>
                <span className="text-xs text-[#77738A]">/ 5.0</span>
              </div>
              <div className="text-[11px] text-[#77738A] mt-1">Across all rated products</div>
            </div>

            <div
              onClick={() => setFilterStatus('pending')}
              className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
                filterStatus === 'pending'
                  ? 'bg-[#FFFBEB] border-[#F59E0B] ring-2 ring-[#F59E0B]/20'
                  : 'bg-white border-[#EAE6F3] hover:border-[#F59E0B]'
              }`}
            >
              <div className="flex items-center justify-between text-[#B45309] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Pending Moderation</span>
                <XCircle size={18} className="text-[#F59E0B]" />
              </div>
              <div className="text-2xl font-black text-[#D97706]">{pendingCount}</div>
              <div className="text-[11px] text-[#B45309] mt-1">Requires approval</div>
            </div>

            <div
              onClick={() => setFilterStatus('approved')}
              className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
                filterStatus === 'approved'
                  ? 'bg-[#ECFDF5] border-[#10B981] ring-2 ring-[#10B981]/20'
                  : 'bg-white border-[#EAE6F3] hover:border-[#10B981]'
              }`}
            >
              <div className="flex items-center justify-between text-[#065F46] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Live in Mobile App</span>
                <CheckCircle size={18} className="text-[#10B981]" />
              </div>
              <div className="text-2xl font-black text-[#10B981]">{approvedCount}</div>
              <div className="text-[11px] text-[#065F46] mt-1">Approved & published</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'all'
                    ? 'bg-[#6515D5] text-white shadow-sm'
                    : 'text-[#77738A] hover:bg-[#FAF8FE]'
                }`}
              >
                All Reviews
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'pending'
                    ? 'bg-[#F59E0B] text-white shadow-sm'
                    : 'text-[#77738A] hover:bg-[#FAF8FE]'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'approved'
                    ? 'bg-[#10B981] text-white shadow-sm'
                    : 'text-[#77738A] hover:bg-[#FAF8FE]'
                }`}
              >
                Approved ({approvedCount})
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#EAE6F3] p-12 text-center text-[#77738A]">
                No reviews found under the selected filter.
              </div>
            ) : (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-[#F59E0B]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={star <= r.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#171428]">{r.rating} / 5</span>
                      {r.isVerifiedPurchase && (
                        <span className="flex items-center space-x-1 text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-md">
                          <ShieldCheck size={12} />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                      <span className="text-xs text-[#77738A]">
                        {new Date(r.createdAt).toLocaleDateString('en-NG')}
                      </span>
                    </div>

                    {r.reviewTitle && (
                      <h3 className="text-sm font-bold text-[#171428]">{r.reviewTitle}</h3>
                    )}

                    <p className="text-xs text-[#524E66] leading-relaxed">{r.reviewText}</p>

                    <div className="text-xs text-[#77738A] pt-1">
                      Customer: <strong className="text-[#171428]">{r.customerName}</strong>
                      {r.productName && (
                        <span>
                          {' '}&bull; Product: <strong className="text-[#6515D5]">{r.productName}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {r.isApproved ? (
                      <button
                        onClick={() => handleModerate(r.id, false)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#EAE6F3] text-[#77738A] hover:bg-[#FEF2F2] hover:text-[#EF4444] hover:border-[#EF4444] transition"
                      >
                        Hide from App
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModerate(r.id, true)}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#10B981] hover:bg-[#059669] text-white shadow-sm transition"
                      >
                        <Check size={14} />
                        <span>Approve & Publish</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-2 rounded-xl text-[#77738A] hover:bg-[#FEF2F2] hover:text-[#EF4444] transition"
                      title="Delete review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
