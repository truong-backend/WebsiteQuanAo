import { BaseApi } from "../BaseApi/baseApi";
import type { SizesResponse } from "../../type/size/SizesResponse";
import type { SizeCreateRequest } from "../../type/size/SizeCreateRequest";
import type { SizeUpdateRequest } from "../../type/size/SizeUpdateRequest";

class SizeApi extends BaseApi<SizesResponse, SizeCreateRequest, SizeUpdateRequest> {
  constructor() {
    super("sizes");
  }
}

export const sizeApi = new SizeApi();
