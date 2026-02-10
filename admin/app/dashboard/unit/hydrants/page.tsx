'use client';

import React, { useState, useMemo } from 'react';
import { 
  Droplets, 
  Search, 
  Filter, 
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';

interface Hydrant {
  id: string;
  number: string;
  location: string;
  type: 'Underground' | 'Above Ground' | 'Wall Mounted';
  status: 'Operational' | 'Under Maintenance' | 'Out of Service';
  waterPressure: string;
  lastInspection: string;
  nextInspection: string;
}

// Mock data
const allHydrants: Hydrant[] = [
  {
    id: '1',
    number: 'FH-ACC-001',
    location: 'Makola Road, Accra Central Market',
    type: 'Above Ground',
    status: 'Operational',
    waterPressure: '65 PSI',
    lastInspection: '2024-01-15',
    nextInspection: '2024-04-15',
  },
  {
    id: '2',
    number: 'FH-ACC-002',
    location: 'Kumasi Road, Near Residential Complex',
    type: 'Underground',
    status: 'Operational',
    waterPressure: '70 PSI',
    lastInspection: '2024-01-20',
    nextInspection: '2024-04-20',
  },
  {
    id: '3',
    number: 'FH-ACC-003',
    location: 'Independence Square, North Side',
    type: 'Wall Mounted',
    status: 'Under Maintenance',
    waterPressure: '60 PSI',
    lastInspection: '2024-01-10',
    nextInspection: '2024-04-10',
  },
];

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('operational')) return 'bg-green-100 text-green-800';
  if (statusLower.includes('maintenance')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getStatusIcon = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('operational')) return <CheckCircle className="w-4 h-4" />;
  if (statusLower.includes('maintenance')) return <AlertCircle className="w-4 h-4" />;
  return <XCircle className="w-4 h-4" />;
};

const HydrantsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const filteredHydrants = useMemo(() => {
    let filtered = allHydrants;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(hydrant => hydrant.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(hydrant =>
        hydrant.number.toLowerCase().includes(searchLower) ||
        hydrant.location.toLowerCase().includes(searchLower) ||
        hydrant.type.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [filterStatus, searchTerm]);

  const columns: ColumnDef<Hydrant>[] = [
    {
      accessorKey: 'number',
      header: 'Hydrant #',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.number}</span>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{row.original.location}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 w-fit ${getStatusColor(row.original.status)}`}>
          {getStatusIcon(row.original.status)}
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'waterPressure',
      header: 'Water Pressure',
      cell: ({ row }) => (
        <span>{row.original.waterPressure}</span>
      ),
    },
    {
      accessorKey: 'lastInspection',
      header: 'Last Inspection',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{row.original.lastInspection}</span>
        </div>
      ),
    },
    {
      accessorKey: 'nextInspection',
      header: 'Next Inspection',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{row.original.nextInspection}</span>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredHydrants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fire Hydrants</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all fire hydrants</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search hydrants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="operational">Operational</option>
            <option value="under maintenance">Under Maintenance</option>
            <option value="out of service">Out of Service</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No hydrants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HydrantsPage;



