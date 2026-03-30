// src/features/admin/services/colorService.ts
// Moved from: src/modules/color/color.module.ts (ColorService)
import axios from 'axios';
import { colorApi } from '../api/colorApi';
import type {
  ColorResponse, ColorResponsePageResponse,
  ColorCreateRequest, ColorUpdateRequest,
} from '../types/color.types';
import type { ErrorResponse, SelectOption } from '@/types/common.types';

function errMsg(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response) {
    return (error.response.data as ErrorResponse).message || fallback;
  }
  return 'Không thể kết nối đến server';
}

export const ColorService = {
  async getColorsPaged(page = 0, size = 10, search?: string, sortBy = 'code', sortDir: 'asc' | 'desc' = 'asc'): Promise<ColorResponsePageResponse> {
    try { return await colorApi.getAll(page, size, search, sortBy, sortDir); }
    catch (e) { throw new Error(errMsg(e, 'Không thể tải danh sách màu')); }
  },

  async createColor(payload: ColorCreateRequest): Promise<ColorResponse> {
    try { return await colorApi.create(payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = (e.response.data as ErrorResponse).message;
        if (e.response.status === 409) throw new Error(m || 'Màu đã tồn tại');
        if (e.response.status === 404) throw new Error(m || 'Không tìm thấy');
        throw new Error(m || 'Có lỗi xảy ra khi tạo màu');
      }
      throw new Error('Không thể kết nối đến server');
    }
  },

  async updateColor(id: string, payload: ColorUpdateRequest): Promise<ColorResponse> {
    try { return await colorApi.update(id, payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = (e.response.data as ErrorResponse).message;
        if (e.response.status === 404) throw new Error(m || 'Không tìm thấy màu');
        if (e.response.status === 409) throw new Error(m || 'Tên màu đã tồn tại');
        if (e.response.status === 400) throw new Error(m || 'Thao tác không hợp lệ');
        throw new Error(m || 'Có lỗi xảy ra khi cập nhật');
      }
      throw new Error('Không thể kết nối đến server');
    }
  },

  async getColorById(id: string): Promise<ColorResponse> {
    try { return await colorApi.getById(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 404) throw new Error('Không tìm thấy màu');
        throw new Error((e.response.data as ErrorResponse).message || 'Có lỗi xảy ra');
      }
      throw new Error('Không thể kết nối đến server');
    }
  },

  async deleteColor(id: string): Promise<void> {
    try { return await colorApi.delete(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 404) throw new Error('Màu không tồn tại hoặc đã bị xóa');
        if (e.response.status === 409) throw new Error('Không thể xóa màu đang được sử dụng.');
        throw new Error((e.response.data as ErrorResponse).message || 'Có lỗi xảy ra khi xóa');
      }
      throw new Error('Không thể kết nối đến server');
    }
  },

  async getColorSelectOptions(): Promise<SelectOption[]> {
    try {
      const data = await colorApi.getAllColorOptions();
      return data.map((item) => ({ value: item.colorCode, label: item.colorName }));
    } catch (e) { throw new Error(errMsg(e, 'Không thể lấy danh sách màu')); }
  },
};