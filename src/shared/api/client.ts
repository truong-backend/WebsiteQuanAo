// Chỗ cần paste: thay toàn bộ file client.ts
import axios, { type InternalAxiosRequestConfig } from "axios";
import { API_BASE } from "@shared/config";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _retryCount?: number; // thêm mới — đếm số lần retry 409
  }
}

/**
 * apiClient — JWT + Silent Refresh + Queue Pattern + Optimistic Lock Retry
 */
export const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Token expiry helpers ──────────────────────────────────────────────────────

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function forceLogout() {
  cancelTokenExpiry();
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("auth-store");
  window.location.href = "/login";
}

// ── RefreshError ──────────────────────────────────────────────────────────────

class RefreshError extends Error {
  isExpired: boolean;
  constructor(message: string, isExpired: boolean) {
    super(message);
    this.name = "RefreshError";
    this.isExpired = isExpired;
  }
}

// ── Auto-logout timer ─────────────────────────────────────────────────────────

let _logoutTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleTokenExpiry(token: string) {
  if (_logoutTimer) clearTimeout(_logoutTimer);

  const expiry = getTokenExpiry(token);
  if (!expiry) return;

  const msUntilExpiry = expiry - Date.now();
  if (msUntilExpiry <= 0) {
    trySilentRefresh().catch((err: unknown) => {
      if (err instanceof RefreshError && err.isExpired) forceLogout();
    });
    return;
  }

  const delay = Math.max(msUntilExpiry - 60_000, 0);
  _logoutTimer = setTimeout(async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await trySilentRefresh();
        return;
      } catch (err: unknown) {
        if (err instanceof RefreshError && err.isExpired) break;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 3_000 * (attempt + 1)));
        }
      }
    }
    forceLogout();
  }, delay);
}

export function cancelTokenExpiry() {
  if (_logoutTimer) {
    clearTimeout(_logoutTimer);
    _logoutTimer = null;
  }
}

// ── Silent refresh ────────────────────────────────────────────────────────────

let _refreshPromise: Promise<void> | null = null;

export async function trySilentRefresh(): Promise<void> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new RefreshError("No refresh token", true);
    }

    try {
      const { refreshTokenApi } = await import("@features/auth/api/authApi");
      const data = await refreshTokenApi(refreshToken);

      const { useAuthStore } = await import("@features/auth/model/authStore");
      useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);
    } catch (err: unknown) {
      if (err instanceof RefreshError) throw err;

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          throw new RefreshError("REFRESH_TOKEN_EXPIRED", true);
        }
        throw new RefreshError(err.message, false);
      }

      throw new RefreshError("Unknown refresh error", false);
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ── Request interceptor ───────────────────────────────────────────────────────

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (!token) return config;

  const expiry = getTokenExpiry(token);

  if (expiry && Date.now() >= expiry) {
    try {
      await trySilentRefresh();
    } catch (err: unknown) {
      if (err instanceof RefreshError && err.isExpired) forceLogout();
      return Promise.reject(new axios.Cancel("Session expired"));
    }
  }

  const freshToken = localStorage.getItem("access_token");
  if (freshToken) config.headers.Authorization = `Bearer ${freshToken}`;
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────

type QueueItem = {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
};
let _queue: QueueItem[] = [];
let _isRefreshing = false;

function processQueue(error: unknown, token: string | null) {
  _queue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  _queue = [];
}

const MAX_CONFLICT_RETRIES = 3; // số lần retry tối đa khi 409

apiClient.interceptors.response.use(
  (res) => res,
  async (error: unknown) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // ── 409 Conflict — Optimistic Lock bị conflict, tự động retry ──
    if (error.response?.status === 409) {
      const retryCount = originalRequest._retryCount ?? 0;

      if (retryCount < MAX_CONFLICT_RETRIES) {
        originalRequest._retryCount = retryCount + 1;

        // Delay tăng dần: 300ms, 600ms, 900ms — tránh thundering herd
        const delay = 300 * (retryCount + 1);
        await new Promise((r) => setTimeout(r, delay));

        return apiClient(originalRequest);
      }

      // Hết số lần retry — báo lỗi rõ ràng cho user
      return Promise.reject(
        new Error("Dữ liệu đang được cập nhật bởi người khác, vui lòng thử lại sau"),
      );
    }

    // ── 401 — Silent refresh ─────────────────────────────────────────
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _queue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${String(token)}`;
        return apiClient(originalRequest);
      });
    }

    _isRefreshing = true;

    try {
      await trySilentRefresh();
      const newToken = localStorage.getItem("access_token");
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError: unknown) {
      processQueue(refreshError, null);
      if (refreshError instanceof RefreshError && refreshError.isExpired) {
        forceLogout();
      }
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  },
);