/** Khớp server enum PaymentType */
export const PaymentType = {
  CASH: "CASH",
  BANK_TRANSFER: "BANK_TRANSFER",
  MOMO: "MOMO",
  VNPAY: "VNPAY",
} as const;

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];
