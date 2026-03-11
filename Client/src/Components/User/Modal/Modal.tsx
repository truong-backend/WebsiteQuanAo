// src/components/common/Modal/Modal.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  children?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  onClose,
  onConfirm,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  children,
  maxWidth = "sm",
}) => (
  <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
    {title && (
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight="bold">{title}</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
    )}
    <DialogContent dividers>{children}</DialogContent>
    {onConfirm && (
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button variant="contained" onClick={onConfirm}>{confirmLabel}</Button>
      </DialogActions>
    )}
  </Dialog>
);

export default Modal;