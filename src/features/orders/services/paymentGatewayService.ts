// src/features/orders/services/paymentGatewayService.ts
// Moved from: src/modules/payment/payment.module.ts (PaymentGatewayService)
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const PaymentGatewayService = {
  async createVnpayPayment(orderId: string, amount: number): Promise<string> {
    const res = await axios.post<{ payUrl: string }>(
      `${API_BASE}/payments/vnpay/create`,
      { orderId, amount },
    );
    return res.data.payUrl;
  },

  async createMomoPayment(orderId: string, amount: number): Promise<string> {
    const res = await axios.post<{ payUrl: string }>(
      `${API_BASE}/payments/momo/create`,
      { orderId, amount },
    );
    return res.data.payUrl;
  },
};
