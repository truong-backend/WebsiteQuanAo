export interface User {
  email: string;
  password: string;
}

export interface FormState {
  email: string;
  password: string;
}

// Response từ API sau khi đăng nhập
export interface LoginResponse {
  user: UserInfo;
  token: string;
}

// Thông tin user trả về từ API
export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  // Thêm các field khác tùy API của bạn
}

// Response từ API sau khi đăng ký
export interface RegisterResponse {
  message: string;
  user?: UserInfo;
}