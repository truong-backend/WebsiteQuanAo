import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Container, Typography, Paper, CircularProgress, Alert, Chip, Button } from "@mui/material";
import { OrderService } from "../../Service/OrderService";
import type { OrderResponse } from "../../type/Orders/OrderResponse";
import { OrderStatusLabels } from "../../type/Orders/OrderStatus";

const OrderStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    OrderService.getOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải thông tin đơn hàng"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><CircularProgress /></Box>;

  if (error || !order) return (
    <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="sm"><Alert severity="error">{error || "Không tìm thấy đơn hàng"}</Alert></Container>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" fontWeight="bold" gutterBottom>Trạng thái đơn hàng</Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Mã đơn hàng: <strong>{order.id}</strong></Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Thời gian đặt: {new Date(order.orderTime).toLocaleString("vi-VN")}
          </Typography>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Trạng thái hiện tại:</Typography>
            <Chip label={OrderStatusLabels[order.status]} color="primary" variant="outlined" />
          </Box>
          <Typography variant="subtitle2" gutterBottom>Thông tin giao hàng:</Typography>
          <Typography variant="body2">SĐT: {order.phoneNumber}<br />Địa chỉ: {order.address}</Typography>
          {order.note && <Typography variant="body2" sx={{ mt: 1 }}>Ghi chú: {order.note}</Typography>}
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button variant="outlined" component={Link} to={`/orders/${order.id}/invoice`}>Xem hóa đơn</Button>
            <Button variant="text" component={Link} to="/products">Tiếp tục mua sắm</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default OrderStatusPage;