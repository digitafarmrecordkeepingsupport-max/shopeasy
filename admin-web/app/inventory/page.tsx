'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowUpDown,
  History,
  X,
  RefreshCw,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { AdminInventoryService, InventoryData } from '../../services/adminInventory.service';
import { AdminAuthService } from '../../services/adminAuth.service';
import { formatNaira } from '../../lib/utils';
import { Product, InventoryMovementItem } from '../../types';

export default function InventoryPage() {
  const router = useRouter();
  const [data, setData] = useState<InventoryData>({
    items: [],
    movements: [],
    summary: { totalProducts: 0, totalStock: 0, lowStockCount: 0, outOfStockCount: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('qazeembasitoladimeji@gmsail.com');

  // Adjustment Form
  const [movementType, setMovementType] = useState<'restock' | 'adjustment' | 'damage' | 'return'>('restock');
  const [quantityChange, setQuantityChange] = useState<number>(10);
  const [reason, setReason] = useState('New inventory shipment arrival');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    await loadInventory();
  };

  const loadInventory = async () => {
    setLoading(true);
    const res = await AdminInventoryService.getInventory();
    setData(res);
    setLoading(false);
  };

  const handleOpenAdjust = (prod: Product) => {
    setSelectedProduct(prod);
    setMovementType('restock');
    setQuantityChange(10);
    setReason('Shipment replenishment');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    // If movement is damage, ensure quantity change is negative
    let delta = Number(quantityChange);
    if (movementType === 'damage' && delta > 0) {
      delta = -delta;
    }

    const res = await AdminInventoryService.adjustStock({
      productId: selectedProduct.id,
      quantityChange: delta,
      movementType,
      reason,
      adminEmail,
    });

    setSubmitting(false);

    if (res.success) {
      setIsAdjustModalOpen(false);
      setToastMessage(`Stock for ${selectedProduct.name} updated successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
      await loadInventory();
    } else {
      alert(`Error updating stock: ${res.message || 'Unknown error'}`);
    }
  };

  const filteredProducts = data.items.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'low') {
      return p.stock_quantity > 0 && p.stock_quantity <= 5;
    }
    if (filterType === 'out') {
      return p.stock_quantity <= 0;
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#F5F2FA]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader title="Inventory & Stock Control" />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#171428] tracking-tight">Real-time Inventory</h1>
              <p className="text-xs text-[#77738A] mt-1">
                Monitor live warehouse stock levels, adjust inventory, and audit stock movements.
              </p>
            </div>
            <button
              onClick={loadInventory}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-[#EAE6F3] text-[#171428] hover:bg-[#FAF8FE] px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Stock</span>
            </button>
          </div>

          {toastMessage && (
            <div className="bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46] px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm">
              <CheckCircle2 size={16} className="text-[#10B981]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EAE6F3] shadow-sm">
              <div className="flex items-center justify-between text-[#77738A] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Catalog SKUs</span>
                <Boxes size={18} className="text-[#6515D5]" />
              </div>
              <div className="text-2xl font-black text-[#171428]">{data.summary.totalProducts}</div>
              <div className="text-[11px] text-[#77738A] mt-1">Active items in catalog</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAE6F3] shadow-sm">
              <div className="flex items-center justify-between text-[#77738A] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Units in Stock</span>
                <Boxes size={18} className="text-[#10B981]" />
              </div>
              <div className="text-2xl font-black text-[#10B981]">{data.summary.totalStock.toLocaleString()}</div>
              <div className="text-[11px] text-[#77738A] mt-1">Available physical units</div>
            </div>

            <div
              onClick={() => setFilterType('low')}
              className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
                filterType === 'low'
                  ? 'bg-[#FFFBEB] border-[#F59E0B] ring-2 ring-[#F59E0B]/20'
                  : 'bg-white border-[#EAE6F3] hover:border-[#F59E0B]'
              }`}
            >
              <div className="flex items-center justify-between text-[#B45309] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Low Stock Alert</span>
                <AlertTriangle size={18} className="text-[#F59E0B]" />
              </div>
              <div className="text-2xl font-black text-[#D97706]">{data.summary.lowStockCount}</div>
              <div className="text-[11px] text-[#B45309] mt-1">{"Stock \u2264 5 units (needs restock)"}</div>
            </div>

            <div
              onClick={() => setFilterType('out')}
              className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
                filterType === 'out'
                  ? 'bg-[#FEF2F2] border-[#EF4444] ring-2 ring-[#EF4444]/20'
                  : 'bg-white border-[#EAE6F3] hover:border-[#EF4444]'
              }`}
            >
              <div className="flex items-center justify-between text-[#991B1B] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Out of Stock</span>
                <XCircle size={18} className="text-[#EF4444]" />
              </div>
              <div className="text-2xl font-black text-[#EF4444]">{data.summary.outOfStockCount}</div>
              <div className="text-[11px] text-[#991B1B] mt-1">0 units left in store</div>
            </div>
          </div>

          {/* Products Stock Table */}
          <div className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#EAE6F3] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterType === 'all'
                      ? 'bg-[#6515D5] text-white shadow-sm'
                      : 'text-[#77738A] hover:bg-[#FAF8FE]'
                  }`}
                >
                  All Items ({data.items.length})
                </button>
                <button
                  onClick={() => setFilterType('low')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterType === 'low'
                      ? 'bg-[#F59E0B] text-white shadow-sm'
                      : 'text-[#77738A] hover:bg-[#FAF8FE]'
                  }`}
                >
                  Low Stock ({data.summary.lowStockCount})
                </button>
                <button
                  onClick={() => setFilterType('out')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterType === 'out'
                      ? 'bg-[#EF4444] text-white shadow-sm'
                      : 'text-[#77738A] hover:bg-[#FAF8FE]'
                  }`}
                >
                  Out of Stock ({data.summary.outOfStockCount})
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search product or SKU..."
                  className="w-full pl-9 pr-4 py-2 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs text-[#171428] placeholder-[#77738A] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/20 focus:border-[#6515D5]"
                />
                <Search size={15} className="absolute left-3 top-2.5 text-[#77738A]" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8FD] border-b border-[#EAE6F3] text-xs font-bold uppercase tracking-wider text-[#77738A]">
                  <tr>
                    <th className="py-4 px-6">Product Item</th>
                    <th className="py-4 px-6">SKU</th>
                    <th className="py-4 px-6">Unit Price</th>
                    <th className="py-4 px-6 text-center">In Stock</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Stock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2FA] text-sm">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#77738A]">
                        No inventory matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isOut = p.stock_quantity <= 0;
                      const isLow = p.stock_quantity > 0 && p.stock_quantity <= 5;

                      return (
                        <tr key={p.id} className="hover:bg-[#FAF8FE] transition">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <img
                                src={p.image_urls[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400'}
                                alt={p.name}
                                className="w-10 h-10 rounded-xl object-cover border border-[#EAE6F3]"
                              />
                              <div>
                                <div className="font-bold text-[#171428]">{p.name}</div>
                                <div className="text-[11px] text-[#77738A]">{p.category_name || 'Category'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs font-semibold text-[#77738A]">{p.sku}</td>
                          <td className="py-4 px-6 font-bold text-[#171428]">{formatNaira(p.price)}</td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`text-sm font-black px-3 py-1 rounded-full ${
                                isOut
                                  ? 'bg-[#FEF2F2] text-[#EF4444]'
                                  : isLow
                                  ? 'bg-[#FFFBEB] text-[#D97706]'
                                  : 'bg-[#ECFDF5] text-[#10B981]'
                              }`}
                            >
                              {p.stock_quantity}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {isOut ? (
                              <span className="text-[11px] font-bold text-[#EF4444] bg-[#FEF2F2] px-2.5 py-1 rounded-lg">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="text-[11px] font-bold text-[#D97706] bg-[#FFFBEB] px-2.5 py-1 rounded-lg">
                                Low Stock ({p.stock_quantity} left)
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-lg">
                                Healthy
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleOpenAdjust(p)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#6515D5]/10 hover:bg-[#6515D5]/20 text-[#6515D5] rounded-xl text-xs font-bold transition"
                            >
                              <PlusCircle size={14} />
                              <span>Adjust</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventory Movement Audit Trail */}
          <div className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <History size={18} className="text-[#6515D5]" />
              <h2 className="text-base font-black text-[#171428]">Recent Stock Movement Audit Trail</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8FD] border-b border-[#EAE6F3] text-xs font-bold uppercase tracking-wider text-[#77738A]">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Movement Type</th>
                    <th className="py-3 px-4 text-center">Qty Change</th>
                    <th className="py-3 px-4 text-center">New Balance</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2FA] text-xs">
                  {data.movements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#77738A]">
                        No stock movement records logged yet.
                      </td>
                    </tr>
                  ) : (
                    data.movements.slice(0, 15).map((m) => (
                      <tr key={m.id} className="hover:bg-[#FAF8FE]">
                        <td className="py-3 px-4 text-[#77738A]">
                          {new Date(m.createdAt).toLocaleString('en-NG')}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#171428]">{m.productName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              m.movementType === 'restock'
                                ? 'bg-[#ECFDF5] text-[#10B981]'
                                : m.movementType === 'sale'
                                ? 'bg-[#EFF6FF] text-[#3B82F6]'
                                : m.movementType === 'damage'
                                ? 'bg-[#FEF2F2] text-[#EF4444]'
                                : 'bg-[#FAF5FF] text-[#6515D5]'
                            }`}
                          >
                            {m.movementType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={m.quantityChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                            {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#171428]">{m.newStock}</td>
                        <td className="py-3 px-4 text-[#171428]">{m.reason}</td>
                        <td className="py-3 px-4 text-[#77738A]">{m.adminEmail || 'admin'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EAE6F3] overflow-hidden">
            <div className="p-6 border-b border-[#EAE6F3] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#171428]">Stock Adjustment</h3>
                <p className="text-xs text-[#77738A] mt-0.5">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F7F5FC] flex items-center justify-center text-[#77738A] hover:text-[#171428]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-[#FAF8FE] p-3.5 rounded-xl border border-[#EAE6F3] flex items-center justify-between">
                <div>
                  <span className="text-[#77738A]">Current Stock Balance</span>
                  <div className="text-lg font-black text-[#171428]">{selectedProduct.stock_quantity} units</div>
                </div>
                <div className="text-right">
                  <span className="text-[#77738A]">SKU</span>
                  <div className="font-bold text-[#6515D5]">{selectedProduct.sku}</div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#171428] mb-1">Adjustment Type</label>
                <select
                  value={movementType}
                  onChange={(e: any) => setMovementType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs font-semibold text-[#171428] focus:ring-2 focus:ring-[#6515D5]/20 focus:outline-none"
                >
                  <option value="restock">Restock (+ Add Stock from Supplier)</option>
                  <option value="adjustment">Manual Adjustment (+ / - Count correction)</option>
                  <option value="damage">Damaged or Expired (- Deduct Stock)</option>
                  <option value="return">Customer Return (+ Restock Item)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#171428] mb-1">Quantity Change (Units)</label>
                <input
                  type="number"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs font-semibold text-[#171428] focus:ring-2 focus:ring-[#6515D5]/20 focus:outline-none"
                  placeholder="e.g. 20"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#171428] mb-1">Reason / Notes for Audit Trail</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs font-semibold text-[#171428] focus:ring-2 focus:ring-[#6515D5]/20 focus:outline-none"
                  placeholder="e.g. Supplier container delivery arrived"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#77738A] hover:bg-[#F7F5FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#6515D5] hover:bg-[#5510A8] text-white shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Applying...' : 'Confirm Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
