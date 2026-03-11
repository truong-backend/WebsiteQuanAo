// src/components/common/Button/AppButton.tsx
import { Button as MuiButton, CircularProgress } from "@mui/material";
import type { ButtonProps } from "@mui/material";

interface AppButtonProps extends ButtonProps {
  loading?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({ loading, disabled, children, ...props }) => (
  <MuiButton
    {...props}
    disabled={loading || disabled}
    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : props.startIcon}
  >
    {children}
  </MuiButton>
);

export default AppButton;