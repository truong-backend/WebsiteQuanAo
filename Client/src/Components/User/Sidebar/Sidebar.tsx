// src/components/layout/Sidebar/Sidebar.tsx
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import type { SelectOption } from "../../../type/common/select/SelectOption";

interface SidebarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  categoryId: number | undefined;
  onCategoryChange: (value: number | undefined) => void;
  categories: SelectOption[];
  minPrice: number;
  maxPrice: number;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  onReset: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  searchInput, onSearchChange,
  categoryId, onCategoryChange,
  categories,
  minPrice, maxPrice,
  onMinPriceChange, onMaxPriceChange,
  onReset,
}) => (
  <Paper elevation={2} sx={{ p: 3, position: "sticky", top: 80 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FilterListIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">Bộ lọc</Typography>
      </Box>
      <Button size="small" onClick={onReset} sx={{ textTransform: "none" }}>Xóa tất cả</Button>
    </Box>

    <TextField
      fullWidth size="small" placeholder="Tìm sản phẩm..."
      value={searchInput}
      onChange={(e) => onSearchChange(e.target.value)}
      sx={{ mb: 2 }}
      InputProps={{
        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
        endAdornment: searchInput && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onSearchChange("")}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />

    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>Danh mục</InputLabel>
      <Select
        value={categoryId ?? ""}
        onChange={(e) => {
          const v = e.target.value as number | "";
          onCategoryChange(v === "" ? undefined : v);
        }}
        label="Danh mục"
      >
        <MenuItem value="">-- Tất cả --</MenuItem>
        {categories.map((c) => (
          <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
        ))}
      </Select>
    </FormControl>

    <TextField
      fullWidth size="small" type="number" label="Giá tối thiểu (₫)"
      value={minPrice || ""}
      onChange={(e) => onMinPriceChange(Number(e.target.value))}
      sx={{ mb: 2 }}
      InputProps={{ inputProps: { min: 0 } }}
    />
    <TextField
      fullWidth size="small" type="number" label="Giá tối đa (₫)"
      value={maxPrice || ""}
      onChange={(e) => onMaxPriceChange(Number(e.target.value))}
      InputProps={{ inputProps: { min: 0 } }}
    />
  </Paper>
);

export default Sidebar;