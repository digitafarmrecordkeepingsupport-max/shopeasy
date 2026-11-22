import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Product, Category } from '../types';

export const AdminProductService = {
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data as Product[];
      }
    }

    return [
      {
        id: 'prod-earbuds-03',
        name: 'Wireless Earbuds',
        slug: 'wireless-earbuds',
        description: 'White wireless earbuds with active noise cancellation and charging case.',
        category_id: 'cat-electronics',
        category_name: 'Electronics',
        price: 25000,
        original_price: 32000,
        stock_quantity: 45,
        sku: 'SE-EBD-003',
        image_urls: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop'],
        is_featured: true,
        is_active: true,
        created_at: '2025-01-01',
      },
      {
        id: 'prod-watch-02',
        name: 'Smart Watch',
        slug: 'smart-watch',
        description: 'Black smartwatch with AMOLED display and fitness sensors.',
        category_id: 'cat-electronics',
        category_name: 'Electronics',
        price: 45000,
        original_price: 60000,
        stock_quantity: 28,
        sku: 'SE-WTC-002',
        image_urls: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop'],
        is_featured: true,
        is_active: true,
        created_at: '2025-01-01',
      },
      {
        id: 'prod-sneakers-01',
        name: 'Casual Sneakers',
        slug: 'casual-sneakers',
        description: 'Black-and-white cushioned synthetic leather sneakers.',
        category_id: 'cat-fashion',
        category_name: 'Fashion',
        price: 35000,
        original_price: 50000,
        stock_quantity: 32,
        sku: 'SE-SNK-001',
        image_urls: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop'],
        is_featured: true,
        is_active: true,
        created_at: '2025-01-01',
      },
      {
        id: 'prod-headphones-04',
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'Studio over-ear titanium ANC headphones.',
        category_id: 'cat-electronics',
        category_name: 'Electronics',
        price: 47000,
        original_price: 65000,
        stock_quantity: 19,
        sku: 'SE-HDP-004',
        image_urls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'],
        is_featured: true,
        is_active: true,
        created_at: '2025-01-01',
      },
    ];
  },

  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    }

    return [
      {
        id: 'cat-fashion',
        name: 'Fashion',
        slug: 'fashion',
        description: 'Trendy clothing and fashion items',
        icon_name: 'shirt',
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400',
        color: '#F3E8FF',
        is_active: true,
        item_count: 42,
        created_at: '2025-01-01',
      },
      {
        id: 'cat-electronics',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest electronics and gadgets',
        icon_name: 'laptop',
        image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400',
        color: '#EDE9FE',
        is_active: true,
        item_count: 56,
        created_at: '2025-01-02',
      },
      {
        id: 'cat-home',
        name: 'Home',
        slug: 'home',
        description: 'Home and living essentials',
        icon_name: 'home',
        image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400',
        color: '#F5F3FF',
        is_active: true,
        item_count: 38,
        created_at: '2025-01-03',
      },
      {
        id: 'cat-beauty',
        name: 'Beauty',
        slug: 'beauty',
        description: 'Beauty and personal care products',
        icon_name: 'sparkles',
        image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400',
        color: '#FDF2F8',
        is_active: true,
        item_count: 28,
        created_at: '2025-01-04',
      },
      {
        id: 'cat-sports',
        name: 'Sports',
        slug: 'sports',
        description: 'Sports and fitness equipment',
        icon_name: 'football',
        image_url: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?q=80&w=400',
        color: '#F0FDF4',
        is_active: true,
        item_count: 20,
        created_at: '2025-01-05',
      },
      {
        id: 'cat-accessories',
        name: 'Accessories',
        slug: 'accessories',
        description: 'Fashion accessories and more',
        icon_name: 'bag',
        image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400',
        color: '#FEF3C7',
        is_active: false,
        item_count: 14,
        created_at: '2025-01-06',
      },
      {
        id: 'cat-books',
        name: 'Books',
        slug: 'books',
        description: 'Fiction, non-fiction and educational books',
        icon_name: 'book',
        image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400',
        color: '#F5F3FF',
        is_active: true,
        item_count: 10,
        created_at: '2025-01-07',
      },
      {
        id: 'cat-gaming',
        name: 'Gaming',
        slug: 'gaming',
        description: 'Consoles, video games and accessories',
        icon_name: 'gamepad',
        image_url: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?q=80&w=400',
        color: '#EDE9FE',
        is_active: true,
        item_count: 12,
        created_at: '2025-01-08',
      },
      {
        id: 'cat-jewelry',
        name: 'Jewelry',
        slug: 'jewelry',
        description: 'Fine rings, necklaces and luxury timepieces',
        icon_name: 'watch',
        image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400',
        color: '#FDF2F8',
        is_active: true,
        item_count: 6,
        created_at: '2025-01-09',
      },
      {
        id: 'cat-groceries',
        name: 'Groceries',
        slug: 'groceries',
        description: 'Pantry essentials, beverages and fresh food',
        icon_name: 'shopping-cart',
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400',
        color: '#F0FDF4',
        is_active: true,
        item_count: 10,
        created_at: '2025-01-10',
      },
      {
        id: 'cat-toys',
        name: 'Toys',
        slug: 'toys',
        description: 'Kids toys, board games and collectibles',
        icon_name: 'smile',
        image_url: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=400',
        color: '#FEF3C7',
        is_active: true,
        item_count: 8,
        created_at: '2025-01-11',
      },
      {
        id: 'cat-automotive',
        name: 'Automotive',
        slug: 'automotive',
        description: 'Car care products, gadgets and spare parts',
        icon_name: 'truck',
        image_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=400',
        color: '#F1F5F9',
        is_active: false,
        item_count: 4,
        created_at: '2025-01-12',
      },
    ];
  },

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    const slug = categoryData.slug || categoryData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'category';
    const newCat: Category = {
      id: 'cat-' + Math.random().toString(36).substring(2, 9),
      name: categoryData.name || '',
      slug,
      description: categoryData.description || '',
      icon_name: categoryData.icon_name || 'tag',
      image_url: categoryData.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400',
      color: categoryData.color || '#F3E8FF',
      is_active: categoryData.is_active ?? true,
      item_count: categoryData.item_count || 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('categories').insert([newCat]).select().single();
      if (!error && data) {
        return data as Category;
      }
    }

    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      return !error;
    }
    return true;
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      return !error;
    }
    return true;
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const slug = productData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'product';
    const newProd: Product = {
      id: 'prod-' + Math.random().toString(36).substring(2, 9),
      name: productData.name || '',
      slug,
      description: productData.description || '',
      category_id: productData.category_id || 'cat-fashion',
      category_name: productData.category_name,
      price: productData.price || 0,
      original_price: productData.original_price,
      stock_quantity: productData.stock_quantity || 0,
      sku: productData.sku || `SE-${Math.floor(1000 + Math.random() * 9000)}`,
      image_urls: productData.image_urls || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'],
      is_featured: productData.is_featured || false,
      is_active: productData.is_active ?? true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('products').insert([newProd]).select().single();
      if (!error && data) {
        return data as Product;
      }
    }

    return newProd;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      return !error;
    }
    return true;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      // Soft-delete by marking inactive to preserve historical orders
      const { error } = await supabase
        .from('products')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      return !error;
    }
    return true;
  },

  async uploadProductImage(file: File): Promise<string | null> {
    // 1. Try Cloudinary via Next.js API
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'shopeasy/products');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          return data.url;
        }
      }
    } catch (e) {
      console.warn('Cloudinary upload via /api/upload error, checking fallbacks:', e);
    }

    // 2. Supabase Storage Fallback
    if (isSupabaseConfigured() && supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (!uploadError) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        return data.publicUrl;
      }
    }

    // 3. Fallback placeholder
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800';
  },
};
