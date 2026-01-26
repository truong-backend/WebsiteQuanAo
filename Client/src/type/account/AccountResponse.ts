// src/type/account/AccountResponse.ts
import type { PageResponse } from "../../api/BaseApi/baseApi";

export interface AccountResponse {
  id: string;
  name: string;
  email: string;
  roles: string;
}

export type AccountResponsePageResponse = PageResponse<AccountResponse>;
