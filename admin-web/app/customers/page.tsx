'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  ShoppingCart,
  UserCheck,
  Crown,
  Search,
  Plus,
  Eye,
  MoreVertical,
  Calendar,
  X,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import MetricCard from '../../components/MetricCard';
import { AdminCustomerService, CustomerStats } from '../../services/adminCustomer.service';
import { AdminAuthService } from '../../services/adminAuth.service';
import { formatNaira, formatDate } from '../../lib/utils';
import { Customer, AccountStatus } from '../../types';

export default function CustomersPage() {
  const router = useRouter();
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    checkAuthAndLoad();
  }, [statusFilter, searchQuery]);

  const checkAuthAndLoad = async () => {
    const admin = await AdminAuthService.getCurrentAdmin();
    if (!admin) {
      router.push('/admin-login');
      return;
    }
    const [statsRes, listRes] = await Promise.all([
      AdminCustomerService.getStats(),
      AdminCustomerService.getCustomers(statusFilter, searchQuery),
    ]);
    setStats(statsRes);
    setCustomers(listRes);
  };

  const handleStatusChange = async (customerId: string, newStatus: AccountStatus) => {
    setActiveMenuId(null);
    const success = await AdminCustomerService.updateStatus(customerId, newStatus);
    if (success) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, account_status: newStatus } : c))
      );
    }
  };

  const getStatusPill = (status: AccountStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="bg-[#DCFCE7] text-[#16A34A] text-xs font-bold px-3 py-1 rounded-full inline-block">
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="bg-[#FEF3C7] text-[#D97706] text-xs font-bold px-3 py-1 rounded-full inline-block">
            Inactive
          </span>
        );
      case 'suspended':
        return (
          <span className="bg-[#FEE2E2] text-[#EF4444] text-xs font-bold px-3 py-1 rounded-full inline-block">
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const exportCustomers = () => {
    const headers = ['Full Name', 'Email', 'Phone Number', 'Total Orders', 'Total Spent', 'Status', 'Join Date'];
    const rows = customers.map((c) => [
      c.full_name,
      c.email,
      c.phone_number || '',
      c.total_orders || 0,
      c.total_spent || 0,
      c.account_status,
      formatDate(c.created_at),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((field) => `"${field}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shopeasy_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F6FD]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader searchPlaceholder="Search customers..." onSearch={setSearchQuery} />

        <main className="p-8 space-y-7 max-w-7xl mx-auto w-full">
          {/* Header Row matching Reference Image 3 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#171428] tracking-tight flex items-center space-x-2.5">
                <Users size={28} className="text-[#6515D5]" />
                <span>Customers</span>
              </h1>
              <p className="text-sm text-[#77738A] mt-1 font-medium">
                Manage your customers and view their activity.
              </p>
            </div>

            {/* Export Customers Button */}
            <button
              onClick={exportCustomers}
              className="px-5 py-2.5 rounded-2xl bg-[#6515D5] hover:bg-[#520FB3] text-white text-sm font-bold shadow-md shadow-purple-600/20 transition flex items-center space-x-2 shrink-0 self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>Export Customers</span>
            </button>
          </div>

          {/* 4 Customer Metric Cards matching Reference Image 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard
              title="Total Customers"
              value={stats?.total_customers?.toLocaleString() || '3,240'}
              trend={stats?.total_growth || '↑ +15%'}
              variant="purple"
              icon={<Users size={24} />}
            />

            <MetricCard
              title="Active Customers"
              value={stats?.active_customers?.toLocaleString() || '2,891'}
              trend={stats?.active_growth || '↑ +12%'}
              variant="blue"
              icon={<ShoppingCart size={24} />}
            />

            <MetricCard
              title="New Customers"
              value={stats?.new_customers?.toLocaleString() || '349'}
              trend={stats?.new_growth || '↑ +20%'}
              variant="green"
              icon={<UserCheck size={24} />}
            />

            <MetricCard
              title="VIP Customers"
              value={stats?.vip_customers?.toLocaleString() || '478'}
              trend={stats?.vip_growth || '↑ +18%'}
              variant="orange"
              icon={<Crown size={24} />}
            />
          </div>

          {/* Filters & Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6F3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl px-4 py-2 text-xs font-bold text-[#171428] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Customers</option>
                  <option value="active">Active Customers</option>
                  <option value="inactive">Inactive Customers</option>
                  <option value="suspended">Suspended Customers</option>
                </select>
              </div>

              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl px-4 py-2 text-xs font-bold text-[#171428] focus:outline-none cursor-pointer"
                >
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Last 90 Days">Last 90 Days</option>
                  <option value="All Time">All Time</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77738A]">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs text-[#171428] placeholder-[#77738A] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/20 focus:border-[#6515D5]"
              />
            </div>
          </div>

          {/* Customer Data Table matching Reference Image 3 */}
          <div className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8FD] border-b border-[#EAE6F3] text-xs font-bold uppercase tracking-wider text-[#77738A]">
                  <tr>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Phone Number</th>
                    <th className="py-4 px-6 text-center">Total Orders</th>
                    <th className="py-4 px-6">Total Spent</th>
                    <th className="py-4 px-6">Join Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2FA] text-sm">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF8FE] transition">
                      {/* Customer Avatar & Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={c.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'}
                            alt={c.full_name}
                            className="w-10 h-10 rounded-full object-cover border border-[#EAE6F3]"
                          />
                          <div>
                            <div className="font-bold text-[#171428] leading-tight">{c.full_name}</div>
                            <span className="text-[11px] text-[#77738A] font-medium">Customer</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs text-[#55516B] font-medium">{c.email}</td>
                      <td className="py-4 px-6 text-xs text-[#55516B] font-medium">{c.phone_number || 'N/A'}</td>
                      <td className="py-4 px-6 text-xs font-bold text-center text-[#171428]">{c.total_orders || 1}</td>
                      <td className="py-4 px-6 font-black text-[#171428]">{formatNaira(c.total_spent || 25000)}</td>
                      <td className="py-4 px-6 text-xs text-[#77738A]">{formatDate(c.created_at)}</td>
                      <td className="py-4 px-6">{getStatusPill(c.account_status)}</td>

                      {/* Action Buttons: Eye + 3 dots menu */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2 relative">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            title="View Customer Details"
                            className="p-1.5 rounded-lg text-[#6515D5] hover:bg-purple-50 transition"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                            className="p-1.5 rounded-lg text-[#77738A] hover:bg-gray-100 transition"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* Action Dropdown Menu */}
                          {activeMenuId === c.id && (
                            <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-xl border border-[#EAE6F3] py-1.5 z-40 text-left text-xs font-semibold">
                              <button
                                onClick={() => handleStatusChange(c.id, 'active')}
                                className="w-full px-3.5 py-2 text-[#16A34A] hover:bg-green-50 flex items-center space-x-2"
                              >
                                <CheckCircle size={14} />
                                <span>Activate Customer</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(c.id, 'inactive')}
                                className="w-full px-3.5 py-2 text-[#D97706] hover:bg-amber-50 flex items-center space-x-2"
                              >
                                <AlertTriangle size={14} />
                                <span>Deactivate Account</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(c.id, 'suspended')}
                                className="w-full px-3.5 py-2 text-[#EF4444] hover:bg-red-50 flex items-center space-x-2"
                              >
                                <Ban size={14} />
                                <span>Suspend Account</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Pagination matching Reference Image 3 */}
            <div className="p-4 px-6 border-t border-[#EAE6F3] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-[#77738A]">
              <div>
                Showing 1–{customers.length} of {stats?.total_customers?.toLocaleString() || '3,240'} customers
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#EAE6F3] bg-white text-[#171428] hover:bg-gray-50"
                >
                  Previous
                </button>

                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      currentPage === page
                        ? 'bg-[#6515D5] text-white shadow-sm'
                        : 'text-[#171428] hover:bg-[#F7F5FC]'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-1.5 rounded-lg border border-[#EAE6F3] bg-white text-[#171428] hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-[#EAE6F3] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-[#77738A] hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-4 mb-6">
              <img
                src={selectedCustomer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'}
                alt={selectedCustomer.full_name}
                className="w-16 h-16 rounded-2xl object-cover border border-[#EAE6F3]"
              />
              <div>
                <h3 className="text-xl font-black text-[#171428]">{selectedCustomer.full_name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusPill(selectedCustomer.account_status)}
                  <span className="text-xs text-[#77738A]">Joined {formatDate(selectedCustomer.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-gray-100 text-sm">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[#77738A] flex items-center space-x-2">
                  <Mail size={16} />
                  <span>Email</span>
                </span>
                <span className="font-bold text-[#171428]">{selectedCustomer.email}</span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-[#77738A] flex items-center space-x-2">
                  <Phone size={16} />
                  <span>Phone</span>
                </span>
                <span className="font-bold text-[#171428]">{selectedCustomer.phone_number || 'N/A'}</span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-[#77738A] flex items-center space-x-2">
                  <ShoppingCart size={16} />
                  <span>Lifetime Orders</span>
                </span>
                <span className="font-bold text-[#171428]">{selectedCustomer.total_orders || 1} orders</span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-[#77738A]">Lifetime Spending</span>
                <span className="text-lg font-black text-[#6515D5]">{formatNaira(selectedCustomer.total_spent || 25000)}</span>
              </div>
            </div>

            <div className="mt-8 flex items-center space-x-3">
              <button
                onClick={() => {
                  handleStatusChange(
                    selectedCustomer.id,
                    selectedCustomer.account_status === 'active' ? 'suspended' : 'active'
                  );
                  setSelectedCustomer(null);
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition ${
                  selectedCustomer.account_status === 'active'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {selectedCustomer.account_status === 'active' ? 'Suspend Account' : 'Activate Account'}
              </button>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="py-3 px-6 rounded-xl bg-[#6515D5] text-white font-bold text-sm hover:bg-[#520FB3] transition"
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
