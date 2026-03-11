// src/components/layout/Footer/Footer.tsx
import { Box, Container, Typography, Divider } from "@mui/material";

const Footer: React.FC = () => (
  <Box component="footer" sx={{ mt: "auto", bgcolor: "grey.900", color: "grey.300", py: 4 }}>
    <Container maxWidth="lg">
      <Divider sx={{ borderColor: "grey.700", mb: 3 }} />
      <Typography variant="body2" align="center">
        © {new Date().getFullYear()} Shop. All rights reserved.
      </Typography>
    </Container>
  </Box>
);

export default Footer;