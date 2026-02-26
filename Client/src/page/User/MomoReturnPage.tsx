import { useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Paper, Typography, Button } from "@mui/material";

/**
 * Trang MoMo redirect sau khi thanh toán (redirectUrl).
 * MoMo trả về query: resultCode (0 = thành công), orderId, amount, message, ...
 */
const MomoReturnPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const resultCode = params.get("resultCode");
  const orderId = params.get("orderId");
  const message = params.get("message") || "";

  const isSuccess = resultCode === "0";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {isSuccess ? "Thanh toán MoMo thành công" : "Thanh toán MoMo thất bại hoặc bị hủy"}
          </Typography>
          {message && (
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              {message}
            </Typography>
          )}
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

export default MomoReturnPage;
