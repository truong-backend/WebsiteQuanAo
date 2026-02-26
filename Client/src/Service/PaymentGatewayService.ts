import axios from "axios";

const API_BASE = "http://localhost:8080";

/**
 * Service gọi các gateway thanh toán (VNPAY, MoMo, ...)
 */
export const PaymentGatewayService = {
  /**
   * Gọi backend tạo URL thanh toán VNPAY cho một đơn hàng.
   */
  async createVnpayPayment(orderId: string, amount: number): Promise<string> {
    const res = await axios.post<{ payUrl: string }>(
      `${API_BASE}/payments/vnpay/create`,
      { orderId, amount }
    );
    return res.data.payUrl;
  },

  /**
   * Gọi backend tạo URL thanh toán MoMo cho một đơn hàng.
   */
  async createMomoPayment(orderId: string, amount: number): Promise<string> {
    const res = await axios.post<{ payUrl: string }>(
      `${API_BASE}/payments/momo/create`,
      { orderId, amount }
    );
    return res.data.payUrl;
  },
};

