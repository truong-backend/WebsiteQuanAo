// ─────────────────────────────────────────────────────────────
//  types/account/account.types.ts
// ─────────────────────────────────────────────────────────────
import type { PageResponse } from "../../api/BaseApi/baseApi";

export interface AccountResponse {
  id: string;
  name: string;
  email: string;
  roles: string;
}

export type AccountResponsePageResponse = PageResponse<AccountResponse>;

export interface AccountCreateRequest extends Record<string, unknown> {
  name: string;
  email: string;
  password: string;
  roles?: string; // optional, default USER
}

export interface AccountUpdateRequest extends Record<string, unknown> {
  name: string;
  email: string;
  roles?: string;
}