// src/features/auth/types/auth.types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthAccountResponse {
  id: number;
  name: string;
  email: string;
  roles: string;
}
