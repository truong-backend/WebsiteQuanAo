import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Paper, TextField, Button, Alert, Grid as MuiGrid, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { OrderService } from "../../Service/OrderService";
import { CartService } from "../../Service/CartService";
import { PaymentGatewayService } from "../../Service/PaymentGatewayService";

type PaymentMethod = "COD" | "VNPAY" | "MOMO";

const CheckoutPage: React.FC = () => {
  const [items] = useState(() => CartService.getCart());
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    try {
      setSubmitting(true);
      setError(null);

      const order = await OrderService.createOrderFromCart(items, {
        phoneNumber,
        address,
        note: note || undefined,
      });

      if (paymentMethod === "VNPAY") {
        const payUrl = await PaymentGatewayService.createVnpayPayment(order.id, total);
        CartService.clear();
        window.location.href = payUrl;
        return;
      }
      if (paymentMethod === "MOMO") {
        const payUrl = await PaymentGatewayService.createMomoPayment(order.id, total);
        CartService.clear();
        window.location.href = payUrl;
        return;
      }

      // Thanh toán COD: chỉ tạo đơn, clear giỏ và chuyển sang trang trạng thái đơn
      CartService.clear();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đơn hàng mới");
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 4 }}><Typography>Giỏ hàng đang trống, hãy chọn sản phẩm trước.</Typography></Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" gutterBottom>Thanh toán</Typography>
        <MuiGrid container spacing={3}>
          <MuiGrid item xs={12} md={7}>
            <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <TextField label="Số điện thoại" fullWidth required margin="normal" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              <TextField label="Địa chỉ giao hàng" fullWidth required margin="normal" value={address} onChange={(e) => setAddress(e.target.value)} />
              <TextField label="Ghi chú" fullWidth margin="normal" multiline rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
              <FormControl sx={{ mt: 2 }}>
                <FormLabel>Phương thức thanh toán</FormLabel>
                <RadioGroup
                  row
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <FormControlLabel value="COD" control={<Radio />} label="Thanh toán khi nhận hàng" />
                  <FormControlLabel value="VNPAY" control={<Radio />} label="VNPAY" />
                  <FormControlLabel value="MOMO" control={<Radio />} label="MoMo" />
                </RadioGroup>
              </FormControl>
              <Box sx={{ mt: 3, textAlign: "right" }}>
                <Button type="submit" variant="contained" disabled={submitting}>Xác nhận đặt hàng</Button>
              </Box>
            </Paper>
          </MuiGrid>
          <MuiGrid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Tóm tắt đơn hàng</Typography>
              {items.map((item) => (
                <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">{item.name} x {item.quantity}</Typography>
                  <Typography variant="body2">{(item.price * item.quantity).toLocaleString("vi-VN")}₫</Typography>
                </Box>
              ))}
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, pt: 1, borderTop: "1px solid #eee" }}>
                <Typography fontWeight="bold">Tổng cộng</Typography>
                <Typography fontWeight="bold">{total.toLocaleString("vi-VN")}₫</Typography>
              </Box>
            </Paper>
          </MuiGrid>
        </MuiGrid>
      </Container>
    </Box>
  );
};

export default CheckoutPage;