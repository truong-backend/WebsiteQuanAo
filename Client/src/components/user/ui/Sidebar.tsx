// src/components/user/ui/Sidebar.tsx
// Chịu trách nhiệm: Bộ lọc sidebar cho trang listing sản phẩm
//   - Tìm kiếm text, lọc danh mục, lọc khoảng giá
//   - Nút reset tất cả bộ lọc
import {
  Box, TextField, FormControl, InputLabel, Select,
  MenuItem, Button, InputAdornment, IconButton,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import type { SelectOption } from '@/types';

interface SidebarProps {
  searchInput:      string;
  onSearchChange:   (value: string) => void;
  categoryId:       number | undefined;
  onCategoryChange: (value: number | undefined) => void;
  categories:       SelectOption[];
  minPrice:         number;
  maxPrice:         number;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  onReset:          () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  searchInput, onSearchChange,
  categoryId, onCategoryChange,
  categories,
  minPrice, maxPrice,
  onMinPriceChange, onMaxPriceChange,
  onReset,
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button size="small" onClick={onReset} sx={{ textTransform: 'none', color: '#9ca3af' }}>
        Xóa tất cả
      </Button>
    </Box>

    <TextField
      fullWidth size="small" placeholder="Tìm sản phẩm..."
      value={searchInput}
      onChange={(e) => onSearchChange(e.target.value)}
      InputProps={{
        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
        endAdornment: searchInput && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onSearchChange('')}><ClearIcon fontSize="small" /></IconButton>
          </InputAdornment>
        ),
      }}
    />

    <FormControl fullWidth size="small">
      <InputLabel>Danh mục</InputLabel>
      <Select
        value={categoryId ?? ''}
        onChange={(e) => { const v = e.target.value as number | ''; onCategoryChange(v === '' ? undefined : v); }}
        label="Danh mục"
      >
        <MenuItem value="">-- Tất cả --</MenuItem>
        {categories.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
      </Select>
    </FormControl>

    <TextField fullWidth size="small" type="number" label="Giá tối thiểu (₫)"
      value={minPrice || ''}
      onChange={(e) => onMinPriceChange(Number(e.target.value))}
      InputProps={{ inputProps: { min: 0 } }}
    />
    <TextField fullWidth size="small" type="number" label="Giá tối đa (₫)"
      value={maxPrice || ''}
      onChange={(e) => onMaxPriceChange(Number(e.target.value))}
      InputProps={{ inputProps: { min: 0 } }}
    />
  </Box>
);

export default Sidebar;