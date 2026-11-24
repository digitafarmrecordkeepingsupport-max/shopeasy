'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Plus,
  Box,
  Eye,
  Search,
  ChevronDown,
  Pencil,
  Trash2,
  X,
  UploadCloud,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { AdminProductService } from '../../services/adminProduct.service';
import { AdminAuthService } from '../../services/adminAuth.service';
import { Category } from '../../types';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'products'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
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
    const data = await AdminProductService.getCategories();
    setCategories(data);
    setLoading(false);
  };

  // Metrics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.is_active).length;
  const inactiveCategories = categories.filter((c) => !c.is_active).length;
  const totalProducts = categories.reduce((sum, c) => sum + (c.item_count || 0), 0);

  // Filtered & Sorted
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        const matchesQuery =
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesQuery) return false;

        if (statusFilter === 'active') return cat.is_active;
        if (statusFilter === 'inactive') return !cat.is_active;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'products') return (b.item_count || 0) - (a.item_count || 0);
        return 0; // Default order
      });
  }, [categories, searchQuery, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage]);

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        image_url: cat.image_url || '',
        is_active: cat.is_active,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCategory) {
      await AdminProductService.updateCategory(editingCategory.id, {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        image_url: formData.image_url,
        is_active: formData.is_active,
      });

      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formData.name,
                slug: formData.slug || c.slug,
                description: formData.description,
                image_url: formData.image_url,
                is_active: formData.is_active,
              }
            : c
        )
      );
    } else {
      const created = await AdminProductService.createCategory({
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        image_url: formData.image_url,
        is_active: formData.is_active,
        item_count: 0,
      });

      if (created) {
        setCategories((prev) => [created, ...prev]);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      await AdminProductService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F6FD]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader searchPlaceholder="Search categories, products..." />

        <main className="p-8 space-y-7 max-w-7xl mx-auto w-full">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#6515D5] flex items-center justify-center text-white shadow-md shadow-purple-600/20">
                <LayoutGrid size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#171428] tracking-tight">
                  Categories
                </h1>
                <p className="text-xs sm:text-sm text-[#77738A] mt-0.5 font-medium">
                  Manage your product categories
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center space-x-2 bg-[#6515D5] hover:bg-[#530FB8] text-white text-sm font-bold px-5 py-3 rounded-xl shadow-md shadow-purple-600/25 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Add Category</span>
            </button>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Total Categories */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAE6F3] shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] flex items-center justify-center text-[#6515D5]">
                  <LayoutGrid size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Categories</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">{totalCategories}</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-1 rounded-full">
                ↑ +1
              </span>
            </div>

            {/* 2. Active Categories */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAE6F3] shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED]">
                  <Box size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Active Categories</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">{activeCategories}</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-1 rounded-full">
                ↑ +0
              </span>
            </div>

            {/* 3. Inactive Categories */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAE6F3] shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#64748B]">
                  <Box size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Inactive Categories</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">{inactiveCategories}</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-1 rounded-full">
                ↑ +0
              </span>
            </div>

            {/* 4. Total Products */}
            <div className="bg-[#FFF9EB] rounded-2xl p-5 border border-[#FDE68A]/60 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                  <Eye size={22} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#77738A]">Total Products</div>
                  <div className="text-2xl font-black text-[#171428] mt-0.5">{totalProducts}</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-1 rounded-full">
                ↑ +12
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77738A]"
              />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#EAE6F3] rounded-xl text-sm text-[#171428] placeholder-[#77738A] focus:outline-none focus:border-[#6515D5] transition shadow-sm"
              />
            </div>

            <div className="flex items-center space-x-3">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-[#EAE6F3] rounded-xl px-4 py-2.5 pr-9 text-xs sm:text-sm font-semibold text-[#171428] shadow-sm focus:outline-none focus:border-[#6515D5] cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77738A] pointer-events-none"
                />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-[#EAE6F3] rounded-xl px-4 py-2.5 pr-9 text-xs sm:text-sm font-semibold text-[#171428] shadow-sm focus:outline-none focus:border-[#6515D5] cursor-pointer"
                >
                  <option value="newest">Sort by: Newest First</option>
                  <option value="name">Sort by: Name (A-Z)</option>
                  <option value="products">Sort by: Most Products</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77738A] pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Categories Table Card */}
          <div className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EAE6F3] bg-[#FAF8FE]/50 text-[11px] font-bold text-[#77738A] uppercase tracking-wider">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Category Name</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Products</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE6F3] text-sm">
                  {paginatedCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-purple-50/20 transition">
                      {/* Image */}
                      <td className="py-4 px-6">
                        <div className="w-12 h-12 rounded-xl bg-[#F7F5FC] border border-[#EAE6F3] flex items-center justify-center overflow-hidden shrink-0">
                          {cat.image_url ? (
                            <img
                              src={cat.image_url}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <LayoutGrid size={20} className="text-[#6515D5]" />
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-[#171428]">{cat.name}</span>
                      </td>

                      {/* Slug */}
                      <td className="py-4 px-6">
                        <span className="inline-block bg-[#F3E8FF] text-[#7C3AED] text-xs font-semibold px-3 py-1 rounded-full">
                          {cat.slug}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-6">
                        <span className="text-[#77738A] text-xs sm:text-sm font-medium line-clamp-1 max-w-xs">
                          {cat.description || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                            cat.is_active
                              ? 'bg-[#DCFCE7] text-[#16A34A]'
                              : 'bg-[#FEF3C7] text-[#D97706]'
                          }`}
                        >
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Products */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-[#171428]">
                          {cat.item_count || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center space-x-2">
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenModal(cat)}
                            title="Edit Category"
                            className="w-8 h-8 rounded-lg border border-[#EAE6F3] hover:border-[#6515D5] hover:bg-purple-50 text-[#7C3AED] flex items-center justify-center transition shadow-2xs"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* View */}
                          <button
                            onClick={() => setViewingCategory(cat)}
                            title="View Details"
                            className="w-8 h-8 rounded-lg border border-[#EAE6F3] hover:border-[#6515D5] hover:bg-purple-50 text-[#7C3AED] flex items-center justify-center transition shadow-2xs"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            title="Delete Category"
                            className="w-8 h-8 rounded-lg border border-[#FEE2E2] hover:bg-red-50 text-[#EF4444] flex items-center justify-center transition shadow-2xs"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedCategories.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#77738A]">
                        No categories found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Counter matching Image 1 */}
            <div className="px-6 py-4 border-t border-[#EAE6F3] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#77738A]">
              <div>
                Showing {filteredCategories.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
                {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of{' '}
                {filteredCategories.length} categories
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-lg border border-[#EAE6F3] bg-white hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white transition"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition ${
                      currentPage === page
                        ? 'bg-[#6515D5] text-white shadow-sm'
                        : 'text-[#171428] hover:bg-purple-100/50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-lg border border-[#EAE6F3] bg-white hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white transition"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EAE6F3] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6F3]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#6515D5]">
                  <LayoutGrid size={18} />
                </div>
                <h3 className="text-lg font-bold text-[#171428]">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fashion, Electronics"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6F3] text-sm text-[#171428] focus:outline-none focus:border-[#6515D5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase mb-1">
                  Slug (URL identifier)
                </label>
                <input
                  type="text"
                  placeholder="e.g. fashion"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6F3] text-sm text-[#171428] focus:outline-none focus:border-[#6515D5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of products in this category"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6F3] text-sm text-[#171428] focus:outline-none focus:border-[#6515D5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6F3] text-sm text-[#171428] focus:outline-none focus:border-[#6515D5]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-[#171428] uppercase">
                  Category Status
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6515D5]"></div>
                  <span className="ml-3 text-xs font-semibold text-[#171428]">
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#EAE6F3] text-sm font-semibold text-[#77738A] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#6515D5] hover:bg-[#530FB8] text-white text-sm font-bold shadow-md shadow-purple-600/20"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Drawer / Modal */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE6F3]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6F3]">
              <h3 className="text-lg font-bold text-[#171428]">Category Overview</h3>
              <button
                onClick={() => setViewingCategory(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="w-full h-40 rounded-xl bg-[#F8F6FD] border border-[#EAE6F3] flex items-center justify-center overflow-hidden">
                {viewingCategory.image_url ? (
                  <img
                    src={viewingCategory.image_url}
                    alt={viewingCategory.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LayoutGrid size={48} className="text-[#6515D5]" />
                )}
              </div>

              <div>
                <h4 className="text-xl font-bold text-[#171428]">{viewingCategory.name}</h4>
                <span className="inline-block bg-[#F3E8FF] text-[#7C3AED] text-xs font-semibold px-3 py-1 rounded-full mt-1">
                  /{viewingCategory.slug}
                </span>
              </div>

              <p className="text-sm text-[#77738A] leading-relaxed">
                {viewingCategory.description || 'No description provided for this category.'}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#FAF8FE] p-3 rounded-xl border border-[#EAE6F3]">
                  <div className="text-xs text-[#77738A]">Status</div>
                  <div
                    className={`font-bold text-sm mt-0.5 ${
                      viewingCategory.is_active ? 'text-[#16A34A]' : 'text-[#D97706]'
                    }`}
                  >
                    {viewingCategory.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="bg-[#FAF8FE] p-3 rounded-xl border border-[#EAE6F3]">
                  <div className="text-xs text-[#77738A]">Total Products</div>
                  <div className="font-bold text-sm text-[#171428] mt-0.5">
                    {viewingCategory.item_count || 0} items
                  </div>
                </div>
              </div>

              <button
                onClick={() => setViewingCategory(null)}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#6515D5] text-white font-bold text-sm"
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
