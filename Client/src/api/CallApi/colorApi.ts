import { BaseApi } from "../BaseApi/baseApi";
import type { ColorCreateRequest } from "../../type/Color/ColorCreateRequest";
import type { ColorUpdateRequest } from "../../type/Color/ColorUpdateRequest";
import type { ColorResponse } from "../../type/Color/ColorResponse";
import type { ColorOption } from "../../type/Color/ColorOption";

class ColorApi extends BaseApi<ColorResponse, ColorCreateRequest, ColorUpdateRequest> {
  constructor() {
    super("colors");
  }
  // src/api/ColorApi.ts

async getAllColorOptions(): Promise<ColorOption[]> {
  return this.customGet<ColorOption[]>("/options");
}

}

export const colorApi = new ColorApi();