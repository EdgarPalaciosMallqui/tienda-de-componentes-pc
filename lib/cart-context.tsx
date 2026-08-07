"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem } from "@/types/database";
import { trackEvent } from "@/lib/analytics";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalCents: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tc_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        // ignorar carrito corrupto
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  function addItem(newItem: CartItem) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === newItem.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === newItem.product_id
            ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.stock) }
            : i
        );
      }
      return [...prev, newItem];
    });
    trackEvent("add_to_cart", {
      currency: "PEN",
      value: (newItem.price_cents * newItem.quantity) / 100,
      items: [{ item_id: newItem.product_id, item_name: newItem.name, quantity: newItem.quantity }],
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }

  function setQuantity(productId: string, quantity: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.product_id === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function clear() {
    setItems([]);
  }

  const totalCents = items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQuantity, clear, totalCents, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
