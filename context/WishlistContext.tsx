import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, WishlistItem } from '../types';
import { StorageService, StorageKeys } from '../services/storage.service';
import { useCart } from './CartContext';

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  moveToCart: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const saved = await StorageService.getItem<WishlistItem[]>(StorageKeys.WISHLIST, []);
      if (saved) {
        setItems(saved);
      }
    } catch (e) {
      console.warn('Failed to load wishlist:', e);
    }
  };

  const persistWishlist = async (newItems: WishlistItem[]) => {
    setItems(newItems);
    await StorageService.setItem(StorageKeys.WISHLIST, newItems);
  };

  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => item.product_id === productId);
  };

  const toggleWishlist = (product: Product) => {
    const exists = isInWishlist(product.id);
    let updated: WishlistItem[];
    if (exists) {
      updated = items.filter((i) => i.product_id !== product.id);
    } else {
      const newItem: WishlistItem = {
        id: 'wish-' + product.id,
        product_id: product.id,
        product,
        added_at: new Date().toISOString(),
      };
      updated = [newItem, ...items];
    }
    persistWishlist(updated);
  };

  const removeFromWishlist = (productId: string) => {
    const updated = items.filter((i) => i.product_id !== productId);
    persistWishlist(updated);
  };

  const moveToCart = (product: Product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
