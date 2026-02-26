import { useEffect, useState } from "react";
import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { OrderService } from "../../../Service/OrderService";
import type { OrderUpdateRequest } from "../../../type/Orders/OrderUpdateRequest";
import { OrderStatus, OrderStatusLabels } from "../../../type/Orders/OrderStatus";

// Import services to fetch accounts and payments for dropdowns
import { AccountService } from "../../../Service/AccountService";
import { PaymentService } from "../../../Service/PaymentService";

interface OrderFormUpdateProps {
  id: string;
  onSuccess?: () => void;
}

function OrderFormUpdate({ id, onSuccess }: OrderFormUpdateProps) {
  const [initialData, setInitialData] = useState<OrderUpdateRequest | null>(null);
  const [accounts, setAccounts] = useState<Array<{ value: number; label: string }>>([]);
  const [payments, setPayments] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);

  const orderStatusOptions = Object.values(OrderStatus).map((status) => ({
    value: status,
    label: OrderStatusLabels[status],
  }));

  const fields: FormField<OrderUpdateRequest>[] = [
    {
      name: "orderTime",
      label: "Thời gian đặt hàng",
      type: "datetime-local",
      required: true,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch order data and dropdown options in parallel
        const [order, accountsData, paymentsData] = await Promise.all([
          OrderService.getOrderById(id),
          AccountService.getAccountsPaged(0, 100).catch(() => ({ content: [] })),
          PaymentService.getPaymentsPaged(0, 100).catch(() => ({ content: [] })),
        ]);

        if (!order) return;

        // Convert ISO datetime to datetime-local format
        const formattedOrderTime = order.orderTime
          ? new Date(order.orderTime).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        setInitialData({
          orderTime: formattedOrderTime,
          phoneNumber: order.phoneNumber,
          address: order.address,
          note: order.note,
          status: order.status,
          accountId: order.accountId,
          paymentId: order.paymentId,
        });

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
        console.error("Error fetching data:", err);
        alert("Không thể tải dữ liệu đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (data: OrderUpdateRequest) => {
    await OrderService.updateOrder(id, data);
  };

  if (loading || !initialData) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <DynamicForm<OrderUpdateRequest>
      fields={fields}
      mode="update"
      initialData={initialData}
      onSubmit={handleSubmit}
      successMessage="Cập nhật đơn hàng thành công"
      onSuccess={onSuccess}
    />
  );
}

export default OrderFormUpdate;