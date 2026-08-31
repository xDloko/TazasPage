'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  qty: number;
  unit_price: number;
  name: string;
  image_url?: string | null;
}

/* eslint-disable no-unused-vars */
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}
/* eslint-enable no-unused-vars */

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'tazas_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    setItems(current => {
      const existing = current.find(i => i.product_id === item.product_id && i.variant_id === item.variant_id);
      if (existing) {
        return current.map(i =>
          i.id === existing.id ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      const newItem: CartItem = { ...item, id: crypto.randomUUID() };
      return [...current, newItem];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(current => current.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems(current => current.filter(i => i.id !== id));
    } else {
      setItems(current => current.map(i => (i.id === id ? { ...i, qty } : i)));
    }
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.unit_price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}