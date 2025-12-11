import React, { useMemo, useCallback } from 'react';
import { List } from 'react-window';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface VirtualizedTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    width?: number;
    render?: (item: T, index: number) => React.ReactNode;
  }[];
  height?: number;
  itemHeight?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
}

interface RowProps<T> {
  index: number;
  style: React.CSSProperties;
  data: {
    items: T[];
    columns: VirtualizedTableProps<T>['columns'];
    onRowClick?: (item: T, index: number) => void;
  };
}

function VirtualizedRow<T>({ index, style, data }: RowProps<T>) {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    console.error('VirtualizedRow: Invalid data prop', data);
    return (
      <div style={style}>
        <TableRow>
          <TableCell colSpan={1} className="p-2 text-center text-muted-foreground">
            Invalid data structure
          </TableCell>
        </TableRow>
      </div>
    );
  }

  const { items, columns, onRowClick } = data;
  
  // Validate items and columns
  if (!Array.isArray(items) || !Array.isArray(columns)) {
    console.error('VirtualizedRow: Invalid items or columns', { items, columns });
    return (
      <div style={style}>
        <TableRow>
          <TableCell colSpan={1} className="p-2 text-center text-muted-foreground">
            Invalid data format
          </TableCell>
        </TableRow>
      </div>
    );
  }

  const item = items[index];

  // Handle undefined/null items gracefully
  if (!item) {
    return (
      <div style={style}>
        <TableRow>
          <TableCell colSpan={columns.length || 1} className="p-2 text-center text-muted-foreground">
            Invalid data
          </TableCell>
        </TableRow>
      </div>
    );
  }

  const handleClick = useCallback(() => {
    if (onRowClick && item) {
      onRowClick(item, index);
    }
  }, [item, index, onRowClick]);

  // Ensure columns is an array before mapping
  const validColumns = Array.isArray(columns) ? columns.filter(col => col && col.key) : [];

  return (
    <div style={style}>
      <TableRow 
        className="hover-elevate cursor-pointer" 
        onClick={handleClick}
        data-testid={`row-virtual-${index}`}
      >
        {validColumns.map((column) => {
          if (!column || !column.key) {
            return null;
          }
          return (
            <TableCell 
              key={column.key}
              style={{ width: column.width }}
              className="p-2"
            >
              {column.render ? column.render(item, index) : (item as any)?.[column.key] ?? ''}
            </TableCell>
          );
        })}
      </TableRow>
    </div>
  );
}

export function VirtualizedTable<T>({
  data,
  columns,
  height = 400,
  itemHeight = 50,
  className = '',
  onRowClick,
}: VirtualizedTableProps<T>) {
  // Ensure data is an array and filter out any null/undefined entries
  const safeData = useMemo(() => {
    if (!Array.isArray(data)) {
      console.warn('VirtualizedTable: data is not an array, returning empty array');
      return [];
    }
    return data.filter((item) => item != null);
  }, [data]);

  // Ensure columns is always an array
  const safeColumns = useMemo(() => {
    if (!Array.isArray(columns)) {
      console.warn('VirtualizedTable: columns is not an array, returning empty array');
      return [];
    }
    return columns.filter((col) => col != null && col.key);
  }, [columns]);

  const itemData = useMemo(() => {
    // Ensure itemData is always a valid object
    const data = {
      items: safeData,
      columns: safeColumns,
      onRowClick: onRowClick || undefined,
    };
    
    // Validate the structure before returning
    if (!Array.isArray(data.items) || !Array.isArray(data.columns)) {
      console.error('VirtualizedTable: Invalid itemData structure', data);
      return {
        items: [],
        columns: [],
        onRowClick: undefined,
      };
    }
    
    return data;
  }, [safeData, safeColumns, onRowClick]);

  // Don't render if no columns
  if (safeColumns.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center py-8 text-muted-foreground">
          No columns defined
        </div>
      </div>
    );
  }

  if (safeData.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <Table>
          <TableHeader>
            <TableRow>
              {safeColumns.map((column) => (
                <TableHead 
                  key={column.key}
                  style={{ width: column.width }}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        <div className="text-center py-8 text-muted-foreground">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {safeColumns.map((column) => (
              <TableHead 
                key={column.key}
                style={{ width: column.width }}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>
      <div style={{ height }}>
        {React.createElement(List as any, {
          height,
          width: "100%",
          itemCount: safeData.length,
          itemSize: itemHeight,
          itemData,
          overscanCount: 5,
          children: VirtualizedRow as any,
        })}
      </div>
    </div>
  );
}

export default VirtualizedTable;
