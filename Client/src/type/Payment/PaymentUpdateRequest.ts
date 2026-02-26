import type { PaymentType } from "./PaymentType";

export interface PaymentUpdateRequest {
  type: PaymentType;
  payTime: string; // ISO string
}
