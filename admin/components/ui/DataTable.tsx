'use client';

import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  Table as TanStackTable,
  OnChangeFn,
} from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  searchMessage?: string;
  searchTerm?: string;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  headerClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  table?: TanStackTable<T>; // Allow passing pre-configured table
}

export default function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No data found',
  searchMessage,
  searchTerm = '',
  sorting = [],
  onSortingChange,
  columnFilters = [],
  onColumnFiltersChange,
  headerClassName = 'bg-gradient-to-r from-red-500 to-red-600',
  rowClassName,
  table: externalTable,
}: DataTableProps<T>) {
  const internalTable = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const table = externalTable || internalTable;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
        <p className="text-gray-600 text-lg">
          {searchTerm && searchMessage ? searchMessage : emptyMessage}
        </p>
      </div>
    );
  }

  const getRowClassName = (row: T, index: number): string => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row, index);
    }
    if (typeof rowClassName === 'string') {
      return rowClassName;
    }
    return `hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
    }`;
  };

  return (
    <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className={headerClassName}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-4 text-left text-sm font-black text-white uppercase tracking-wider cursor-pointer hover:bg-red-600"
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                >
                  <div className="flex items-center gap-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="text-white/70">
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? ' ↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row, index) => (
            <tr key={row.id} className={getRowClassName(row.original, index)}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

