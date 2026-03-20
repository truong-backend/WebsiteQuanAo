// ─────────────────────────────────────────────────────────────
//  types/color/color.types.ts
// ─────────────────────────────────────────────────────────────
import type { PageResponse } from "../../api/BaseApi/baseApi";

export interface ColorResponse {
  code: string;
  name: string;
}

export type ColorResponsePageResponse = PageResponse<ColorResponse>;

export interface ColorCreateRequest extends Record<string, unknown> {
  code: string;
  name: string;
}

export interface ColorUpdateRequest extends Record<string, unknown> {
  name: string;
}

export interface ColorOption {
  colorCode: string;
  colorName: string;
}