// src/services/authService.ts
import axios from "axios";
import { authApi } from "../api/BaseApi/AuthApi";
import type { LoginRequest } from "../type/authcation/LoginRequest";
import type { LoginResponse } from "../type/authcation/LoginResponse";
import type { ErrorResponse } from "../type/common/error/ErrorResponse";
import type { AccountResponse } from "../type/authcation/AccountResponse";
import type { RegisterRequest } from "../type/authcation/RegisterRequest";

class AuthService {
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await authApi.login(request);

      // Lưu token vào localStorage
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("expiresIn", response.expiresIn.toString());
      }

      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Đăng nhập thất bại");
      }
      throw new Error("Không thể kết nối đến server");
    }
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("expiresIn");
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async register(request: RegisterRequest): Promise<AccountResponse> {
    try {
      return await authApi.register(request);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Đăng ký thất bại");
      }
      throw new Error("Không thể kết nối đến server");
    }
  }
}

export const authService = new AuthService();
