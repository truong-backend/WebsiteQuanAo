// src/components/layout/PageLayout/PageLayout.tsx
import { Box } from "@mui/material";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  bgcolor?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, bgcolor = "grey.50" }) => (
  <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor }}>
    <Header />
    <Box component="main" sx={{ flex: 1 }}>
      {children}
    </Box>
    <Footer />
  </Box>
);

export default PageLayout;