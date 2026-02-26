import React, { useState, useMemo } from 'react';
import { Table, Button, Empty, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult, FilterValue } from 'antd/es/table/interface';

const { Search } = Input;

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  width?: number | string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: Array<{ text: string; value: string | number }>;
  searchable?: boolean;
}

export interface Action<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: (item: T) => boolean;
}

export interface DynamicListProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  loading?: boolean;
  pagination?: false | TablePaginationConfig;
  showGlobalSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (searchText: string) => void;
}

function DynamicList<T extends Record<string, unknown>>({
  data,
  columns,
  actions,
  keyExtractor,
  emptyMessage = 'Không có dữ liệu',
  loading = false,
  pagination = false,
  showGlobalSearch = false,
  searchPlaceholder = 'Tìm kiếm...',
  onSearch
}: DynamicListProps<T>) {
  const [searchText, setSearchText] = useState('');
  const [columnSearchTexts, setColumnSearchTexts] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    order: 'ascend' | 'descend' | null;
  }>({ key: '', order: null });

  const getButtonType = (variant?: string): 'primary' | 'default' | 'dashed' | 'link' | 'text' => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'danger':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getButtonDanger = (variant?: string): boolean => {
    return variant === 'danger';
  };

  // Global search filter
  const globalFilteredData = useMemo(() => {
    if (!searchText.trim()) return data;

    return data.filter((item) => {
      return columns.some((column) => {
        const value = item[column.key as keyof T];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchText.toLowerCase());
      });
    });
  }, [data, searchText, columns]);

  // Column-specific search filter
  const columnFilteredData = useMemo(() => {
    let filtered = globalFilteredData;

    Object.entries(columnSearchTexts).forEach(([key, searchValue]) => {
      if (searchValue.trim()) {
        filtered = filtered.filter((item) => {
          const value = item[key as keyof T];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchValue.toLowerCase());
        });
      }
    });

    return filtered;
  }, [globalFilteredData, columnSearchTexts]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.order) return columnFilteredData;

    const sorted = [...columnFilteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const aStr = String(aValue);
      const bStr = String(bValue);

      // Try numeric comparison first
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.order === 'ascend' ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      return sortConfig.order === 'ascend'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return sorted;
  }, [columnFilteredData, sortConfig]);

  const handleColumnSearch = (key: string, value: string) => {
    setColumnSearchTexts((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTableChange = (
    _pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => {
    // Handle single sorter
    if (!Array.isArray(sorter)) {
      if (sorter.columnKey) {
        setSortConfig({
          key: sorter.columnKey as string,
          order: sorter.order || null
        });
      }
    }
  };

  const getColumnSearchProps = (column: Column<T>) => {
    if (!column.searchable) return {};

    return {
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Tìm ${column.label}`}
            value={columnSearchTexts[column.key as string] || ''}
            onChange={(e) => handleColumnSearch(column.key as string, e.target.value)}
            onPressEnter={() => {}}
            style={{ marginBottom: 8, display: 'block' }}
            prefix={<SearchOutlined />}
          />
        </div>
      ),
      filterIcon: () => (
        <SearchOutlined
          style={{
            color: columnSearchTexts[column.key as string] ? '#1890ff' : undefined
          }}
        />
      )
    };
  };

  // Convert columns to Ant Design format
  const antColumns: ColumnsType<T> = columns.map((column) => ({
    title: column.label,
    dataIndex: column.key as string,
    key: column.key as string,
    width: column.width,
    sorter: column.sortable ? true : undefined,
    sortOrder:
      sortConfig.key === column.key && sortConfig.order ? sortConfig.order : null,
    filters: column.filterable && column.filterOptions ? column.filterOptions : undefined,
    onFilter: column.filterable && column.filterOptions
      ? (value, record) => {
          const recordValue = record[column.key as keyof T];
          return String(recordValue) === String(value);
        }
      : undefined,
    ...getColumnSearchProps(column),
    render: (text: unknown, record: T) => {
      if (column.render) {
        return column.render(record);
      }
      return text as React.ReactNode;
    }
  }));

  // Add actions column if actions are provided
  if (actions && actions.length > 0) {
    antColumns.push({
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: actions.length * 100,
      render: (_: unknown, record: T) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {actions.map((action, index) => (
            <Button
              key={index}
              type={getButtonType(action.variant)}
              danger={getButtonDanger(action.variant)}
              size="small"
              onClick={() => action.onClick(record)}
              disabled={action.disabled ? action.disabled(record) : false}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )
    });
  }

  const handleGlobalSearch = (value: string) => {
    setSearchText(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div>
      {showGlobalSearch && (
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder={searchPlaceholder}
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleGlobalSearch}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>
      )}

      <Table<T>
        columns={antColumns}
        dataSource={sortedData}
        rowKey={(record) => keyExtractor(record) as React.Key}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        locale={{
          emptyText: <Empty description={emptyMessage} />
        }}
        bordered
      />
    </div>
  );
}

export default DynamicList;