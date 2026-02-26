import { BaseApi } from "../BaseApi/baseApi";
import type { PaymentCreateRequest } from "../../type/Payment/PaymentCreateRequest";
import type { PaymentUpdateRequest } from "../../type/Payment/PaymentUpdateRequest";
import type { PaymentResponse } from "../../type/Payment/PaymentResponse";

class PaymentApi extends BaseApi<
  PaymentResponse,
  PaymentCreateRequest,
  PaymentUpdateRequest
> {
  constructor() {
    super("payments");
  }
}

export const paymentApi = new PaymentApi();
