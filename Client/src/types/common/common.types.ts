// ─────────────────────────────────────────────────────────────
//  types/common/common.types.ts
//  Các type dùng chung toàn app
// ─────────────────────────────────────────────────────────────
import type React from "react";

// ─── API Error ────────────────────────────────────────────────
export interface ErrorResponse {
  errorCode: string;
  message: string;
  status: number;
  timestamp: string;
  path: string;
  details?: {
    fieldName?: string;
    resourceName?: string;
    fieldValue?: string;
  };
}

// ─── Select / Dropdown ────────────────────────────────────────
export interface SelectOption {
  value: string | number;
  label: string;
}

// ─── DataTable ────────────────────────────────────────────────
export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  rowKey?: (row: T) => string | number;
  onRowClick?: (row: T) => void;
}