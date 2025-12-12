import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
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
  // CRITICAL: Ensure data and its properties are valid before accessing
  // This prevents crashes in react-window's internal useMemoizedObject
  if (!data || 
      typeof data !== 'object' ||
      !data.items || 
      !Array.isArray(data.items) || 
      !data.columns || 
      !Array.isArray(data.columns)) {
    return null;
  }

  const { items, columns, onRowClick } = data;
  
  // Ensure index is valid
  if (index < 0 || index >= items.length) {
    return null;
  }
  
  const item = items[index];

  // Handle undefined/null items gracefully
  if (!item || item == null) {
    return null;
  }

  const handleClick = useCallback(() => {
    if (onRowClick && item) {
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
            {column.render ? column.render(item, index) : (item as any)?.[column.key] ?? ''}
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
    return columns.filter((col) => col != null);
  }, [columns]);

  // CRITICAL: Ensure itemData is ALWAYS a valid object with all required properties
  // react-window's useMemoizedObject will crash if any property is undefined
  const itemData = useMemo(() => {
    // Ensure we always have valid arrays
    const validItems = Array.isArray(safeData) ? safeData.filter(item => item != null && typeof item === 'object') : [];
    const validColumns = Array.isArray(safeColumns) ? safeColumns.filter(col => col != null && typeof col === 'object') : [];
    
    // Return a guaranteed valid object structure
    return {
      items: validItems,
      columns: validColumns,
      onRowClick: typeof onRowClick === "function" ? onRowClick : undefined,
    };
  }, [safeData, safeColumns, onRowClick]);

  // CRITICAL: Validate itemData structure before using it
  // This prevents react-window from receiving invalid data
  const isValidItemData = useMemo(() => {
    return itemData != null &&
           typeof itemData === 'object' &&
           !Array.isArray(itemData) &&
           Array.isArray(itemData.items) &&
           Array.isArray(itemData.columns) &&
           itemData.items.every((item: any) => item != null && typeof item === 'object') &&
           itemData.columns.every((col: any) => col != null && typeof col === 'object');
  }, [itemData]);

  if (safeData.length === 0 || !isValidItemData) {
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
        <div className="text-center py-8 text-muted-foreground">
          No data available
        </div>
      </div>
    );
  }

  // Create a stable key that changes when data actually changes
  // This forces react-window to remount when data changes, preventing undefined errors
  const listKey = useMemo(() => {
    if (safeData.length === 0) return 'empty';
    // Create a key from the first few item IDs to detect actual data changes
    const ids = safeData.slice(0, 5).map((item: any) => item?.id || '').join('-');
    return `list-${safeData.length}-${ids}`;
  }, [safeData]);

  // CRITICAL: Only render if itemData is completely valid
  const shouldRenderList =
    isValidItemData &&
    itemData.items.length > 0 &&
    itemData.columns.length > 0;

  // Use a ref to get the actual width of the container
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800); // Default width

  // Measure container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth || 800;
        setContainerWidth(width);
      }
    };
    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateWidth);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Ensure all props are valid numbers (not undefined/null)
  const validHeight = typeof height === 'number' && height > 0 ? height : 400;
  const validItemHeight = typeof itemHeight === 'number' && itemHeight > 0 ? itemHeight : 50;
  const validWidth = typeof containerWidth === 'number' && containerWidth > 0 ? containerWidth : 800;
  const validItemCount = typeof safeData.length === 'number' ? safeData.length : 0;

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
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
      <div style={{ height: validHeight }}>
        {shouldRenderList && isValidItemData && itemData != null ? (
          React.createElement(List, {
            key: listKey,
            height: validHeight,
            width: validWidth,
            itemCount: validItemCount,
            itemSize: validItemHeight,
            itemData: itemData,
            itemProps: itemData, // For newer/different versions of react-window
            overscanCount: 5,
            children: (({ index, style, data, itemProps }: any) => {
              // Handle both data (standard) and itemProps (custom/v2)
              const actualData = data || itemProps;
              
              // CRITICAL: Additional validation before rendering row
              if (!actualData || 
                  typeof actualData !== 'object' ||
                  !actualData.items || 
                  !Array.isArray(actualData.items) ||
                  !actualData.columns || 
                  !Array.isArray(actualData.columns) ||
                  index < 0 || 
                  index >= actualData.items.length) {
                return null;
              }
              
              const item = actualData.items[index];
              if (!item || typeof item !== 'object') {
                return null;
              }
              
              return React.createElement(VirtualizedRow, { index, style, data: actualData });
            }) as any,
          } as any)
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualizedTable;
