// src/features/auth/services/authService.ts
// Moved from: src/modules/auth/auth.module.ts
import axios from "axios";
import { authApi } from "../api/authApi";
import type {
  LoginRequest, LoginResponse, RegisterRequest,
} from "../types/auth.types";
import type { ErrorResponse } from "@/types/common.types";

const TOKEN_KEY   = "token";
const EXPIRES_KEY = "expiresIn";

class AuthService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private saveToken(token: string, expiresIn: number): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_KEY, expiresIn.toString());
  }

  private clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  }

  private decodeToken(): Record<string, unknown> | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decoded);
    } catch { return null; }
  }

  isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload) return true;
    const exp = payload["exp"] as number | undefined;
    if (!exp) return false;
    return Date.now() / 1000 > exp;
  }

  isAuthenticated(): boolean {
    if (!this.getToken()) return false;
    if (this.isTokenExpired()) { this.clearToken(); return false; }
    return true;
  }

  getRole(): string | null {
    const payload = this.decodeToken();
    if (!payload) return null;
    const roles =
      (payload["roles"] as string[]) ||
      (payload["authorities"] as string[]) ||
      [];
    return roles[0] ?? null;
  }

  isAdmin(): boolean { return this.getRole() === "ROLE_ADMIN"; }
  isUser():  boolean { return this.getRole() === "ROLE_USER"; }

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await authApi.login(request);
      if (response.token) this.saveToken(response.token, response.expiresIn);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ErrorResponse).message || "Đăng nhập thất bại");
      }
      throw new Error("Không thể kết nối đến server");
    }
  }

  logout(): void { this.clearToken(); }

  async register(request: RegisterRequest): Promise<unknown> {
    try {
      return await authApi.register(request);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ErrorResponse).message || "Đăng ký thất bại");
      }
      throw new Error("Không thể kết nối đến server");
    }
  }
}

export const authService = new AuthService();
