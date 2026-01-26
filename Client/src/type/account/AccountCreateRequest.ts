// src/type/account/AccountCreateRequest.ts
export interface AccountCreateRequest extends Record<string, unknown> {
  name: string;
  email: string;
  password: string;
  roles?: string; // optional, default USER
}
