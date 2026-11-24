import { Product, InventoryMovementItem } from '../types';

export interface InventorySummary {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface InventoryData {
  items: Product[];
  movements: InventoryMovementItem[];
  summary: InventorySummary;
}

export const AdminInventoryService = {
  async getInventory(): Promise<InventoryData> {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const rawItems = json.data.items || [];
          const items: Product[] = rawItems.map((p: any) => ({
            id: p.id || p._id?.toString() || '',
            name: p.name || 'Untitled',
            slug: p.slug || '',
            description: p.description || '',
            category_id: p.categoryId || p.category_id || '',
            category_name: p.categoryName || p.category_name || '',
            price: Number(p.price || 0),
            original_price: p.originalPrice ? Number(p.originalPrice) : undefined,
            stock_quantity: Number(p.stockQuantity ?? p.stock_quantity ?? 0),
            sku: p.sku || '',
            image_urls: Array.isArray(p.images) ? p.images : (p.image_urls || []),
            is_featured: !!p.isFeatured,
            is_active: !!p.isActive,
            rating: p.rating || 5,
            rating_count: p.ratingCount || 0,
            created_at: p.createdAt || p.created_at || new Date().toISOString(),
          }));

          const movements: InventoryMovementItem[] = (json.data.movements || []).map((m: any) => ({
            id: m.id || m._id?.toString() || '',
            productId: m.productId || '',
            productName: m.productName || 'Product',
            movementType: m.movementType || 'adjustment',
            quantityChange: Number(m.quantityChange || 0),
            previousStock: Number(m.previousStock || 0),
            newStock: Number(m.newStock || 0),
            reason: m.reason || '',
            adminEmail: m.adminEmail || '',
            createdAt: m.createdAt || new Date().toISOString(),
          }));

          return {
            items,
            movements,
            summary: json.data.summary || {
              totalProducts: items.length,
              totalStock: items.reduce((s, p) => s + p.stock_quantity, 0),
              lowStockCount: items.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5).length,
              outOfStockCount: items.filter((p) => p.stock_quantity <= 0).length,
            },
          };
        }
      }
    } catch (e) {
      console.error('Error fetching inventory:', e);
    }

    return {
      items: [],
      movements: [],
      summary: { totalProducts: 0, totalStock: 0, lowStockCount: 0, outOfStockCount: 0 },
    };
  },

  async adjustStock(params: {
    productId: string;
    quantityChange: number;
    movementType: 'restock' | 'adjustment' | 'damage' | 'return';
    reason: string;
    adminEmail?: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      return { success: res.ok, message: data.message || data.error };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },
};
