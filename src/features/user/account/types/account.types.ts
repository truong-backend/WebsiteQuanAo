// src/features/account/types/account.types.ts
// Moved from: src/types/account/account.types.ts
import type { PageResponse } from '@/services/baseApi';

export interface AccountResponse {
  id: string;
  name: string;
  email: string;
  roles: string;
  enabled: boolean;
}

export type AccountResponsePageResponse = PageResponse<AccountResponse>;

export interface AccountCreateRequest extends Record<string, unknown> {
  name: string;
  email: string;
  password: string;
  roles?: string;
}

export interface AccountUpdateRequest extends Record<string, unknown> {
  name: string;
  email: string;
  roles?: string;
}