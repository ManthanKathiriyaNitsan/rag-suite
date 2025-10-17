import React, { useMemo, useCallback } from 'react';
import * as ReactWindow from 'react-window';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

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
  const { items, columns, onRowClick } = data;
  const item = items[index];

  const handleClick = useCallback(() => {
    if (onRowClick) {
      onRowClick(item, index);
    }
  }, [item, index, onRowClick]);

  return (
    <div style={style}>
      <TableRow 
        className="hover-elevate cursor-pointer" 
        onClick={handleClick}
        data-testid={`row-virtual-${index}`}
      >
        {columns.map((column) => (
          <TableCell 
            key={column.key}
            style={{ width: column.width }}
            className="p-2"
          >
            {column.render ? column.render(item, index) : (item as any)[column.key]}
          </TableCell>
        ))}
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
  const itemData = useMemo(() => ({
    items: data,
    columns,
    onRowClick,
  }), [data, columns, onRowClick]);

  return (
    <div className={`w-full ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
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
        <ReactWindow.FixedSizeList
          height={height}
          itemCount={data.length}
          itemSize={itemHeight}
          itemData={itemData}
          overscanCount={5}
        >
          {VirtualizedRow}
        </ReactWindow.FixedSizeList>
      </div>
    </div>
  );
}

export default VirtualizedTable;
