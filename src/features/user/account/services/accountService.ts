// src/features/account/services/accountService.ts
// Moved from: src/modules/account/account.module.ts (AccountService)
import axios from "axios";
import { accountApi } from "../api/accountApi";
import type {
  AccountResponse,
  AccountResponsePageResponse,
  AccountCreateRequest,
  AccountUpdateRequest,
} from "../types/account.types";
import type { ErrorResponse } from "@/types/common.types";
import type { OrderBasicResponse } from "@/features/user/orders/types/order.types";

function handleError(error: unknown, fallback: string): never {
  if (axios.isAxiosError(error) && error.response) {
    throw new Error(
      (error.response.data as ErrorResponse)?.message || fallback,
    );
  }
  throw new Error("Không thể kết nối server");
}

export const AccountService = {
  async getAccountsPaged(
    page = 0,
    size = 10,
    search?: string,
    role?: string,
    sortBy = "email",
    sortDir: "asc" | "desc" = "asc",
  ): Promise<AccountResponsePageResponse> {
    try {
      const r = await accountApi.searchAndFilter(
        page,
        size,
        search,
        role,
        sortBy,
        sortDir,
      );
      return r.data;
    } catch (e) {
      handleError(e, "Không thể tải danh sách tài khoản");
    }
  },

  async createAccount(payload: AccountCreateRequest): Promise<AccountResponse> {
    try {
      return await accountApi.create(payload);
    } catch (e) {
      handleError(e, "Tạo tài khoản thất bại");
    }
  },

  async updateAccount(
    id: string,
    payload: AccountUpdateRequest,
  ): Promise<AccountResponse> {
    try {
      return await accountApi.update(id, payload);
    } catch (e) {
      handleError(e, "Cập nhật tài khoản thất bại");
    }
  },

  async deleteAccount(id: string): Promise<void> {
    try {
      return await accountApi.delete(id);
    } catch (e) {
      handleError(e, "Xóa tài khoản thất bại");
    }
  },

  async getById(id: string): Promise<AccountResponse> {
    try {
      return await accountApi.getById(id);
    } catch (e) {
      handleError(e, "Không thể tải thông tin tài khoản");
    }
  },

  async getOrdersByAccountId(id: string): Promise<OrderBasicResponse[]> {
    try {
      const r = await accountApi.getOrdersByAccountId(id);
      return r.data;
    } catch (e) {
      handleError(e, "Không thể tải lịch sử đơn hàng");
    }
  },

  async updateRole(id: string, role: string): Promise<AccountResponse> {
    try {
      const r = await accountApi.updateRole(id, role);
      return r.data;
    } catch (e) {
      handleError(e, "Cập nhật quyền thất bại");
    }
  },

  async enableAccount(id: string): Promise<AccountResponse> {
    try {
      const r = await accountApi.enable(id);
      return r.data;
    } catch (e) {
      handleError(e, "Kích hoạt tài khoản thất bại");
    }
  },

  async disableAccount(id: string): Promise<AccountResponse> {
    try {
      const r = await accountApi.disable(id);
      return r.data;
    } catch (e) {
      handleError(e, "Vô hiệu hóa tài khoản thất bại");
    }
  },

  async getCurrentUser(): Promise<AccountResponse> {
    try {
      const r = await accountApi.getMe();
      return r.data;
    } catch (e) {
      handleError(e, "Không thể tải thông tin tài khoản");
    }
  },

  async updateCurrentUser(
    payload: AccountUpdateRequest,
  ): Promise<AccountResponse> {
    try {
      const r = await accountApi.updateMe(payload);
      return r.data;
    } catch (e) {
      handleError(e, "Cập nhật thông tin thất bại");
    }
  },

  async changePassword(payload: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> {
    try {
      await accountApi.changePassword(payload);
    } catch (e) {
      handleError(e, "Đổi mật khẩu thất bại");
    }
  },

  async getMyOrders(): Promise<OrderBasicResponse[]> {
    try {
      const r = await accountApi.getMyOrders();
      return r.data;
    } catch (e) {
      handleError(e, "Không thể tải lịch sử đơn hàng");
    }
  },
};
