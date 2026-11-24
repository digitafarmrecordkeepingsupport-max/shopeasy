import { Product, Category } from '../types';

export const AdminProductService = {
  /**
   * Fetch all real products from MongoDB Atlas
   */
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json();
        const raw: any[] = Array.isArray(json.data) ? json.data : [];
        return raw.map((p) => ({
          id: p.id || p._id?.toString() || '',
          name: p.name || 'Unnamed Product',
          slug: p.slug || '',
          description: p.description || '',
          category_id: p.categoryId || p.category_id || '',
          category_name: p.categoryName || p.category_name || '',
          price: Number(p.price || 0),
          original_price: p.originalPrice ? Number(p.originalPrice) : undefined,
          stock_quantity: Number(p.stockQuantity ?? p.stock_quantity ?? 0),
          sku: p.sku || '',
          image_urls: Array.isArray(p.imageUrls) ? p.imageUrls : (Array.isArray(p.image_urls) ? p.image_urls : []),
          is_featured: Boolean(p.isFeatured ?? p.is_featured),
          is_active: Boolean(p.isActive ?? p.is_active ?? true),
          created_at: p.createdAt || p.created_at || new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.error('Error fetching admin products:', e);
    }
    return [];
  },

  /**
   * Fetch all real categories from MongoDB Atlas
   */
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const json = await res.json();
        const raw: any[] = Array.isArray(json.data) ? json.data : [];
        return raw.map((c) => ({
          id: c.id || c._id?.toString() || '',
          name: c.name || '',
          slug: c.slug || '',
          description: c.description || '',
          icon_name: c.iconName || c.icon_name || 'tag',
          image_url: c.imageUrl || c.image_url || '',
          color: c.color || '#F3E8FF',
          is_active: Boolean(c.isActive ?? c.is_active ?? true),
          item_count: Number(c.itemCount ?? c.item_count ?? 0),
          created_at: c.createdAt || c.created_at || new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.error('Error fetching admin categories:', e);
    }
    return [];
  },

  /**
   * Create a new category in MongoDB Atlas
   */
  async createCategory(categoryData: Partial<Category>): Promise<Category | null> {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          iconName: categoryData.icon_name,
          imageUrl: categoryData.image_url,
          color: categoryData.color,
          isActive: categoryData.is_active ?? true,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.error('Error creating category:', e);
    }
    return null;
  },

  /**
   * Update category in MongoDB Atlas
   */
  async updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(updates.name && { name: updates.name }),
          ...(updates.slug && { slug: updates.slug }),
          ...(updates.description && { description: updates.description }),
          ...(updates.icon_name && { iconName: updates.icon_name }),
          ...(updates.image_url && { imageUrl: updates.image_url }),
          ...(updates.color && { color: updates.color }),
          ...(updates.is_active !== undefined && { isActive: updates.is_active }),
        }),
      });
      return res.ok;
    } catch (e) {
      console.error('Error updating category:', e);
      return false;
    }
  },

  /**
   * Delete category in MongoDB Atlas
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('Error deleting category:', e);
      return false;
    }
  },

  /**
   * Create product in MongoDB Atlas
   */
  async createProduct(productData: Partial<Product>): Promise<Product | null> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          categoryId: productData.category_id,
          categoryName: productData.category_name,
          price: productData.price,
          originalPrice: productData.original_price,
          stockQuantity: productData.stock_quantity,
          sku: productData.sku,
          imageUrls: productData.image_urls,
          isFeatured: productData.is_featured,
          isActive: productData.is_active ?? true,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.error('Error creating product:', e);
    }
    return null;
  },

  /**
   * Update product in MongoDB Atlas
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      return res.ok;
    } catch (e) {
      console.error('Error updating product:', e);
      return false;
    }
  },

  /**
   * Delete / archive product in MongoDB Atlas
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('Error deleting product:', e);
      return false;
    }
  },

  /**
   * Upload image to Cloudinary via backend API
   */
  async uploadProductImage(file: File): Promise<string | null> {
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
      console.error('Cloudinary upload error:', e);
    }
    return null;
  },
};
