// src/features/cart/services/localCartService.ts
// Moved from: src/modules/cart/cart.module.ts (LocalCartService)
import type { LocalCartItem } from '../types/cart.types';

export type CartItem = LocalCartItem;

const CART_KEY = 'cart_items';

function readCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch { return []; }
}

function writeCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export const LocalCartService = {
  getCart():               CartItem[] { return readCart(); },
  setCart(items: CartItem[]): void    { writeCart(items); },

  addItemFromVariant(item: CartItem): void {
    const cart = readCart();
    const existing = cart.find((i) => i.id === item.id);
    if (existing) existing.quantity += item.quantity;
    else cart.push({ ...item });
    writeCart(cart);
  },

  addItem(product: { id: string; name: string; price: number; img: string }, quantity = 1): void {
    const cart = readCart();
    const existing = cart.find((i) => i.id === product.id);
    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity });
    writeCart(cart);
  },

  removeItem(productId: string): void {
    writeCart(readCart().filter((i) => i.id !== productId));
  },

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) { LocalCartService.removeItem(productId); return; }
    const cart = readCart();
    const item = cart.find((i) => i.id === productId);
    if (item) { item.quantity = quantity; writeCart(cart); }
  },

  clear(): void { localStorage.removeItem(CART_KEY); },

  getTotal():     number { return readCart().reduce((s, i) => s + i.price * i.quantity, 0); },
  getItemCount(): number { return readCart().reduce((s, i) => s + i.quantity, 0); },
};
