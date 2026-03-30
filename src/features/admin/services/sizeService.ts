// src/features/admin/services/sizeService.ts
// Moved from: src/modules/size/size.module.ts (SizeService)
import axios from 'axios';
import { sizeApi } from '../api/sizeApi';
import type {
  SizesResponse, SizeResponsePageResponse,
  SizeCreateRequest, SizeUpdateRequest,
} from '../types/size.types';
import type { ErrorResponse, SelectOption } from '@/types/common.types';

function errMsg(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response) {
    return (error.response.data as ErrorResponse).message || fallback;
  }
  return 'Không thể kết nối đến server';
}

export const SizeService = {
  async getSizesPaged(page = 0, size = 10, search?: string, sortBy = 'id', sortDir: 'asc' | 'desc' = 'asc'): Promise<SizeResponsePageResponse> {
    try { return await sizeApi.getAll(page, size, search, sortBy, sortDir); }
    catch (e) { throw new Error(errMsg(e, 'Không thể tải danh sách kích thước')); }
  },

  async createSize(payload: SizeCreateRequest): Promise<SizesResponse> {
    try { return await sizeApi.create(payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = (e.response.data as ErrorResponse).message;
        if (e.response.status === 409) throw new Error(m || 'Kích thước đã tồn tại');
        if (e.response.status === 404) throw new Error(m || 'Không tìm thấy');
        throw new Error(m || 'Có lỗi xảy ra khi tạo kích thước');
      }
      throw new Error('Không thể kết nối đến server');
    }
  },

  async updateSize(id: string, payload: SizeUpdateRequest): Promise<SizesResponse> {
    try { return await sizeApi.update(id, payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = (e.response.data as ErrorResponse).message;
        if (e.response.status === 404) throw new Error(m || 'Không tìm thấy kích thước');
        if (e.response.status === 409) throw new Error(m || 'Tên kích thước đã tồn tại');
        if (e.response.status === 400) throw new Error(m || 'Thao tác không hợp lệ');
        throw new Error(m || 'Có lỗi xảy ra khi cập nhật');
      }
      throw new Error('Không thể kết nối đến server');
    }
  },

  async getSizeById(id: string): Promise<SizesResponse> {
    try { return await sizeApi.getById(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 404) throw new Error('Không tìm thấy kích thước');
        throw new Error((e.response.data as ErrorResponse).message || 'Có lỗi xảy ra');
      }
      throw new Error('Không thể kết nối đến server');
    }
  },

  async deleteSize(id: string): Promise<void> {
    try { return await sizeApi.delete(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 404) throw new Error('Kích thước không tồn tại hoặc đã bị xóa');
        if (e.response.status === 409) throw new Error('Không thể xóa kích thước đang được sử dụng.');
        throw new Error((e.response.data as ErrorResponse).message || 'Có lỗi xảy ra khi xóa');
      }
      throw new Error('Không thể kết nối đến server');
    }
  },

  async getSizeSelectOptions(): Promise<SelectOption[]> {
    try {
      const data = await sizeApi.getAllSizeOptions();
      return data.map((item) => ({ value: item.sizeId, label: item.sizeName }));
    } catch (e) { throw new Error(errMsg(e, 'Không thể lấy danh sách kích thước')); }
  },
};
