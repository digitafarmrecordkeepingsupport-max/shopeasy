'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Headphones,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Search,
  X,
  Send,
  RefreshCw,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { AdminSupportService } from '../../services/adminSupport.service';
import { AdminAuthService } from '../../services/adminAuth.service';
import { SupportTicketItem } from '../../types';

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'open' | 'in_progress' | 'resolved' | 'closed'>('resolved');
  const [submitting, setSubmitting] = useState(false);
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
    await loadTickets();
  };

  const loadTickets = async () => {
    setLoading(true);
    const data = await AdminSupportService.getTickets(filterStatus);
    setTickets(data);
    setLoading(false);
  };

  const handleOpenTicketModal = (t: SupportTicketItem) => {
    setSelectedTicket(t);
    setAdminNotes(t.adminNotes || '');
    setNewStatus(t.status === 'open' ? 'in_progress' : t.status);
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSubmitting(true);
    const ok = await AdminSupportService.updateTicket(selectedTicket.id, newStatus, adminNotes, adminEmail);
    setSubmitting(false);

    if (ok) {
      setSelectedTicket(null);
      await loadTickets();
    } else {
      alert('Failed to update ticket.');
    }
  };

  const totalTickets = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="flex min-h-screen bg-[#F5F2FA]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader title="Customer Support & Tickets" />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#171428] tracking-tight">Support Requests</h1>
              <p className="text-xs text-[#77738A] mt-1">
                Manage inquiries, order disputes, delivery issues, and refund requests submitted by mobile app customers.
              </p>
            </div>
            <button
              onClick={loadTickets}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-[#EAE6F3] text-[#171428] hover:bg-[#FAF8FE] px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Tickets</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EAE6F3] shadow-sm">
              <div className="flex items-center justify-between text-[#77738A] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Inquiries</span>
                <Headphones size={18} className="text-[#6515D5]" />
              </div>
              <div className="text-2xl font-black text-[#171428]">{totalTickets}</div>
              <div className="text-[11px] text-[#77738A] mt-1">Logged support tickets</div>
            </div>

            <div
              onClick={() => setFilterStatus('open')}
              className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
                filterStatus === 'open'
                  ? 'bg-[#FEF2F2] border-[#EF4444] ring-2 ring-[#EF4444]/20'
                  : 'bg-white border-[#EAE6F3] hover:border-[#EF4444]'
              }`}
            >
              <div className="flex items-center justify-between text-[#991B1B] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Open & Unattended</span>
                <AlertCircle size={18} className="text-[#EF4444]" />
              </div>
              <div className="text-2xl font-black text-[#EF4444]">{openCount}</div>
              <div className="text-[11px] text-[#991B1B] mt-1">Needs agent attention</div>
            </div>

            <div
              onClick={() => setFilterStatus('in_progress')}
              className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
                filterStatus === 'in_progress'
                  ? 'bg-[#FFFBEB] border-[#F59E0B] ring-2 ring-[#F59E0B]/20'
                  : 'bg-white border-[#EAE6F3] hover:border-[#F59E0B]'
              }`}
            >
              <div className="flex items-center justify-between text-[#B45309] text-xs font-bold uppercase tracking-wider mb-2">
                <span>In Progress</span>
                <Clock size={18} className="text-[#F59E0B]" />
              </div>
              <div className="text-2xl font-black text-[#D97706]">{inProgressCount}</div>
              <div className="text-[11px] text-[#B45309] mt-1">Currently being handled</div>
            </div>

            <div
              onClick={() => setFilterStatus('resolved')}
              className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
                filterStatus === 'resolved'
                  ? 'bg-[#ECFDF5] border-[#10B981] ring-2 ring-[#10B981]/20'
                  : 'bg-white border-[#EAE6F3] hover:border-[#10B981]'
              }`}
            >
              <div className="flex items-center justify-between text-[#065F46] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Resolved</span>
                <CheckCircle size={18} className="text-[#10B981]" />
              </div>
              <div className="text-2xl font-black text-[#10B981]">{resolvedCount}</div>
              <div className="text-[11px] text-[#065F46] mt-1">Closed successfully</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm p-4 flex items-center space-x-2 overflow-x-auto">
            {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-[#6515D5] text-white shadow-sm'
                    : 'text-[#77738A] hover:bg-[#FAF8FE]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#EAE6F3] p-12 text-center text-[#77738A]">
                No support tickets found in this section.
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-purple-200 transition"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          t.status === 'open'
                            ? 'bg-[#FEF2F2] text-[#EF4444]'
                            : t.status === 'in_progress'
                            ? 'bg-[#FFFBEB] text-[#D97706]'
                            : 'bg-[#ECFDF5] text-[#10B981]'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FAF5FF] text-[#6515D5]">
                        {t.category}
                      </span>
                      {t.orderId && (
                        <span className="text-[10px] font-bold text-[#77738A] bg-[#F7F5FC] px-2 py-0.5 rounded">
                          Order #{t.orderId}
                        </span>
                      )}
                      <span className="text-xs text-[#77738A]">
                        {new Date(t.createdAt).toLocaleString('en-NG')}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#171428]">{t.subject}</h3>
                    <p className="text-xs text-[#524E66] leading-relaxed">{t.message}</p>

                    {t.adminNotes && (
                      <div className="bg-[#FAF8FE] border-l-4 border-[#6515D5] p-2.5 rounded-r-xl text-xs text-[#6515D5]">
                        <strong>Store Admin Response:</strong> {t.adminNotes}
                      </div>
                    )}

                    <div className="text-xs text-[#77738A] pt-1">
                      From: <strong className="text-[#171428]">{t.customerName}</strong> ({t.customerEmail})
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => handleOpenTicketModal(t)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#6515D5] hover:bg-[#5510A8] text-white shadow-sm transition"
                    >
                      Respond & Update
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Ticket Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#EAE6F3] overflow-hidden">
            <div className="p-6 border-b border-[#EAE6F3] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#171428]">Respond to Support Ticket</h3>
                <p className="text-xs text-[#77738A] mt-0.5">{selectedTicket.subject}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-[#F7F5FC] flex items-center justify-center text-[#77738A] hover:text-[#171428]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateTicket} className="p-6 space-y-4 text-xs">
              <div className="bg-[#FAF8FE] p-3.5 rounded-xl border border-[#EAE6F3] space-y-1">
                <div className="font-bold text-[#171428]">
                  {selectedTicket.customerName} ({selectedTicket.customerEmail})
                </div>
                <div className="text-[#524E66]">{selectedTicket.message}</div>
              </div>

              <div>
                <label className="block font-bold text-[#171428] mb-1">Ticket Status</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs font-semibold text-[#171428] focus:ring-2 focus:ring-[#6515D5]/20 focus:outline-none"
                >
                  <option value="open">Open (Unattended)</option>
                  <option value="in_progress">In Progress (Investigating)</option>
                  <option value="resolved">Resolved (Issue Addressed)</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#171428] mb-1">Admin Response / Internal Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs font-semibold text-[#171428] focus:ring-2 focus:ring-[#6515D5]/20 focus:outline-none"
                  placeholder="Type resolution details, delivery updates, or refund information..."
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#77738A] hover:bg-[#F7F5FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#6515D5] hover:bg-[#5510A8] text-white shadow-md disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Updating...' : 'Save Resolution'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
