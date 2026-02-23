import { BaseApi } from "../BaseApi/baseApi";
import type { SizesResponse } from "../../type/size/SizesResponse";
import type { SizeCreateRequest } from "../../type/size/SizeCreateRequest";
import type { SizeUpdateRequest } from "../../type/size/SizeUpdateRequest";
import type { SizeOption } from "../../type/size/SizeOption";

class SizeApi extends BaseApi<
  SizesResponse,
  SizeCreateRequest,
  SizeUpdateRequest
> {
  constructor() {
    super("sizes");
  }
  // src/api/SizeApi.ts

  async getAllSizeOptions(): Promise<SizeOption[]> {
    return this.customGet<SizeOption[]>("/options");
  }
}

export const sizeApi = new SizeApi();
