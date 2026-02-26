import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Paper, Typography, Button } from "@mui/material";

const VnpayReturnPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const responseCode = params.get("vnp_ResponseCode");
  const orderId = params.get("vnp_TxnRef");

  const isSuccess = responseCode === "00";

  useEffect(() => {
    // Có thể gọi thêm API backend để confirm trạng thái đơn nếu cần
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {isSuccess ? "Thanh toán VNPAY thành công" : "Thanh toán VNPAY thất bại hoặc bị hủy"}
          </Typography>
          {orderId && (
            <Typography sx={{ mb: 2 }}>
              Mã đơn hàng: <strong>{orderId}</strong>
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (orderId) navigate(`/orders/${orderId}`);
              else navigate("/products");
            }}
          >
            {orderId ? "Xem trạng thái đơn hàng" : "Tiếp tục mua sắm"}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default VnpayReturnPage;

