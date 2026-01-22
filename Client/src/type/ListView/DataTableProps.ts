import type { Column } from "./Column";

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  rowKey?: (row: T) => string | number;

  onRowClick?: (row: T) => void;
}