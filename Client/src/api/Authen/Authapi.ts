// src/api/authApi.ts
import { BaseApi } from '../BaseApi/baseApi';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../../type/common/ErrorResponse';

/**
 * Request DTOs - Khớp với backend Spring Boot
 */
export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterAccount {
  email: string;
  password: string;
  fullName?: string;
}

/**
 * Response DTOs - Khớp với backend Spring Boot
 */
export interface Account {
  id: string;
  email: string;
  fullName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

/**
 * JWT Payload structure
 */
interface JWTPayload {
  sub?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Custom Auth Error class để wrap ErrorResponse
 */
export class AuthError extends Error {
  errorCode?: string;
  status?: number;
  timestamp?: string;
  path?: string;
  details?: {
    fieldName?: string;
    resourceName?: string;
    fieldValue?: string;
  };

  constructor(errorResponse: ErrorResponse) {
    super(errorResponse.message);
    this.name = 'AuthError';
    this.errorCode = errorResponse.errorCode;
    this.status = errorResponse.status;
    this.timestamp = errorResponse.timestamp;
    this.path = errorResponse.path;
    this.details = errorResponse.details;
  }
}

/**
 * Auth API class extends BaseApi
 */
class AuthApi extends BaseApi<Account, RegisterAccount, AuthRequest> {
  
  constructor() {
    super('auth');
    this.setupResponseInterceptor();
  }

  /**
   * Setup response interceptor để tự động logout khi token hết hạn
   */
  private setupResponseInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ErrorResponse>) => {
        // Nếu là lỗi 401 và không phải từ endpoint login/signup
        if (error.response?.status === 401 && 
            !error.config?.url?.includes('/login') &&
            !error.config?.url?.includes('/signup')) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Xử lý lỗi từ API và convert sang AuthError
   * @param error - Error từ axios
   * @returns AuthError
   */
  private handleError(error: unknown): never {
    if (this.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      
      // Nếu có ErrorResponse từ backend
      if (axiosError.response?.data) {
        throw new AuthError(axiosError.response.data);
      }
      
      // Nếu không có response data, tạo ErrorResponse mặc định
      const defaultError: ErrorResponse = {
        errorCode: 'NETWORK_ERROR',
        message: axiosError.message || 'Network error occurred',
        status: axiosError.response?.status || 500,
        timestamp: new Date().toISOString(),
        path: axiosError.config?.url || ''
      };
      
      throw new AuthError(defaultError);
    }
    
    // Nếu là Error thông thường
    if (error instanceof Error) {
      const defaultError: ErrorResponse = {
        errorCode: 'UNKNOWN_ERROR',
        message: error.message,
        status: 500,
        timestamp: new Date().toISOString(),
        path: ''
      };
      throw new AuthError(defaultError);
    }
    
    // Trường hợp không xác định được error
    const unknownError: ErrorResponse = {
      errorCode: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      status: 500,
      timestamp: new Date().toISOString(),
      path: ''
    };
    throw new AuthError(unknownError);
  }

  /**
   * Type guard để kiểm tra AxiosError
   */
  private isAxiosError(error: unknown): error is AxiosError<ErrorResponse> {
    return (error as AxiosError).isAxiosError === true;
  }

  /**
   * Đăng ký tài khoản mới
   * POST /auth/signup
   * 
   * @param email - Email người dùng
   * @param password - Mật khẩu
   * @param fullName - Tên đầy đủ (tùy chọn)
   * @returns Account data
   * @throws AuthError
   */
  async signup(email: string, password: string, fullName?: string): Promise<Account> {
    try {
      const payload: RegisterAccount = { email, password, fullName };
      return await this.customPost<Account, RegisterAccount>('/signup', payload);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Đăng nhập
   * POST /auth/login
   * 
   * @param email - Email người dùng
   * @param password - Mật khẩu
   * @returns LoginResponse chứa token và thời gian hết hạn
   * @throws AuthError
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const payload: AuthRequest = { email, password };
      const response = await this.customPost<LoginResponse, AuthRequest>('/login', payload);
      this.saveAuthData(response);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Đăng xuất - Xóa dữ liệu auth và chuyển về trang login
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userEmail');
    
    // Chỉ redirect nếu đang ở client side
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Lấy token từ localStorage
   * Tự động logout nếu token đã hết hạn
   * 
   * @returns Token string hoặc null nếu không có/hết hạn
   */
  getToken(): string | null {
    const token = localStorage.getItem('token');
    
    if (token && this.isTokenExpired()) {
      this.logout();
      return null;
    }
    
    return token;
  }

  /**
   * Kiểm tra xem token đã hết hạn chưa
   * 
   * @returns true nếu token đã hết hạn
   */
  private isTokenExpired(): boolean {
    const expiryStr = localStorage.getItem('tokenExpiry');
    if (!expiryStr) return false;
    
    const expiryTime = parseInt(expiryStr, 10);
    return Date.now() >= expiryTime;
  }

  /**
   * Lấy email người dùng từ localStorage
   * 
   * @returns Email string hoặc null
   */
  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  /**
   * Kiểm tra xem người dùng đã đăng nhập chưa
   * 
   * @returns true nếu đã đăng nhập và token còn hạn
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  /**
   * Lưu dữ liệu auth vào localStorage
   * Bao gồm: token, thời gian hết hạn, và email từ JWT
   * 
   * @param response - LoginResponse từ API
   */
  private saveAuthData(response: LoginResponse): void {
    // Lưu token
    localStorage.setItem('token', response.token);
    
    // Tính toán và lưu thời gian hết hạn
    const expiryTime = Date.now() + response.expiresIn;
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    
    // Decode JWT để lấy email
    try {
      const payload = this.decodeJWT(response.token);
      if (payload.sub) {
        localStorage.setItem('userEmail', payload.sub);
      }
    } catch (error) {
      console.warn('Cannot decode JWT token:', error);
    }
  }

  /**
   * Decode JWT token để lấy payload
   * 
   * @param token - JWT token string
   * @returns JWTPayload object
   */
  private decodeJWT(token: string): JWTPayload {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        throw new Error('Invalid token format');
      }

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload) as JWTPayload;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return {};
    }
  }

