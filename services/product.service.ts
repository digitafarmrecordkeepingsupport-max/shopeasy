import { Product, Category } from '../types';
import { MOCK_PRODUCTS } from '../data/mock-products';
import { MOCK_CATEGORIES } from '../data/mock-categories';
import { StorageService, StorageKeys } from './storage.service';
import { supabase, isSupabaseConfigured } from './supabase';

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
   */
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Product[];
      }
    }

    return await this.initializeProducts();
  },

  /**
   * Get all products (including inactive) for store owner admin dashboard
   */
  async getAllProductsForAdmin(): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Product[];
      }
    }

    return await this.initializeProducts();
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
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
    return products.filter((p) => p.category_id === categoryId);
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
      products = products.filter((p) => p.category_id === categoryId);
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
   */
  async createProduct(newProduct: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const product: Product = {
      ...newProduct,
      id: 'prod-' + Date.now().toString(36),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('products').insert([product]).select().single();
      if (!error && data) {
        return data as Product;
      }
    }

    const current = await this.getAllProductsForAdmin();
    const updated = [product, ...current];
    await StorageService.setItem(StorageKeys.PRODUCTS, updated);
    return product;
  },

  /**
   * Admin: Update an existing product
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        return data as Product;
      }
    }

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
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('products').delete().eq('id', id);
    }

    const current = await this.getAllProductsForAdmin();
    const filtered = current.filter((p) => p.id !== id);
    await StorageService.setItem(StorageKeys.PRODUCTS, filtered);
    return true;
  },

  /**
   * Categories
   */
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    }

    const existing = await StorageService.getItem<Category[]>(StorageKeys.CATEGORIES, []);
    if (!existing || existing.length === 0) {
      await StorageService.setItem(StorageKeys.CATEGORIES, MOCK_CATEGORIES);
      return MOCK_CATEGORIES;
    }
    return existing;
  },
};
