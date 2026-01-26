// src/Service/AccountService.ts
import axios from "axios";
import { accountApi } from "../api/CallApi/AccoutApi";
import type { ErrorResponse } from "../type/common/ErrorResponse";
import type { AccountCreateRequest } from "../type/account/AccountCreateRequest";
import type { AccountUpdateRequest } from "../type/account/AccountUpdateRequest";
import type { AccountResponsePageResponse } from "../type/account/AccountResponse";

export const AccountService = {
  getAccountsPaged: async (
    page = 0,
    size = 10,
    search?: string,
    role?: string,
    sortBy = "email",
    sortDir: "asc" | "desc" = "asc"
  ): Promise<AccountResponsePageResponse> => {
    try {
      const res = await accountApi.searchAndFilter(
        page,
        size,
        search,
        role,
        sortBy,
        sortDir
      );
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          (error.response.data as ErrorResponse).message ||
            "Không thể tải danh sách tài khoản"
        );
      }
      throw new Error("Không thể kết nối server");
    }
  },

  createAccount: async (payload: AccountCreateRequest) => {
    try {
      return await accountApi.create(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          (error.response.data as ErrorResponse).message ||
            "Tạo tài khoản thất bại"
        );
      }
      throw new Error("Không thể kết nối server");
    }
  },

  updateAccount: async (id: string, payload: AccountUpdateRequest) => {
    return accountApi.update(id, payload);
  },

  deleteAccount: async (id: string) => {
    return accountApi.delete(id);
  },

  updateRole: async (id: string, role: string) => {
    return accountApi.updateRole(id, role);
  },

  getById: async (id: string) => {
    return accountApi.getById(id);
  },
};