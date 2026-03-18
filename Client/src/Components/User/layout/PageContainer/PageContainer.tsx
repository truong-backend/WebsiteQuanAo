// src/components/layout/PageContainer/PageContainer.tsx
import { Box, Container } from "@mui/material";
import type { ContainerProps } from "@mui/material";

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: ContainerProps["maxWidth"];
  py?: number;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, maxWidth = "lg", py = 4 }) => (
  <Box sx={{ py }}>
    <Container maxWidth={maxWidth}>
      {children}
    </Container>
  </Box>
);

export default PageContainer;