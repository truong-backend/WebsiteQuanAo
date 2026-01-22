import { BaseApi } from "../BaseApi/baseApi";
import type { ColorCreateRequest } from "../../type/Color/ColorCreateRequest";
import type { ColorUpdateRequest } from "../../type/Color/ColorUpdateRequest";
import type { ColorResponse } from "../../type/Color/ColorResponse";

class ColorApi extends BaseApi<ColorResponse, ColorCreateRequest, ColorUpdateRequest> {
  constructor() {
    super("colors");
  }
}

export const colorApi = new ColorApi();