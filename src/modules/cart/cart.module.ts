// ─────────────────────────────────────────────────────────────
//  modules/cart/cart.module.ts
//  Chịu trách nhiệm:
//    - LocalCart  : giỏ hàng localStorage (dùng ở ProductDetail, CartPage, CheckoutPage)
//    - ServerCart : API /carts  (admin hoặc sync)
//    - CartItemService : API /cart-items
// ─────────────────────────────────────────────────────────────
import axios from "axios";
import { BaseApi, type PageResponse } from "../../api/BaseApi/baseApi";
import type {
  CartResponse,
  AddToCartRequest,
  CartCreateRequest,
  CartUpdateRequest,
  CartItemResponse,
  CartItemCreateRequest,
  CartItemUpdateRequest,
  LocalCartItem,
} from "@/types";

// ─────────────────────────────────────────────────────────────
//  LOCAL CART (localStorage)
//  Re-export LocalCartItem as CartItem for backwards compatibility
// ─────────────────────────────────────────────────────────────
export type CartItem = LocalCartItem;

const CART_KEY = "cart_items";

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
  getCart():              CartItem[] { return readCart(); },
  setCart(items: CartItem[]): void   { writeCart(items); },

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

// ─────────────────────────────────────────────────────────────
//  SERVER CART API  (/carts)
// ─────────────────────────────────────────────────────────────
class CartApi extends BaseApi<CartResponse, CartCreateRequest, CartUpdateRequest> {
  constructor() { super("carts"); }

  /** GET /carts/me */
  getMyCart() { return this.axiosInstance.get<CartResponse>("/me"); }

  /** POST /carts/me/items */
  addToCart(payload: AddToCartRequest) {
    return this.axiosInstance.post<CartResponse>("/me/items", payload);
  }

  /** PUT /carts/me/items/:cartItemId?quantity=n */
  updateCartItem(cartItemId: string, quantity: number) {
    return this.axiosInstance.put<CartResponse>(`/me/items/${cartItemId}`, null, {
      params: { quantity },
    });
  }

  /** DELETE /carts/me/items/:cartItemId */
  removeCartItem(cartItemId: string) {
    return this.axiosInstance.delete<CartResponse>(`/me/items/${cartItemId}`);
  }

  /** DELETE /carts/me */
  clearCart() { return this.axiosInstance.delete("/me"); }
}

const cartApi = new CartApi();

function msg(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message === "string" && o.message) return o.message;
  if (typeof o.error   === "string" && o.error)   return o.error;
  return fallback;
}

export const ServerCartService = {
  async getCarts(page = 0, size = 10, search?: string, sortBy = "id", sortDir: "asc" | "desc" = "asc"): Promise<PageResponse<CartResponse>> {
    try { return await cartApi.getAll<PageResponse<CartResponse>>(page, size, search, sortBy, sortDir); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể tải giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async getById(id: string): Promise<CartResponse> {
    try { return await cartApi.getById(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không tìm thấy giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async getMyCart(): Promise<CartResponse> {
    try { return (await cartApi.getMyCart()).data; }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể tải giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async addToCart(payload: AddToCartRequest): Promise<CartResponse> {
    try { return (await cartApi.addToCart(payload)).data; }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể thêm vào giỏ"));
      throw new Error("Không thể kết nối server");
    }
  },

  async updateCartItem(cartItemId: string, quantity: number): Promise<CartResponse> {
    try { return (await cartApi.updateCartItem(cartItemId, quantity)).data; }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể cập nhật số lượng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async removeCartItem(cartItemId: string): Promise<CartResponse> {
    try { return (await cartApi.removeCartItem(cartItemId)).data; }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể xóa khỏi giỏ"));
      throw new Error("Không thể kết nối server");
    }
  },

  async clearCart(): Promise<void> {
    try { await cartApi.clearCart(); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể xóa giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async create(payload: CartCreateRequest): Promise<CartResponse> {
    try { return await cartApi.create(payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể tạo giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async delete(id: string): Promise<void> {
    try { return await cartApi.delete(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể xóa giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },
};

// ─────────────────────────────────────────────────────────────
//  CART ITEM API  (/cart-items)
// ─────────────────────────────────────────────────────────────
class CartItemApi extends BaseApi<CartItemResponse, CartItemCreateRequest, CartItemUpdateRequest> {
  constructor() { super("cart-items"); }

  async getCartItems(page = 0, size = 10, cartId?: string, sortBy = "id", sortDir: "asc" | "desc" = "asc"): Promise<PageResponse<CartItemResponse>> {
    const extra: Record<string, string> = {};
    if (cartId) extra.cartId = cartId;
    return this.getAll<PageResponse<CartItemResponse>>(page, size, undefined, sortBy, sortDir, extra);
  }
}

const cartItemApi = new CartItemApi();

export const CartItemService = {
  async getCartItems(page = 0, size = 10, cartId?: string, sortBy = "id", sortDir: "asc" | "desc" = "asc"): Promise<PageResponse<CartItemResponse>> {
    try { return await cartItemApi.getCartItems(page, size, cartId, sortBy, sortDir); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể tải sản phẩm trong giỏ"));
      throw new Error("Không thể kết nối server");
    }
  },

  async getById(id: string): Promise<CartItemResponse> {
    try { return await cartItemApi.getById(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không tìm thấy mục giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async create(payload: CartItemCreateRequest): Promise<CartItemResponse> {
    try { return await cartItemApi.create(payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể thêm vào giỏ"));
      throw new Error("Không thể kết nối server");
    }
  },

  async update(id: string, payload: CartItemUpdateRequest): Promise<CartItemResponse> {
    try { return await cartItemApi.update(id, payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể cập nhật số lượng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async delete(id: string): Promise<void> {
    try { return await cartItemApi.delete(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể xóa khỏi giỏ"));
      throw new Error("Không thể kết nối server");
    }
  },
};