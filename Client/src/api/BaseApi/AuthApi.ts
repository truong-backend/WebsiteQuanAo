// src/api/authApi.ts
import { BaseApi } from './baseApi';
import type  {LoginRequest}  from '../../type/authcation/LoginRequest';
import type { LoginResponse } from '../../type/authcation/LoginResponse';
import type { AccountResponse } from '../../type/authcation/AccountResponse';
import type { RegisterRequest } from '../../type/authcation/RegisterRequest';

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