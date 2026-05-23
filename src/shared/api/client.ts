import axios from "axios";
import { API_BASE } from "@shared/config";

/**
 * apiClient — JWT + Silent Refresh + Queue Pattern
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  LUỒNG (Thread) trong JavaScript:                                ║
 * ║  - JS là single-threaded (1 call stack, 1 event loop)           ║
 * ║  - Không có deadlock thực sự, nhưng có race condition           ║
 * ║  - Race condition: 2 request cùng 401 → cùng refresh → 2 token ║
 * ║                                                                  ║
 * ║  FIX race condition bằng Queue Pattern:                          ║
 * ║  - _isRefreshing: flag ngăn double refresh                      ║
 * ║  - _queue: hàng đợi (FIFO) các request đang chờ token mới      ║
 * ║  → Chỉ 1 refresh chạy, các request khác xếp hàng chờ           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  PROCESS vs THREAD:                                              ║
 * ║  - Browser tab = 1 Process riêng (memory isolated)             ║
 * ║  - JavaScript Engine chạy trong Process đó = 1 Thread chính    ║
 * ║  - Web Workers = threads phụ (không truy cập DOM)               ║
 * ║  - HTTP requests = async I/O, không block main thread           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  STACK vs HEAP trong JS:                                         ║
 * ║  - Primitive (string, number): STACK                            ║
 * ║  - Object/Array (_queue, _rateLimitBuckets): HEAP               ║
 * ║  - Closure trong interceptor giữ reference đến _queue (HEAP)   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
export const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Token expiry helpers ──────────────────────────────────────────────────────

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
    // accessToken đã hết hạn ngay lúc schedule → thử refresh ngay
    trySilentRefresh().catch((err) => {
      if (err?.isExpired) forceLogout();
      // lỗi mạng → không logout, để request interceptor / 401 handler xử lý
    });
    return;
  }

  // Refresh trước 60s khi token gần hết — tránh user bị gián đoạn
  const delay = Math.max(msUntilExpiry - 60_000, 0);
  _logoutTimer = setTimeout(async () => {
    // Retry tối đa 3 lần để tránh logout nhầm do lỗi mạng tạm thời
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await trySilentRefresh();
        return; // refresh thành công → dừng
      } catch (err: any) {
        if (err?.isExpired) break; // refreshToken thực sự hết hạn → không retry
        if (attempt < 2) {
          // back-off: 3s, 6s rồi mới bỏ cuộc
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

/**
 * _refreshPromise: Promise singleton — tránh double refresh
 * Nếu refresh đang chạy → return cùng 1 Promise, không tạo mới
 */
let _refreshPromise: Promise<void> | null = null;

export async function trySilentRefresh(): Promise<void> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      const e = new Error("No refresh token") as any;
      e.isExpired = true;
      throw e;
    }

    try {
      const { refreshTokenApi } = await import("@features/auth/api/authApi");
      const data = await refreshTokenApi(refreshToken);

      const { useAuthStore } = await import("@features/auth/model/authStore");
      useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        // refreshToken thực sự hết hạn / bị revoke → đánh dấu để caller biết logout
        const e = new Error("REFRESH_TOKEN_EXPIRED") as any;
        e.isExpired = true;
        throw e;
      }
      // Lỗi mạng / 5xx → throw thường, caller có thể retry
      throw err;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ── Request interceptor ───────────────────────────────────────────────────────

/**
 * PROACTIVE refresh: kiểm tra token hết hạn TRƯỚC khi gửi request
 * Nếu accessToken hết hạn → thử refresh trước, không gửi request cũ lên BE
 */
apiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("access_token");
  if (!token) return config;

  const expiry = getTokenExpiry(token);

  if (expiry && Date.now() >= expiry) {
    try {
      await trySilentRefresh();
    } catch (err: any) {
      if (err?.isExpired) {
        // refreshToken hết hạn thật → logout ngay
        forceLogout();
      }
      // lỗi mạng → cancel request này, không logout (user vẫn còn session)
      return Promise.reject(new axios.Cancel("Session expired"));
    }
  }

  const freshToken = localStorage.getItem("access_token");
  if (freshToken) config.headers.Authorization = `Bearer ${freshToken}`;
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────

/**
 * REACTIVE refresh: server trả 401 → thử refresh rồi retry request
 * Queue Pattern tránh race condition nhiều request 401 cùng lúc
 */
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

    originalRequest._retry = true;

    if (_isRefreshing) {
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
    } catch (refreshError: any) {
      processQueue(refreshError, null);
      // Chỉ logout khi refreshToken thực sự hết hạn (401/403 từ BE)
      // Lỗi mạng tạm thời không logout
      if (refreshError?.isExpired) {
        forceLogout();
      }
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  },
);