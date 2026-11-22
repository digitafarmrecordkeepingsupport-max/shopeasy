import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { StorageService, StorageKeys } from '../services/storage.service';
import { MOCK_PRODUCTS } from '../data/mock-products';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const saved = await StorageService.getItem<CartItem[]>(StorageKeys.CART, []);
      if (saved && saved.length >= 3) {
        setItems(saved);
      } else {
        // Pre-seed 3 demo items as displayed on the reference image (Wireless Earbuds, Smart Watch, Casual Sneakers)
        const initialDemo: CartItem[] = [
          {
            id: 'cart-' + MOCK_PRODUCTS[0].id,
            product: MOCK_PRODUCTS[0], // Wireless Earbuds ₦25,000
            quantity: 1,
          },
          {
            id: 'cart-' + MOCK_PRODUCTS[1].id,
            product: MOCK_PRODUCTS[1], // Smart Watch ₦45,000
            quantity: 1,
          },
          {
            id: 'cart-' + MOCK_PRODUCTS[2].id,
            product: MOCK_PRODUCTS[2], // Casual Sneakers ₦35,000
            quantity: 1,
          },
        ];
        setItems(initialDemo);
        await StorageService.setItem(StorageKeys.CART, initialDemo);
      }
    } catch (e) {
      console.warn('Failed to load cart:', e);
    } finally {
      setIsInitialized(true);
    }
  };

  const persistCart = async (newItems: CartItem[]) => {
    setItems(newItems);
    await StorageService.setItem(StorageKeys.CART, newItems);
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    let updated: CartItem[];

    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
      };
    } else {
      const newItem: CartItem = {
        id: 'cart-' + product.id + '-' + Date.now(),
        product,
        quantity,
      };
      updated = [newItem, ...items];
    }
    persistCart(updated);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const updated = items
      .map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    persistCart(updated);
  };

  const removeFromCart = (itemId: string) => {
    const updated = items.filter((i) => i.id !== itemId);
    persistCart(updated);
  };

  const clearCart = () => {
    persistCart([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 2000 : 0;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        total,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
