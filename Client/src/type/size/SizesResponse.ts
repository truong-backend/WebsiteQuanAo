import type { PageResponse } from "../../api/BaseApi/baseApi";

export interface SizesResponse {
  id: string;
  name: string;
}
export type SizeResponsePageResponse = PageResponse<SizesResponse>;