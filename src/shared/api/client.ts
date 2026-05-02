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

/**
 * Decode JWT payload — không verify signature (không có secret key ở FE)
 * JWT: Header.Payload.Signature — mỗi phần Base64URL encoded
 * FE chỉ đọc exp để biết khi nào cần refresh, không trust nội dung
 */
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

/**
 * _logoutTimer: biến toàn cục trên HEAP (closure của module)
 * setTimeout chạy trên event loop — không block main thread
 * Tương tự Scheduled task trong BE (cron job) nhưng phía client
 */
let _logoutTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleTokenExpiry(token: string) {
  if (_logoutTimer) clearTimeout(_logoutTimer);

  const expiry = getTokenExpiry(token);
  if (!expiry) return;

  const msUntilExpiry = expiry - Date.now();
  if (msUntilExpiry <= 0) {
    trySilentRefresh().catch(() => forceLogout());
    return;
  }

  // Refresh trước 60s khi token gần hết — tránh user bị gián đoạn
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

/**
 * _refreshPromise: Promise singleton — tránh double refresh
 *
 * Singleton Pattern trong async context:
 * - Nếu refresh đang chạy → return cùng 1 Promise, không tạo mới
 * - Khi done → _refreshPromise = null (reset để lần sau dùng lại)
 *
 * Đây là cách handle race condition không cần mutex/lock
 * (JS không có mutex vì single-threaded, dùng Promise thay thế)
 */
let _refreshPromise: Promise<void> | null = null;

export async function trySilentRefresh(): Promise<void> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token");

    try {
      const { refreshTokenApi } = await import("@features/auth/api/authApi");
      const data = await refreshTokenApi(refreshToken);

      const { useAuthStore } = await import("@features/auth/model/authStore");
      useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);
    } finally {
      _refreshPromise = null; // Reset singleton sau khi done
    }
  })();

  return _refreshPromise;
}

// ── Request interceptor ───────────────────────────────────────────────────────

/**
 * Request interceptor: kiểm tra token hết hạn TRƯỚC khi gửi request
 * Đây là PROACTIVE refresh (khác với reactive 401 handler bên dưới)
 *
 * Luồng xử lý (FIFO — interceptors chạy theo thứ tự thêm vào):
 * Request → [request interceptor] → Server → [response interceptor] → Handler
 */
apiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("access_token");
  if (!token) return config;

  const expiry = getTokenExpiry(token);

  if (expiry && Date.now() >= expiry) {
    try {
      await trySilentRefresh();
    } catch {
      return Promise.reject(new axios.Cancel("Session expired"));
    }
  }

  const freshToken = localStorage.getItem("access_token");
  if (freshToken) config.headers.Authorization = `Bearer ${freshToken}`;
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────

/**
 * Queue cho requests 401 đang chờ refresh:
 * - FIFO Queue (Array as queue): push() = enqueue, forEach+splice = dequeue
 * - Khi refresh xong → processQueue() giải phóng tất cả request đang chờ
 *
 * Tương tự QUEUE trong CS: FIFO, vào trước ra trước
 * (khác STACK: LIFO — dùng cho call stack, undo history)
 */
type QueueItem = {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
};
let _queue: QueueItem[] = []; // HEAP allocation — Array of QueueItem objects
let _isRefreshing = false;

function processQueue(error: unknown, token: string | null) {
  // Duyệt queue và giải phóng tất cả promise đang chờ
  _queue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  _queue = []; // Clear queue sau khi xử lý
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true; // Đánh dấu tránh vòng lặp vô hạn

    if (_isRefreshing) {
      // Đang refresh → xếp vào queue, chờ token mới (FIFO)
      return new Promise((resolve, reject) => {
        _queue.push({ resolve, reject }); // enqueue
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    _isRefreshing = true;

    try {
      await trySilentRefresh();
      const newToken = localStorage.getItem("access_token");
      processQueue(null, newToken); // Giải phóng queue với token mới
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null); // Giải phóng queue với lỗi
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  },
);