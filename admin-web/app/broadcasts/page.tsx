'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Send,
  Users,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Megaphone,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { AdminNotificationService } from '../../services/adminNotification.service';
import { AdminAuthService } from '../../services/adminAuth.service';
import { NotificationBroadcastItem } from '../../types';

export default function BroadcastsPage() {
  const router = useRouter();
  const [broadcasts, setBroadcasts] = useState<NotificationBroadcastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'vip' | 'new' | 'single'>('all');
  const [type, setType] = useState('promo');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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
    await loadBroadcasts();
  };

  const loadBroadcasts = async () => {
    setLoading(true);
    const data = await AdminNotificationService.getNotifications();
    setBroadcasts(data);
    setLoading(false);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setSubmitting(true);
    const res = await AdminNotificationService.broadcastNotification({
      title,
      message,
      targetAudience,
      type,
      sentBy: adminEmail,
    });
    setSubmitting(false);

    if (res.success) {
      setTitle('');
      setMessage('');
      setToastMessage('Broadcast notification pushed to mobile devices successfully!');
      setTimeout(() => setToastMessage(null), 4000);
      await loadBroadcasts();
    } else {
      alert(`Error broadcasting notification: ${res.error || 'Failed'}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F2FA]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader title="Push Broadcasts & App Notifications" />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#171428] tracking-tight">Push Broadcasts</h1>
              <p className="text-xs text-[#77738A] mt-1">
                Send push announcements and promotional banners directly into customer mobile apps in real-time.
              </p>
            </div>
            <button
              onClick={loadBroadcasts}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-[#EAE6F3] text-[#171428] hover:bg-[#FAF8FE] px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh History</span>
            </button>
          </div>

          {toastMessage && (
            <div className="bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46] px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm">
              <CheckCircle2 size={16} className="text-[#10B981]" />
              <span>{toastMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Broadcast Composer */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-[#EAE6F3] shadow-sm p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Megaphone size={18} className="text-[#6515D5]" />
                <h2 className="text-base font-black text-[#171428]">Compose New Broadcast</h2>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#171428] mb-1">Target Customer Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e: any) => setTargetAudience(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs font-semibold text-[#171428] focus:ring-2 focus:ring-[#6515D5]/20 focus:outline-none"
                  >
                    <option value="all">All Mobile App Customers</option>
                    <option value="vip">VIP Top Spenders</option>
                    <option value="new">New Customers (Joined last 14 days)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#171428] mb-1">Notification Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs font-semibold text-[#171428] focus:ring-2 focus:ring-[#6515D5]/20 focus:outline-none"
                  >
                    <option value="promo">Promotional / Flash Sale</option>
                    <option value="announcement">Store Announcement</option>
                    <option value="order">Order Update</option>
                    <option value="alert">Security / Service Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#171428] mb-1">Notification Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs font-semibold text-[#171428] focus:ring-2 focus:ring-[#6515D5]/20 focus:outline-none"
                    placeholder="e.g. Flash Sale: 20% Off All Sneaker Brands!"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#171428] mb-1">Message Body</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs font-semibold text-[#171428] focus:ring-2 focus:ring-[#6515D5]/20 focus:outline-none"
                    placeholder="Use code EASY20 at checkout today only..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-[#6515D5] hover:bg-[#5510A8] text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Broadcasting...' : 'Push to Mobile Devices'}</span>
                </button>
              </form>
            </div>

            {/* Broadcast History */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EAE6F3] shadow-sm p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Bell size={18} className="text-[#6515D5]" />
                <h2 className="text-base font-black text-[#171428]">Broadcast Announcement History</h2>
              </div>

              <div className="space-y-3">
                {broadcasts.length === 0 ? (
                  <div className="p-12 text-center text-[#77738A] text-xs">
                    No broadcast announcements sent yet.
                  </div>
                ) : (
                  broadcasts.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-[#EAE6F3] bg-[#FAF8FE] space-y-2 hover:border-purple-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#6515D5] text-white">
                            {b.targetAudience}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FAF5FF] text-[#6515D5]">
                            {b.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#77738A]">
                          {new Date(b.createdAt).toLocaleString('en-NG')}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#171428]">{b.title}</h3>
                      <p className="text-xs text-[#524E66]">{b.message}</p>

                      <div className="text-[11px] text-[#77738A] pt-1">
                        Dispatched by: <strong className="text-[#171428]">{b.sentBy}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
