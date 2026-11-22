import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { ProductService } from '../services/product.service';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  featuredProducts: Product[];
  isLoading: boolean;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        ProductService.getAllProductsForAdmin(),
        ProductService.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error('Failed to load products and categories:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProducts = async () => {
    await loadData();
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
    const created = await ProductService.createProduct(productData);
    setProducts((prev) => [created, ...prev]);
    return created;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    const updated = await ProductService.updateProduct(id, updates);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProduct = async (id: string): Promise<void> => {
    await ProductService.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id);
  };

  const featuredProducts = products.filter((p) => p.is_featured && p.is_active);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        featuredProducts,
        isLoading,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
