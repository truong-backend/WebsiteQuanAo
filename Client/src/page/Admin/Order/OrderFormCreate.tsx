import { useEffect, useState } from "react";
import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { OrderService } from "../../../Service/OrderService";
import type { OrderCreateRequest } from "../../../type/Orders/OrderCreateRequest";
import { OrderStatus, OrderStatusLabels } from "../../../type/Orders/OrderStatus";

// Import services to fetch accounts and payments for dropdowns
import { AccountService } from "../../../Service/AccountService";
import { PaymentService } from "../../../Service/PaymentService";

interface OrderFormCreateProps {
  onSuccess?: () => void;
}

function OrderFormCreate({ onSuccess }: OrderFormCreateProps) {
  const [accounts, setAccounts] = useState<Array<{ value: number; label: string }>>([]);
  const [payments, setPayments] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dropdown options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);

        // Fetch accounts and payments (if these services exist)
        // If not, you can remove these and make the fields text inputs
        const [accountsData, paymentsData] = await Promise.all([
          AccountService.getAccountsPaged(0, 100).catch(() => ({ content: [] })),
          PaymentService.getPaymentsPaged(0, 100).catch(() => ({ content: [] })),
        ]);

        setAccounts(
          accountsData.content.map((a: any) => ({
            value: a.id,
            label: a.username || a.email || `Account ${a.id}`,
          }))
        );

        setPayments(
          paymentsData.content.map((p: { id: string; type?: string }) => ({
            value: p.id,
            label: p.type ? `${p.type} - ${p.id}` : p.id,
          }))
        );
      } catch (err) {
        console.error("Error fetching options:", err);
        // Continue even if fetch fails - fields will be empty
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const orderStatusOptions = Object.values(OrderStatus).map((status) => ({
    value: status,
    label: OrderStatusLabels[status],
  }));

  const fields: FormField<OrderCreateRequest>[] = [
    {
      name: "id",
      label: "Mã đơn hàng (tùy chọn)",
      type: "text",
      placeholder: "Để trống để tự động tạo",
      required: false,
    },
    {
      name: "orderTime",
      label: "Thời gian đặt hàng",
      type: "datetime-local",
      required: true,
      defaultValue: new Date().toISOString().slice(0, 16), // Current datetime
    },
    {
      name: "phoneNumber",
      label: "Số điện thoại",
      type: "text",
      placeholder: "Nhập số điện thoại",
      required: true,
      maxLength: 12,
    },
    {
      name: "address",
      label: "Địa chỉ giao hàng",
      type: "textarea",
      placeholder: "Nhập địa chỉ đầy đủ",
      required: true,
      maxLength: 255,
    },
    {
      name: "note",
      label: "Ghi chú",
      type: "textarea",
      placeholder: "Ghi chú cho đơn hàng (tùy chọn)",
      required: false,
      maxLength: 255,
    },
    {
      name: "status",
      label: "Trạng thái",
      type: "select",
      options: orderStatusOptions,
      required: true,
      defaultValue: OrderStatus.PENDING,
    },
    {
      name: "accountId",
      label: "Khách hàng",
      type: accounts.length > 0 ? "select" : "number",
      options: accounts.length > 0 ? accounts : undefined,
      placeholder: accounts.length > 0 ? "Chọn khách hàng" : "Nhập ID khách hàng (tùy chọn)",
      required: false,
    },
    {
      name: "paymentId",
      label: "Phương thức thanh toán",
      type: payments.length > 0 ? "select" : "text",
      options: payments.length > 0 ? payments : undefined,
      placeholder: payments.length > 0 ? "Chọn phương thức thanh toán" : "Nhập ID thanh toán (tùy chọn)",
      required: false,
    },
  ];

  const handleSubmit = async (data: OrderCreateRequest) => {
    await OrderService.createOrder({
      id: data.id || undefined,
      orderTime: data.orderTime,
      phoneNumber: data.phoneNumber,
      address: data.address,
      note: data.note || undefined,
      status: data.status,
      accountId: data.accountId || undefined,
      paymentId: data.paymentId || undefined,
    });
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <DynamicForm<OrderCreateRequest>
      fields={fields}
      mode="create"
      onSubmit={handleSubmit}
      successMessage="Tạo đơn hàng thành công"
      onSuccess={onSuccess}
    />
  );
}

export default OrderFormCreate;