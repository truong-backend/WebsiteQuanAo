import type { PaymentType } from "./PaymentType";

export interface PaymentResponse {
  id: string;
  type: PaymentType;
  payTime: string; // ISO string
}
