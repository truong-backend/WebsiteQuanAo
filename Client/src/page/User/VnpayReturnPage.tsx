import { useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Paper, Typography, Button } from "@mui/material";

/**
 * Trang hiển thị kết quả thanh toán VNPAY.
 * Nhận params từ backend redirect: bankCode, amount, message, status, orderId, transactionNo
 * Hoặc từ VNPAY trực tiếp: vnp_ResponseCode, vnp_TxnRef
 */
const VnpayReturnPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  // Format từ backend redirect
  const bankCode = params.get("bankCode");
  const amount = params.get("amount");
  const message = params.get("message");
  const status = params.get("status");
  const orderId = params.get("orderId") ?? params.get("vnp_TxnRef");
  const transactionNo = params.get("transactionNo");
  // Fallback: format VNPAY gửi trực tiếp
  const responseCode = params.get("vnp_ResponseCode");

  const isSuccess = status === "success" || responseCode === "00";

  const formatAmount = (val: string | null) => {
    if (!val) return "";
    const num = parseInt(val, 10);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat("vi-VN").format(num / 100) + " VND";
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom color={isSuccess ? "success.main" : "error.main"}>
            {message ?? (isSuccess ? "Thanh toán VNPAY thành công" : "Thanh toán VNPAY thất bại hoặc bị hủy")}
          </Typography>
          {orderId && (
            <Typography sx={{ mb: 1 }}>
              Mã đơn hàng: <strong>{orderId}</strong>
            </Typography>
          )}
          {transactionNo && (
            <Typography sx={{ mb: 1 }}>
              Mã giao dịch: <strong>{transactionNo}</strong>
            </Typography>
          )}
          {bankCode && (
            <Typography sx={{ mb: 1 }}>
              Ngân hàng: <strong>{bankCode}</strong>
            </Typography>
          )}
          {amount && (
            <Typography sx={{ mb: 2 }}>
              Số tiền: <strong>{formatAmount(amount)}</strong>
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