  /**
   * Lấy thời gian còn lại của token (tính bằng giây)
   * 
   * @returns Số giây còn lại, hoặc 0 nếu đã hết hạn
   */
  getTokenTimeRemaining(): number {
    const expiryStr = localStorage.getItem('tokenExpiry');
    if (!expiryStr) return 0;
    
    const expiryTime = parseInt(expiryStr, 10);
    const remaining = expiryTime - Date.now();
    
    return Math.max(0, Math.floor(remaining / 1000));
  }

  /**
   * Refresh token (nếu backend hỗ trợ)
   * POST /auth/refresh
   * 
   * @returns LoginResponse mới
   * @throws AuthError
   */
  async refreshToken(): Promise<LoginResponse> {
    try {
      const response = await this.customPost<LoginResponse>('/refresh');
      this.saveAuthData(response);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Đổi mật khẩu
   * POST /auth/change-password
   * 
   * @param oldPassword - Mật khẩu cũ
   * @param newPassword - Mật khẩu mới
   * @throws AuthError
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await this.customPost('/change-password', { oldPassword, newPassword });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Quên mật khẩu - Gửi email reset
   * POST /auth/forgot-password
   * 
   * @param email - Email để nhận link reset
   * @throws AuthError
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      await this.customPost('/forgot-password', { email });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Reset mật khẩu với token
   * POST /auth/reset-password
   * 
   * @param token - Token từ email
   * @param newPassword - Mật khẩu mới
   * @throws AuthError
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await this.customPost('/reset-password', { token, newPassword });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const authApi = new AuthApi();