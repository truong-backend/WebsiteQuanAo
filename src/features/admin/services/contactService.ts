// src/features/admin/services/contactService.ts
// Moved from: src/modules/contact/contact.module.ts (ContactService)
import axios from 'axios';
import { contactApi } from '../api/contactApi';
import type { PageResponse } from '@/services/baseApi';
import type {
  ContactResponse, ContactCreateRequest,
  ContactStatusUpdateRequest, ContactReplyRequest,
} from '../types/contact.types';

export const ContactService = {
  async submit(payload: ContactCreateRequest): Promise<ContactResponse> {
    try { return await contactApi.create(payload); }
    catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Gửi liên hệ thất bại');
      }
      throw new Error('Không thể kết nối server');
    }
  },

  async getContactsPaged(page = 0, size = 10, search?: string, status?: string, sortBy = 'createdAt', sortDir: 'asc' | 'desc' = 'desc'): Promise<PageResponse<ContactResponse>> {
    try {
      return await contactApi.getAll<PageResponse<ContactResponse>>(
        page, size, search, sortBy, sortDir, status ? { status } : undefined,
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Không thể tải danh sách liên hệ');
      }
      throw new Error('Không thể kết nối server');
    }
  },

  async getById(id: number): Promise<ContactResponse> {
    return contactApi.getById(id);
  },

  async updateStatus(id: number, payload: ContactStatusUpdateRequest): Promise<ContactResponse> {
    try { const res = await contactApi.updateStatus(id, payload); return res.data; }
    catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Cập nhật thất bại');
      }
      throw new Error('Không thể kết nối server');
    }
  },

  async sendReply(id: number, payload: ContactReplyRequest): Promise<ContactResponse> {
    try { const res = await contactApi.sendReply(id, payload); return res.data; }
    catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Gửi email phản hồi thất bại');
      }
      throw new Error('Không thể kết nối server');
    }
  },

  async deleteContact(id: number): Promise<void> {
    return contactApi.delete(id);
  },

  async getStats(): Promise<Record<string, number>> {
    const res = await contactApi.getStats();
    return res.data;
  },
};
