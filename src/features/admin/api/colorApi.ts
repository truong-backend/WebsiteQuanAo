// src/features/admin/api/colorApi.ts
// Moved from: src/modules/color/color.module.ts (class ColorApi)
import { BaseApi } from '@/services/baseApi';
import type { ColorResponse, ColorCreateRequest, ColorUpdateRequest, ColorOption } from '../types/color.types';

class ColorApi extends BaseApi<ColorResponse, ColorCreateRequest, ColorUpdateRequest> {
  constructor() { super('colors'); }
  getAllColorOptions(): Promise<ColorOption[]> { return this.customGet<ColorOption[]>('/options'); }
}

export const colorApi = new ColorApi();