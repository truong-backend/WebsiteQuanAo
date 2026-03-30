// src/types/common.types.ts
// Moved from: src/types/common/common.types.ts
import type React from 'react';

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

export interface SelectOption {
  value: string | number;
  label: string;
}

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
