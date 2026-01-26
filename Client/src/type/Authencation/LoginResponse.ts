export interface LoginResponse {
  token: string;
  type: string; // Bearer
  user: {
    id: number;
    email: string;
    role: string;
  };
}
