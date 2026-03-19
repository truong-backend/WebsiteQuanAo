// src/api/CallApi/cartApi.ts
import { BaseApi } from "../BaseApi/baseApi";
import type { CartResponse, AddToCartRequest } from "../../type/Cart/CartResponse";

class CartApi extends BaseApi<CartResponse, AddToCartRequest, never> {
  constructor() {
    super("carts");
  }

  /** GET /carts/me */
  getMyCart() {
    return this.axiosInstance.get<CartResponse>("/me");
  }

  /** POST /carts/me/items */
  addToCart(payload: AddToCartRequest) {
    return this.axiosInstance.post<CartResponse>("/me/items", payload);
  }

  /** PUT /carts/me/items/{cartItemId}?quantity=n */
  updateCartItem(cartItemId: string, quantity: number) {
    return this.axiosInstance.put<CartResponse>(`/me/items/${cartItemId}`, null, {
      params: { quantity },
    });
  }

  /** DELETE /carts/me/items/{cartItemId} */
  removeCartItem(cartItemId: string) {
    return this.axiosInstance.delete<CartResponse>(`/me/items/${cartItemId}`);
  }

  /** DELETE /carts/me */
  clearCart() {
    return this.axiosInstance.delete("/me");
  }
}

export const cartApi = new CartApi();