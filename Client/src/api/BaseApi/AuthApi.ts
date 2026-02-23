// src/api/authApi.ts
import { BaseApi } from './baseApi';
import type  {LoginRequest}  from '../../type/auth/LoginRequest';
import type { LoginResponse } from '../../type/auth/LoginResponse';
import type { AccountResponse } from '../../type/auth/AccountResponse';
import type { RegisterRequest } from '../../type/auth/RegisterRequest';

class AuthApi extends BaseApi <LoginRequest, LoginResponse> {
  constructor() {
    super('auth');
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.customPost<LoginResponse>('/login', request);
  }

  async register(request: RegisterRequest): Promise<AccountResponse> {
    return this.customPost<AccountResponse>('/signup', request);
  }
}

export const authApi = new AuthApi();