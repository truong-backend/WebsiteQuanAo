// src/api/CallApi/accountApi.ts
import { BaseApi } from "../BaseApi/baseApi";
import type { AccountResponse } from "../../type/account/AccountResponse";
import type { AccountCreateRequest } from "../../type/account/AccountCreateRequest";
import type { AccountUpdateRequest } from "../../type/account/AccountUpdateRequest.ts";

class AccountApi extends BaseApi<
  AccountResponse,
  AccountCreateRequest,
  AccountUpdateRequest
> {
  constructor() {
    super("accounts");
  }

  // search + filter by role
  searchAndFilter(
    page = 0,
    size = 10,
    search?: string,
    role?: string,
    sortBy = "email",
    sortDir: "asc" | "desc" = "asc"
  ) {
    return this.axiosInstance.get("", {
      params: { page, size, search, role, sortBy, sortDir },
    });
  }

  updateRole(id: string, role: string) {
    return this.axiosInstance.put(`/${id}/role`, { role });
  }
}

export const accountApi = new AccountApi();