'use client';

import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
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

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'Available' | 'In Use' | 'Under Maintenance' | 'Out of Service';
  lastMaintenance: string;
  nextMaintenance: string;
  location?: string;
}

// Mock data
const allEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Fire Truck A1',
    type: 'Pumper',
    status: 'Available',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-04-10',
    location: 'Station Garage',
  },
  {
    id: '2',
    name: 'Ladder Truck L1',
    type: 'Aerial',
    status: 'In Use',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-04-05',
    location: 'On Scene',
  },
  {
    id: '3',
    name: 'Rescue Vehicle R1',
    type: 'Rescue',
    status: 'Available',
    lastMaintenance: '2024-01-12',
    nextMaintenance: '2024-04-12',
    location: 'Station Garage',
  },
  {
    id: '4',
    name: 'Ambulance A1',
    type: 'Medical',
    status: 'Under Maintenance',
    lastMaintenance: '2024-01-08',
    nextMaintenance: '2024-04-08',
    location: 'Maintenance Bay',
  },
];

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('available')) return 'bg-green-100 text-green-800';
  if (statusLower.includes('in use')) return 'bg-blue-100 text-blue-800';
  if (statusLower.includes('maintenance')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getStatusIcon = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('available')) return <CheckCircle className="w-4 h-4" />;
  if (statusLower.includes('in use')) return <AlertCircle className="w-4 h-4" />;
  if (statusLower.includes('maintenance')) return <AlertCircle className="w-4 h-4" />;
  return <XCircle className="w-4 h-4" />;
};

const EquipmentPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const filteredEquipment = useMemo(() => {
    let filtered = allEquipment;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(equipment => equipment.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(equipment =>
        equipment.name.toLowerCase().includes(searchLower) ||
        equipment.type.toLowerCase().includes(searchLower) ||
        equipment.location?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [filterStatus, searchTerm]);

  const columns: ColumnDef<Equipment>[] = [
    {
      accessorKey: 'name',
      header: 'Equipment Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-orange-500" />
          <span className="font-medium">{row.original.name}</span>
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
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <span>{row.original.location || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'lastMaintenance',
      header: 'Last Maintenance',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{row.original.lastMaintenance}</span>
        </div>
      ),
    },
    {
      accessorKey: 'nextMaintenance',
      header: 'Next Maintenance',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{row.original.nextMaintenance}</span>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredEquipment,
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Equipment</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all equipment</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search equipment..."
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
            <option value="available">Available</option>
            <option value="in use">In Use</option>
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
                    No equipment found
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

export default EquipmentPage;



