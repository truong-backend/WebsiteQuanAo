/**
 * Giỏ hàng (localStorage). Dùng thống nhất ở CartPage, CheckoutPage, ProductDetailPage.
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  img: string;
  quantity: number;
}

const CART_KEY = "cart_items";

function readCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export const CartService = {
  getCart(): CartItem[] {
    return readCart();
  },

  setCart(items: CartItem[]): void {
    writeCart(items);
  },

  addItem(product: { id: string; name: string; price: number; img: string }, quantity = 1): void {
    const cart = readCart();
    const existing = cart.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        quantity,
      });
    }
    writeCart(cart);
  },

  removeItem(productId: string): void {
    writeCart(readCart().filter((i) => i.id !== productId));
  },

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) {
      CartService.removeItem(productId);
      return;
    }
    const cart = readCart();
    const item = cart.find((i) => i.id === productId);
    if (item) {
      item.quantity = quantity;
      writeCart(cart);
    }
  },

  clear(): void {
    localStorage.removeItem(CART_KEY);
  },

  getTotal(): number {
    return readCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
  },
};
