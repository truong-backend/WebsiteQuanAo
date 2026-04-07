import { create } from 'zustand'
import type { CartDto } from '@shared/types'
import {
  fetchCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
} from '@features/cart/api/cartApi'
import { toast } from '@shared/lib'

interface CartState {
  cart:       CartDto | null
  isOpen:     boolean
  loading:    boolean
  // Actions
  loadCart:       () => Promise<void>
  addItem:        (variantId: string, quantity: number) => Promise<void>
  updateItem:     (cartItemId: number, quantity: number) => Promise<void>
  removeItem:     (cartItemId: number) => Promise<void>
  clearCart:      () => Promise<void>
  openDrawer:     () => void
  closeDrawer:    () => void
}

export const useCartStore = create<CartState>()((set) => ({
  cart:    null,
  isOpen:  false,
  loading: false,

  loadCart: async () => {
    try {
      set({ loading: true })
      const cart = await fetchCart()
      set({ cart })
    } catch {
      // Guest user — giỏ rỗng
      set({ cart: null })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (variantId, quantity) => {
    try {
      const cart = await addToCartApi(variantId, quantity)
      set({ cart, isOpen: true })
      toast('Đã thêm vào giỏ hàng')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Không thể thêm vào giỏ'
      toast(msg, 'error')
    }
  },

  updateItem: async (cartItemId, quantity) => {
    try {
      const cart = await updateCartItemApi(cartItemId, quantity)
      set({ cart })
    } catch {
      toast('Cập nhật thất bại', 'error')
    }
  },

  removeItem: async (cartItemId) => {
    try {
      const cart = await removeCartItemApi(cartItemId)
      set({ cart })
      toast('Đã xóa khỏi giỏ hàng')
    } catch {
      toast('Xóa thất bại', 'error')
    }
  },

  clearCart: async () => {
    try {
      const cart = await clearCartApi()
      set({ cart })
    } catch {
      // silent
    }
  },

  openDrawer:  () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
}))
