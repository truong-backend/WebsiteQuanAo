import type { PaymentType } from "./PaymentType";

export interface PaymentCreateRequest {
  id?: string;
  type: PaymentType;
  payTime: string; // ISO string
}
