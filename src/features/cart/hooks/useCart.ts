// src/features/cart/hooks/useCart.ts
import { useState } from 'react';
import { LocalCartService, type CartItem } from '../services/localCartService';

const MIN_QUANTITY = 1;

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => LocalCartService.getCart());

  const persist = (next: CartItem[]) => {
    setItems(next);
    LocalCartService.setCart(next);
  };

  const changeQty  = (id: string, delta: number) =>
    persist(items.map((i) => i.id === id ? { ...i, quantity: Math.max(MIN_QUANTITY, i.quantity + delta) } : i));

  const removeItem = (id: string) => persist(items.filter((i) => i.id !== id));

  const total      = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return { items, changeQty, removeItem, total, totalItems };
}
