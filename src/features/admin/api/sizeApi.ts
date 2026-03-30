// src/features/admin/api/sizeApi.ts
// Moved from: src/modules/size/size.module.ts (class SizeApi)
import { BaseApi } from '@/services/baseApi';
import type { SizesResponse, SizeCreateRequest, SizeUpdateRequest, SizeOption } from '../types/size.types';

class SizeApi extends BaseApi<SizesResponse, SizeCreateRequest, SizeUpdateRequest> {
  constructor() { super('sizes'); }
  getAllSizeOptions(): Promise<SizeOption[]> { return this.customGet<SizeOption[]>('/options'); }
}

export const sizeApi = new SizeApi();