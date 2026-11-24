import { Product, Category } from '../types';
import { MOCK_PRODUCTS } from '../data/mock-products';
import { MOCK_CATEGORIES } from '../data/mock-categories';
import { StorageService, StorageKeys } from './storage.service';
import { supabase, isSupabaseConfigured } from './supabase';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://shopeasy-sepia.vercel.app/api').replace(/\/$/, '');

/**
 * Normalizes backend MongoDB / REST payloads into the mobile Product interface
 */
function mapProduct(p: any): Product {
  const imageUrls = Array.isArray(p.image_urls) && p.image_urls.length > 0
    ? p.image_urls
    : Array.isArray(p.imageUrls) && p.imageUrls.length > 0
    ? p.imageUrls
    : [p.image_url || p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'];

  return {
    id: String(p.id || p._id || `prod-${Date.now()}`),
    name: p.name || 'Unnamed Product',
    description: p.description || '',
    category_id: p.category_id || p.categoryId || 'cat-general',
    category_name: p.category_name || p.categoryName || '',
    price: Number(p.price || 0),
    original_price: p.original_price != null
      ? Number(p.original_price)
      : (p.originalPrice != null ? Number(p.originalPrice) : undefined),
    stock_quantity: p.stock_quantity != null
      ? Number(p.stock_quantity)
      : (p.stockQuantity != null ? Number(p.stockQuantity) : 0),
    sku: p.sku || `SE-${Math.floor(1000 + Math.random() * 9000)}`,
    image_urls: imageUrls,
    is_featured: Boolean(p.is_featured ?? p.isFeatured ?? false),
    is_active: p.is_active !== undefined
      ? Boolean(p.is_active)
      : (p.isActive !== undefined ? Boolean(p.isActive) : true),
    rating: p.rating != null ? Number(p.rating) : 4.8,
    rating_count: p.rating_count != null
      ? Number(p.rating_count)
      : (p.ratingCount != null ? Number(p.ratingCount) : 10),
    created_at: p.created_at || p.createdAt || new Date().toISOString(),
    updated_at: p.updated_at || p.updatedAt,
  };
}

/**
 * Normalizes backend MongoDB / REST payloads into the mobile Category interface
 */
function mapCategory(c: any): Category {
  return {
    id: String(c.id || c._id || c.slug),
    name: c.name || 'Category',
    slug: c.slug || (c.name ? c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'category'),
    description: c.description || '',
    icon_name: c.icon_name || c.iconName || 'pricetag',
    image_url: c.image_url || c.imageUrl,
    color: c.color || '#F3E8FF',
    is_active: c.is_active !== undefined
      ? Boolean(c.is_active)
      : (c.isActive !== undefined ? Boolean(c.isActive) : true),
    item_count: c.item_count != null
      ? Number(c.item_count)
      : (c.itemCount != null ? Number(c.itemCount) : 0),
  };
}

export const ProductService = {
  /**
   * Initializes local storage with mock products if not already seeded
   */
  async initializeProducts(): Promise<Product[]> {
    const existing = await StorageService.getItem<Product[]>(StorageKeys.PRODUCTS, []);
    if (!existing || existing.length === 0) {
      await StorageService.setItem(StorageKeys.PRODUCTS, MOCK_PRODUCTS);
      return MOCK_PRODUCTS;
    }
    return existing;
  },

  /**
   * Get all active products for the customer catalogue
   * Prioritizes live cloud backend (Vercel + MongoDB Atlas), then Supabase, then cached storage
   */
  async getProducts(): Promise<Product[]> {
    // 1. Try Live Cloud API (Vercel + MongoDB Atlas)
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        const raw = json.data || json;
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map(mapProduct).filter((p) => p.is_active);
          await StorageService.setItem(StorageKeys.PRODUCTS, mapped);
          return mapped;
        }
      }
    } catch (apiErr) {
      console.log('Live products API unreachable, checking alternatives:', apiErr);
    }

    // 2. Try Supabase fallback
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapProduct);
          return mapped;
        }
      } catch (sbErr) {
        console.log('Supabase products fetch failed:', sbErr);
      }
    }

    // 3. Fallback to Local Storage / Seeded Mocks
    return await this.initializeProducts();
  },

  /**
   * Get all products (including inactive) for store owner admin dashboard
   */
  async getAllProductsForAdmin(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        const raw = json.data || json;
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map(mapProduct);
          await StorageService.setItem(StorageKeys.PRODUCTS, mapped);
          return mapped;
        }
      }
    } catch (apiErr) {
      console.log('Live admin products API unreachable:', apiErr);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(mapProduct);
        }
      } catch (sbErr) {
        console.log('Supabase admin products fetch failed:', sbErr);
      }
    }

    return await this.initializeProducts();
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          return mapProduct(json.data);
        }
      }
    } catch (apiErr) {
      console.log(`Live product ${id} lookup failed:`, apiErr);
    }

    const products = await this.getAllProductsForAdmin();
    return products.find((p) => p.id === id) || null;
  },

  /**
   * Get featured products for home screen carousel and highlights
   */
  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter((p) => p.is_featured);
  },

  /**
   * Get products by category ID or slug
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const products = await this.getProducts();
    if (categoryId === 'all' || categoryId === 'cat-more') {
      return products;
    }
    return products.filter(
      (p) => p.category_id === categoryId || p.category_name?.toLowerCase() === categoryId.toLowerCase()
    );
  },

  /**
   * Search and filter products
   */
  async searchProducts(query: string, categoryId?: string, sortBy?: string): Promise<Product[]> {
    let products = await this.getProducts();

    if (query && query.trim() !== '') {
      const lower = query.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          (p.category_name && p.category_name.toLowerCase().includes(lower))
      );
    }

    if (categoryId && categoryId !== 'all' && categoryId !== 'cat-more') {
      products = products.filter(
        (p) => p.category_id === categoryId || p.category_name?.toLowerCase() === categoryId.toLowerCase()
      );
    }

    if (sortBy) {
      if (sortBy === 'price_asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        products.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'newest') {
        products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    }

    return products;
  },

  /**
   * Admin: Create a new product
   * Pushes to live cloud API, updates MongoDB Atlas, and synchronizes local storage
   */
  async createProduct(newProduct: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const localId = 'prod-' + Date.now().toString(36);
    const now = new Date().toISOString();

    const fallbackProduct: Product = {
      ...newProduct,
      id: localId,
      created_at: now,
    };

    // 1. Try Live API (POST /api/products)
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          categoryId: newProduct.category_id,
          categoryName: newProduct.category_name,
          price: newProduct.price,
          originalPrice: newProduct.original_price,
          stockQuantity: newProduct.stock_quantity,
          sku: newProduct.sku,
          imageUrls: newProduct.image_urls,
          isFeatured: newProduct.is_featured,
          isActive: newProduct.is_active,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const created = mapProduct(json.data);
          const current = await StorageService.getItem<Product[]>(StorageKeys.PRODUCTS, []);
          await StorageService.setItem(StorageKeys.PRODUCTS, [created, ...current]);
          return created;
        }
      }
    } catch (apiErr) {
      console.warn('Live API product creation failed, falling back to local/supabase:', apiErr);
    }

    // 2. Try Supabase fallback
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('products').insert([fallbackProduct]).select().single();
        if (!error && data) {
          return mapProduct(data);
        }
      } catch (sbErr) {
        console.warn('Supabase product insert failed:', sbErr);
      }
    }

    // 3. Fallback to Local Storage
    const current = await this.getAllProductsForAdmin();
    const updated = [fallbackProduct, ...current];
    await StorageService.setItem(StorageKeys.PRODUCTS, updated);
    return fallbackProduct;
  },

  /**
   * Admin: Update an existing product
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    // 1. Try Live API (PUT /api/products/:id)
    try {
      const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...(updates.name && { name: updates.name }),
          ...(updates.description && { description: updates.description }),
          ...(updates.category_id && { categoryId: updates.category_id }),
          ...(updates.category_name && { categoryName: updates.category_name }),
          ...(updates.price !== undefined && { price: updates.price }),
          ...(updates.original_price !== undefined && { originalPrice: updates.original_price }),
          ...(updates.stock_quantity !== undefined && { stockQuantity: updates.stock_quantity }),
          ...(updates.sku && { sku: updates.sku }),
          ...(updates.image_urls && { imageUrls: updates.image_urls }),
          ...(updates.is_featured !== undefined && { isFeatured: updates.is_featured }),
          ...(updates.is_active !== undefined && { isActive: updates.is_active }),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const updated = mapProduct(json.data);
          const current = await StorageService.getItem<Product[]>(StorageKeys.PRODUCTS, []);
          const index = current.findIndex((p) => p.id === id);
          if (index !== -1) {
            current[index] = updated;
            await StorageService.setItem(StorageKeys.PRODUCTS, current);
          }
          return updated;
        }
      }
    } catch (apiErr) {
      console.warn('Live API product update failed:', apiErr);
    }

    // 2. Try Supabase fallback
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          return mapProduct(data);
        }
      } catch (sbErr) {
        console.warn('Supabase product update failed:', sbErr);
      }
    }

    // 3. Fallback to Local Storage
    const current = await this.getAllProductsForAdmin();
    const index = current.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    const updatedProduct = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    current[index] = updatedProduct;
    await StorageService.setItem(StorageKeys.PRODUCTS, current);
    return updatedProduct;
  },

  /**
   * Admin: Delete or archive a product
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (apiErr) {
      console.warn('Live API product delete failed:', apiErr);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase product delete failed:', sbErr);
      }
    }

    const current = await this.getAllProductsForAdmin();
    const filtered = current.filter((p) => p.id !== id);
    await StorageService.setItem(StorageKeys.PRODUCTS, filtered);
    return true;
  },

  /**
   * Categories
   * Fetches from live MongoDB backend (Vercel) first, then Supabase, then cached mocks
   */
  async getCategories(): Promise<Category[]> {
    // 1. Try Live Cloud API (Vercel + MongoDB Atlas)
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        const raw = json.data || json;
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map(mapCategory);
          await StorageService.setItem(StorageKeys.CATEGORIES, mapped);
          return mapped;
        }
      }
    } catch (apiErr) {
      console.log('Live categories API unreachable:', apiErr);
    }

    // 2. Try Supabase fallback
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(mapCategory);
        }
      } catch (sbErr) {
        console.log('Supabase categories fetch failed:', sbErr);
      }
    }

    // 3. Fallback to Local Storage / Seeded Mocks
    const existing = await StorageService.getItem<Category[]>(StorageKeys.CATEGORIES, []);
    if (!existing || existing.length === 0) {
      await StorageService.setItem(StorageKeys.CATEGORIES, MOCK_CATEGORIES);
      return MOCK_CATEGORIES;
    }
    return existing;
  },
};
