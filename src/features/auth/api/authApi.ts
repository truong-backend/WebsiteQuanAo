// src/features/auth/api/authApi.ts
// Moved from: src/api/BaseApi/AuthApi.ts
import { BaseApi } from "@/services/baseApi";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../types/auth.types";
import type { AccountResponse } from "@/features/user/account/types/account.types";

class AuthApi extends BaseApi<LoginRequest, LoginResponse> {
  constructor() {
    super("auth");
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.customPost<LoginResponse>("/login", request);
  }

  async register(request: RegisterRequest): Promise<AccountResponse> {
    return this.customPost<AccountResponse>("/signup", request);
  }
}

export const authApi = new AuthApi();
