'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  History,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { AdminAuditService } from '../../services/adminAudit.service';
import { AdminAuthService } from '../../services/adminAuth.service';
import { AuditLogItem } from '../../types';

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuthAndLoad();
  }, [selectedEntity]);

  const checkAuthAndLoad = async () => {
    const admin = await AdminAuthService.getCurrentAdmin();
    if (!admin) {
      router.push('/admin-login');
      return;
    }
    await loadLogs();
  };

  const loadLogs = async () => {
    setLoading(true);
    const data = await AdminAuditService.getAuditLogs(selectedEntity, 150);
    setLogs(data);
    setLoading(false);
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.adminEmail.toLowerCase().includes(q) ||
      (log.entityId && log.entityId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex min-h-screen bg-[#F5F2FA]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader title="Security & System Audit Logs" />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#171428] tracking-tight">System Audit Trail</h1>
              <p className="text-xs text-[#77738A] mt-1">
                Immutable security logs tracking administrative changes, inventory adjustments, status updates, and setting edits.
              </p>
            </div>
            <button
              onClick={loadLogs}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-[#EAE6F3] text-[#171428] hover:bg-[#FAF8FE] px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Logs</span>
            </button>
          </div>

          {/* Metric Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EAE6F3] shadow-sm">
              <div className="flex items-center justify-between text-[#77738A] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Audit Events</span>
                <History size={18} className="text-[#6515D5]" />
              </div>
              <div className="text-2xl font-black text-[#171428]">{logs.length}</div>
              <div className="text-[11px] text-[#77738A] mt-1">Recorded administrative actions</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAE6F3] shadow-sm">
              <div className="flex items-center justify-between text-[#77738A] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Active Administrator</span>
                <UserCheck size={18} className="text-[#10B981]" />
              </div>
              <div className="text-sm font-black text-[#10B981] truncate">qazeembasitoladimeji@gmsail.com</div>
              <div className="text-[11px] text-[#77738A] mt-1">Store Owner / Super Admin</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAE6F3] shadow-sm">
              <div className="flex items-center justify-between text-[#77738A] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Audit Integrity</span>
                <CheckCircle size={18} className="text-[#6515D5]" />
              </div>
              <div className="text-2xl font-black text-[#6515D5]">100%</div>
              <div className="text-[11px] text-[#77738A] mt-1">All events timestamped in UTC</div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
              {['all', 'order', 'inventory', 'product', 'coupon', 'settings', 'support'].map((ent) => (
                <button
                  key={ent}
                  onClick={() => setSelectedEntity(ent)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition whitespace-nowrap ${
                    selectedEntity === ent
                      ? 'bg-[#6515D5] text-white shadow-sm'
                      : 'text-[#77738A] hover:bg-[#FAF8FE]'
                  }`}
                >
                  {ent}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit actions or notes..."
                className="w-full pl-9 pr-4 py-2 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs text-[#171428] placeholder-[#77738A] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/20 focus:border-[#6515D5]"
              />
              <Search size={15} className="absolute left-3 top-2.5 text-[#77738A]" />
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8FD] border-b border-[#EAE6F3] text-xs font-bold uppercase tracking-wider text-[#77738A]">
                  <tr>
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Admin User</th>
                    <th className="py-4 px-6">Action</th>
                    <th className="py-4 px-6">Entity</th>
                    <th className="py-4 px-6">Details / Changes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2FA] text-xs">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#77738A]">
                        No audit logs recorded for this criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FAF8FE] transition">
                        <td className="py-4 px-6 text-[#77738A] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('en-NG')}
                        </td>
                        <td className="py-4 px-6 font-bold text-[#171428] whitespace-nowrap">
                          {log.adminEmail}
                        </td>
                        <td className="py-4 px-6 font-semibold text-[#6515D5] whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FAF5FF] text-[#6515D5]">
                            {log.entityType}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[#524E66] max-w-md">
                          {log.details}
                          {log.entityId && (
                            <span className="text-[10px] text-[#77738A] block font-mono mt-0.5">
                              ID: {log.entityId}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
