import type { PageResponse } from "../../api/BaseApi/baseApi";

export interface ColorResponse {
  code: string;
  name: string;
}
export type ColorResponsePageResponse = PageResponse<ColorResponse>;