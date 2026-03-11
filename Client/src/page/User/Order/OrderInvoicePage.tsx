import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Button,
} from "@mui/material";
import { OrderService } from "../../../Service/OrderService";
import type { OrderResponse } from "../../../type/Orders/OrderResponse";
import { OrderStatusLabels } from "../../../type/Orders/OrderStatus";

const OrderInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    OrderService.getOrderById(id)
      .then(setOrder)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Không thể tải hóa đơn"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (error || !order)
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center" }}>
        <Container maxWidth="sm">
          <Alert severity="error">{error || "Không tìm thấy hóa đơn"}</Alert>
        </Container>
      </Box>
    );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Hóa đơn mua hàng
            </Typography>
            <Button variant="outlined" onClick={() => window.print()}>
              In hóa đơn
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" gutterBottom>
            Mã đơn hàng: <strong>{order.id}</strong>
          </Typography>
          <Typography variant="body2" gutterBottom>
            Thời gian đặt: {new Date(order.orderTime).toLocaleString("vi-VN")}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Trạng thái: {OrderStatusLabels[order.status]}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Thông tin khách hàng
          </Typography>
          <Typography variant="body2">
            SĐT: {order.phoneNumber}
            <br />
            Địa chỉ: {order.address}
          </Typography>
          {order.note && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Ghi chú
              </Typography>
              <Typography variant="body2">{order.note}</Typography>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default OrderInvoicePage;
