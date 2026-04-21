import axios from "axios";
import { API_BASE } from "@shared/config";

export const apiClient = axios.create({
  baseURL: `${API_BASE}/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Token expiry helpers ──────────────────────────────────────────────────────

/** Decode JWT payload để đọc `exp` (không verify signature) */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
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

// ── Auto-logout timer ─────────────────────────────────────────────────────────

let _logoutTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleTokenExpiry(token: string) {
  if (_logoutTimer) clearTimeout(_logoutTimer);

  const expiry = getTokenExpiry(token);
  if (!expiry) return;

  const msUntilExpiry = expiry - Date.now();
  if (msUntilExpiry <= 0) {
    // Đã hết hạn — thử silent refresh ngay
    trySilentRefresh().catch(() => forceLogout());
    return;
  }

  // Kích hoạt silent refresh trước 60 giây khi token gần hết hạn
  const delay = Math.max(msUntilExpiry - 60_000, 0);
  _logoutTimer = setTimeout(() => {
    trySilentRefresh().catch(() => forceLogout());
  }, delay);
}

export function cancelTokenExpiry() {
  if (_logoutTimer) {
    clearTimeout(_logoutTimer);
    _logoutTimer = null;
  }
}

// ── Silent refresh ────────────────────────────────────────────────────────────

/** Đang refresh hay không — tránh gọi nhiều lần song song */
let _refreshPromise: Promise<void> | null = null;

export async function trySilentRefresh(): Promise<void> {
  // Nếu đang refresh thì chờ cái đó xong, không gọi thêm
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token");

    try {
      // Import dynamic để tránh circular dependency
      const { refreshTokenApi } = await import("@features/auth/api/authApi");
      const data = await refreshTokenApi(refreshToken);

      // Cập nhật store và localStorage
      const { useAuthStore } = await import("@features/auth/model/authStore");
      useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ── Request interceptor: gắn token + kiểm tra hết hạn client-side ────────────

apiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("access_token");
  if (!token) return config;

  const expiry = getTokenExpiry(token);

  // Nếu token hết hạn → thử refresh trước khi gửi request
  if (expiry && Date.now() >= expiry) {
    try {
      await trySilentRefresh();
    } catch {
      return Promise.reject(new axios.Cancel("Session expired"));
    }
  }

  // Lấy lại token mới nhất sau khi refresh
  const freshToken = localStorage.getItem("access_token");
  if (freshToken) config.headers.Authorization = `Bearer ${freshToken}`;
  return config;
});

// ── Response interceptor: xử lý 401 từ server (token bị revoke v.v.) ────────

/** Hàng đợi các request bị 401 trong lúc đang refresh */
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

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Đánh dấu request này đã retry, tránh vòng lặp vô hạn
    originalRequest._retry = true;

    if (_isRefreshing) {
      // Có refresh đang chạy → xếp hàng chờ
      return new Promise((resolve, reject) => {
        _queue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
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
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  },
);
