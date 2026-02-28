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

  /**
   * Decode JWT payload (không cần verify signature ở client)
   * JWT gồm 3 phần: header.payload.signature (base64url)
   */
  private decodeToken(): Record<string, unknown> | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * Kiểm tra token đã hết hạn chưa dựa vào claim "exp" trong JWT payload
   * "exp" là Unix timestamp tính bằng giây
   */
  isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload) return true;

    const exp = payload["exp"] as number | undefined;
    if (!exp) return false; // Không có exp → coi như không hết hạn

    // Date.now() trả về milliseconds → chia 1000 để so với exp (seconds)
    return Date.now() / 1000 > exp;
  }

  /**
   * Đã đăng nhập VÀ token còn hiệu lực
   */
  isAuthenticated(): boolean {
    if (!this.getToken()) return false;

    if (this.isTokenExpired()) {
      // Token hết hạn → tự dọn localStorage
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Lấy role từ JWT payload
   * Spring Security lưu roles trong claim "roles" hoặc "authorities"
   */
  getRole(): string | null {
    const payload = this.decodeToken();
    if (!payload) return null;

    const roles =
      (payload["roles"] as string[]) ||
      (payload["authorities"] as string[]) ||
      [];

    if (roles.length === 0) return null;
    return roles[0]; // "ROLE_ADMIN" hoặc "ROLE_USER"
  }

  isAdmin(): boolean {
    return this.getRole() === "ROLE_ADMIN";
  }

  isUser(): boolean {
    return this.getRole() === "ROLE_USER";
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
