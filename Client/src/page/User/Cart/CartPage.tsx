// src/pages/Cart/CartPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Container, Typography, Paper, IconButton, Button,
  Divider, List, ListItem, ListItemAvatar, Avatar, ListItemText,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { CartService, type CartItem } from "../../../Service/CartService";
import Header from "../../../Components/User/Footer/Footer";
import Footer from "../../../Components/User/Footer/Footer";

const CartPage: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>(() => CartService.getCart());
  const navigate = useNavigate();

  const persist = (next: CartItem[]) => {
    setItems(next);
    CartService.setCart(next);
  };

  const handleChangeQty = (id: string, delta: number) => {
    persist(items.map((i) => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const handleRemove = (id: string) => persist(items.filter((i) => i.id !== id));

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "grey.50" }}>
      <Header />
      <Box component="main" sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" gutterBottom>Giỏ hàng</Typography>

          {items.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ mb: 2 }}>Giỏ hàng của bạn đang trống.</Typography>
              <Button variant="contained" component={Link} to="/products">Tiếp tục mua sắm</Button>
            </Paper>
          ) : (
            <Paper sx={{ p: 3 }}>
              <List>
                {items.map((item) => (
                  <ListItem
                    key={item.id}
                    secondaryAction={
                      <IconButton onClick={() => handleRemove(item.id)}><Delete /></IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={`http://localhost:8080${item.img}`}
                        alt={item.name}
                        sx={{ width: 64, height: 64, mr: 2 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.price.toLocaleString("vi-VN")}₫ x ${item.quantity}`}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton onClick={() => handleChangeQty(item.id, -1)}><Remove /></IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton onClick={() => handleChangeQty(item.id, 1)}><Add /></IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">Tổng cộng: {total.toLocaleString("vi-VN")}₫</Typography>
                <Button variant="contained" onClick={() => navigate("/checkout")}>Tiến hành thanh toán</Button>
              </Box>
            </Paper>
          )}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default CartPage;