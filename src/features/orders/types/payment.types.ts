// src/features/orders/types/payment.types.ts
// Moved from: src/types/payment/payment.types.ts

export const PaymentType = {
  CASH:          'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  MOMO:          'MOMO',
  VNPAY:         'VNPAY',
} as const;

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

export interface PaymentResponse {
  id: string;
  type: PaymentType;
  payTime: string;
}

export interface PaymentCreateRequest {
  id?: string;
  type: PaymentType;
  payTime: string;
}

export interface PaymentUpdateRequest {
  type: PaymentType;
  payTime: string;
}
