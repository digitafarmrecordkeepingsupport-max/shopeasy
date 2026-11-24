'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { AdminProductService } from '../../services/adminProduct.service';
import { AdminAuthService } from '../../services/adminAuth.service';
import { formatNaira } from '../../lib/utils';
import { Product, Category } from '../../types';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: 'cat-fashion',
    price: '',
    original_price: '',
    stock_quantity: '',
    sku: '',
    image_url: '',
    is_featured: false,
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
    const [prods, cats] = await Promise.all([
      AdminProductService.getProducts(),
      AdminProductService.getCategories(),
    ]);
    setProducts(prods);
    setCategories(cats);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category_id: categories[0]?.id || 'cat-fashion',
      price: '',
      original_price: '',
      stock_quantity: '20',
      sku: `SE-PRD-${Math.floor(100 + Math.random() * 900)}`,
      image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800',
      is_featured: false,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description,
      category_id: prod.category_id,
      price: prod.price.toString(),
      original_price: prod.original_price?.toString() || '',
      stock_quantity: prod.stock_quantity.toString(),
      sku: prod.sku,
      image_url: prod.image_urls[0] || '',
      is_featured: prod.is_featured,
      is_active: prod.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      category_id: formData.category_id,
      category_name: categories.find((c) => c.id === formData.category_id)?.name || 'Fashion',
      price: Number(formData.price) || 0,
      original_price: formData.original_price ? Number(formData.original_price) : undefined,
      stock_quantity: Number(formData.stock_quantity) || 0,
      sku: formData.sku,
      image_urls: [formData.image_url],
      is_featured: formData.is_featured,
      is_active: formData.is_active,
    };

    if (editingProduct) {
      await AdminProductService.updateProduct(editingProduct.id, payload);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
      );
    } else {
      const created = await AdminProductService.createProduct(payload);
      if (created) {
        setProducts([created, ...products]);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to deactivate this product?')) {
      await AdminProductService.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#F8F6FD]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader searchPlaceholder="Search products or SKU..." onSearch={setSearchQuery} />

        <main className="p-8 space-y-7 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#171428] tracking-tight flex items-center space-x-2.5">
                <Package size={28} className="text-[#6515D5]" />
                <span>Product Management</span>
              </h1>
              <p className="text-sm text-[#77738A] mt-1 font-medium">
                Add, edit, and control product inventory visible to customers.
              </p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-2xl bg-[#6515D5] hover:bg-[#520FB3] text-white text-sm font-bold shadow-md shadow-purple-600/20 transition flex items-center space-x-2 shrink-0 self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6F3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-[#6515D5] text-white'
                    : 'bg-[#F7F5FC] text-[#77738A] hover:text-[#171428]'
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    selectedCategory === c.id
                      ? 'bg-[#6515D5] text-white'
                      : 'bg-[#F7F5FC] text-[#77738A] hover:text-[#171428]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-xs text-[#171428] placeholder-[#77738A] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/20 focus:border-[#6515D5]"
              />
              <Search size={15} className="absolute left-3 top-2.5 text-[#77738A]" />
            </div>
          </div>

          {/* Products Grid / Table */}
          <div className="bg-white rounded-2xl border border-[#EAE6F3] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8FD] border-b border-[#EAE6F3] text-xs font-bold uppercase tracking-wider text-[#77738A]">
                  <tr>
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">SKU</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6 text-center">Stock</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2FA] text-sm">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8FE] transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.image_urls[0]}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#EAE6F3]"
                          />
                          <div>
                            <div className="font-bold text-[#171428] leading-tight">{p.name}</div>
                            {p.is_featured && (
                              <span className="text-[10px] font-black text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-md inline-block mt-1">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-[#77738A] font-semibold">{p.sku}</td>
                      <td className="py-4 px-6 text-xs text-[#171428] font-bold">{p.category_name || 'Electronics'}</td>
                      <td className="py-4 px-6">
                        <div className="font-black text-[#6515D5]">{formatNaira(p.price)}</div>
                        {p.original_price && p.original_price > p.price && (
                          <div className="text-[11px] text-[#A09CB3] line-through">
                            {formatNaira(p.original_price)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            p.stock_quantity > 10
                              ? 'bg-green-50 text-green-700'
                              : p.stock_quantity > 0
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {p.stock_quantity} units
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {p.is_active ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-[#6515D5] hover:bg-purple-50 transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-[#EAE6F3] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-[#77738A] hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-black text-[#171428] mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#171428] mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] mb-1.5">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product features, specifications, and warranty info..."
                  className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171428] mb-1.5">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171428] mb-1.5">SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171428] mb-1.5">Selling Price (₦)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="25000"
                    className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171428] mb-1.5">Original Price (₦)</label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="32000"
                    className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171428] mb-1.5">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="25"
                    className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] mb-1.5">Product Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                />
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-[#6515D5] rounded"
                  />
                  <span className="font-bold text-xs text-[#171428]">Feature on Home Carousel</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#6515D5] rounded"
                  />
                  <span className="font-bold text-xs text-[#171428]">Active & In Stock</span>
                </label>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#EAE6F3] text-sm font-bold text-[#77738A] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#6515D5] text-white text-sm font-bold hover:bg-[#520FB3] shadow-md shadow-purple-600/20"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
