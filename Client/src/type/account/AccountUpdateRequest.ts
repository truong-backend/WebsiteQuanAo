// src/type/account/AccountUpdateRequest.ts
export interface AccountUpdateRequest extends Record<string, unknown> {
  name: string;
  email: string;
  roles?: string;
}
