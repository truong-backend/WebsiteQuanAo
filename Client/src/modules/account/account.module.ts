// ─────────────────────────────────────────────────────────────
//  modules/account/account.module.ts
//  Chịu trách nhiệm: CRUD tài khoản, phân quyền role
// ─────────────────────────────────────────────────────────────
import axios from "axios";
import { BaseApi } from "../../api/BaseApi/baseApi";
import type {
  AccountResponse,
  AccountResponsePageResponse,
  AccountCreateRequest,
  AccountUpdateRequest,
  ErrorResponse,
} from "@/types";

// ─── API ─────────────────────────────────────────────────────
class AccountApi extends BaseApi<AccountResponse, AccountCreateRequest, AccountUpdateRequest> {
  constructor() {
    super("accounts");
  }

  searchAndFilter(
    page = 0, size = 10,
    search?: string, role?: string,
    sortBy = "email", sortDir: "asc" | "desc" = "asc",
  ) {
    return this.axiosInstance.get("", {
      params: { page, size, search, role, sortBy, sortDir },
    });
  }

  updateRole(id: string, role: string) {
    return this.axiosInstance.put(`/${id}/role`, { role });
  }
}

const accountApi = new AccountApi();

// ─── Service ─────────────────────────────────────────────────
export const AccountService = {
  async getAccountsPaged(
    page = 0, size = 10,
    search?: string, role?: string,
    sortBy = "email", sortDir: "asc" | "desc" = "asc",
  ): Promise<AccountResponsePageResponse> {
    try {
      const res = await accountApi.searchAndFilter(page, size, search, role, sortBy, sortDir);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ErrorResponse).message || "Không thể tải danh sách tài khoản");
      }
      throw new Error("Không thể kết nối server");
    }
  },

  async createAccount(payload: AccountCreateRequest) {
    try {
      return await accountApi.create(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ErrorResponse).message || "Tạo tài khoản thất bại");
      }
      throw new Error("Không thể kết nối server");
    }
  },

  async updateAccount(id: string, payload: AccountUpdateRequest) {
    return accountApi.update(id, payload);
  },

  async deleteAccount(id: string) {
    return accountApi.delete(id);
  },

  async updateRole(id: string, role: string) {
    return accountApi.updateRole(id, role);
  },

  async getById(id: string) {
    return accountApi.getById(id);
  },
};