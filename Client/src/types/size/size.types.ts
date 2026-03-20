// ─────────────────────────────────────────────────────────────
//  types/size/size.types.ts
// ─────────────────────────────────────────────────────────────
import type { PageResponse } from "../../api/BaseApi/baseApi";

export interface SizesResponse {
  id: string;
  name: string;
}

export type SizeResponsePageResponse = PageResponse<SizesResponse>;

export interface SizeCreateRequest extends Record<string, unknown> {
  id: string;
  name: string;
}

export interface SizeUpdateRequest extends Record<string, unknown> {
  name: string;
}

export interface SizeOption {
  sizeId: string;
  sizeName: string;
}