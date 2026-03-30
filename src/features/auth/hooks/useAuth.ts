// src/features/auth/hooks/useAuth.ts
import { authService } from '../services/authService';

export function useAuth() {
  return {
    isAuthenticated: () => authService.isAuthenticated(),
    isAdmin:         () => authService.isAdmin(),
    isUser:          () => authService.isUser(),
    getRole:         () => authService.getRole(),
    getToken:        () => authService.getToken(),
    logout:          ()  => authService.logout(),
    login:           authService.login.bind(authService),
    register:        authService.register.bind(authService),
  };
}
