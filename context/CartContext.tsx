import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { StorageService, StorageKeys } from '../services/storage.service';
import { SettingsService } from '../services/settings.service';


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
  const [baseDeliveryFee, setBaseDeliveryFee] = useState<number>(2000);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(50000);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadCart();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const cfg = await SettingsService.getSettings();
      if (cfg.deliveryFee !== undefined) setBaseDeliveryFee(cfg.deliveryFee);
      if (cfg.freeShippingThreshold !== undefined) setFreeShippingThreshold(cfg.freeShippingThreshold);
    } catch (e) {
      // Keep defaults
    }
  };

  const loadCart = async () => {
    try {
      const saved = await StorageService.getItem<CartItem[]>(StorageKeys.CART, []);
      if (saved && Array.isArray(saved)) {
        setItems(saved);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.warn('Failed to load cart:', e);
      setItems([]);
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
      updated = items.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      const newItem: CartItem = {
        id: 'cart-' + product.id + '-' + Date.now(),
        product,
        quantity,
      };
      updated = [...items, newItem];
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
      .filter(Boolean) as CartItem[];

    persistCart(updated);
  };

  const removeFromCart = (itemId: string) => {
    const updated = items.filter((item) => item.id !== itemId);
    persistCart(updated);
  };

  const clearCart = () => {
    persistCart([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > freeShippingThreshold || subtotal === 0 ? 0 : baseDeliveryFee;
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
