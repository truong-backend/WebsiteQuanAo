// src/pages/Home/HomePage.tsx
import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../../../Components/User/Header/Header";
import Footer from "../../../Components/User/Footer/Footer";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.50",
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center", py: 10 }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Chào mừng đến với Shop
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/products")}
          >
            Mua sắm ngay
          </Button>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default HomePage;