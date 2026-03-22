// modules/contact/contact.module.ts
import axios from "axios";
import { BaseApi } from "../../api/BaseApi/baseApi";
import type {
  ContactResponse,
  ContactCreateRequest,
  ContactStatusUpdateRequest,
  ContactReplyRequest,
} from "@/types";
import type { PageResponse } from "../../api/BaseApi/baseApi";

// ─── API ─────────────────────────────────────────────────────

class ContactApi extends BaseApi<ContactResponse, ContactCreateRequest, ContactStatusUpdateRequest> {
  constructor() {
    super("contacts");
  }

  getStats() {
    return this.axiosInstance.get<Record<string, number>>("/stats");
  }

  updateStatus(id: number, payload: ContactStatusUpdateRequest) {
    return this.axiosInstance.patch<ContactResponse>(`/${id}/status`, payload);
  }

  /** Gửi email phản hồi — POST /contacts/{id}/reply */
  sendReply(id: number, payload: ContactReplyRequest) {
    return this.axiosInstance.post<ContactResponse>(`/${id}/reply`, payload);
  }
}

const contactApi = new ContactApi();

// ─── Service ─────────────────────────────────────────────────

export const ContactService = {

  /** Gửi liên hệ mới (public). */
  async submit(payload: ContactCreateRequest): Promise<ContactResponse> {
    try {
      return await contactApi.create(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || "Gửi liên hệ thất bại");
      }
      throw new Error("Không thể kết nối server");
    }
  },

  /** Lấy danh sách liên hệ có phân trang (Admin). */
  async getContactsPaged(
    page = 0,
    size = 10,
    search?: string,
    status?: string,
    sortBy = "createdAt",
    sortDir: "asc" | "desc" = "desc",
  ): Promise<PageResponse<ContactResponse>> {
    try {
      return await contactApi.getAll<PageResponse<ContactResponse>>(
        page, size, search, sortBy, sortDir,
        status ? { status } : undefined,
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || "Không thể tải danh sách liên hệ");
      }
      throw new Error("Không thể kết nối server");
    }
  },

  /** Lấy chi tiết một liên hệ. Backend tự đổi UNREAD → READ. */
  async getById(id: number): Promise<ContactResponse> {
    return contactApi.getById(id);
  },

  /** Đổi trạng thái liên hệ (Admin). */
  async updateStatus(id: number, payload: ContactStatusUpdateRequest): Promise<ContactResponse> {
    try {
      const res = await contactApi.updateStatus(id, payload);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || "Cập nhật thất bại");
      }
      throw new Error("Không thể kết nối server");
    }
  },

  /**
   * Gửi email phản hồi tới người liên hệ (Admin).
   * Backend tự đổi trạng thái → REPLIED sau khi gửi thành công.
   */
  async sendReply(id: number, payload: ContactReplyRequest): Promise<ContactResponse> {
    try {
      const res = await contactApi.sendReply(id, payload);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || "Gửi email phản hồi thất bại");
      }
      throw new Error("Không thể kết nối server");
    }
  },

  /** Xóa liên hệ (Admin). */
  async deleteContact(id: number): Promise<void> {
    return contactApi.delete(id);
  },

  /** Thống kê số lượng theo trạng thái (Admin). */
  async getStats(): Promise<Record<string, number>> {
    const res = await contactApi.getStats();
    return res.data;
  },
};
