'use client';

import React, { useState, useMemo } from 'react';
import { useFirePersonnelAuthStore } from '@/lib/stores/firePersonnelAuth';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  MapPin,
  Clock,
  Phone,
  Building2,
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

interface Emergency {
  id: string;
  type: string;
  location: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Dispatched' | 'En Route' | 'On Scene' | 'Completed' | 'Cancelled';
  reportedAt: string;
  callerName?: string;
  phoneNumber?: string;
  description?: string;
  station?: string;
}

// Mock data
const allEmergencies: Emergency[] = [
  {
    id: '1',
    type: 'Fire',
    location: 'Central Business District',
    priority: 'Critical',
    status: 'On Scene',
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    callerName: 'John Doe',
    phoneNumber: '+233241234567',
    description: 'Building fire with heavy smoke',
    station: 'Accra Central',
  },
  {
    id: '2',
    type: 'Medical',
    location: 'Residential Area',
    priority: 'High',
    status: 'Dispatched',
    reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    callerName: 'Jane Smith',
    phoneNumber: '+233241234568',
    description: 'Medical emergency',
    station: 'Accra Central',
  },
  {
    id: '3',
    type: 'Rescue',
    location: 'Highway',
    priority: 'High',
    status: 'En Route',
    reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    callerName: 'Mike Johnson',
    phoneNumber: '+233241234569',
    description: 'Vehicle accident',
    station: 'Accra Central',
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('completed')) return 'bg-green-100 text-green-800';
  if (statusLower.includes('on scene')) return 'bg-blue-100 text-blue-800';
  if (statusLower.includes('en route') || statusLower.includes('dispatched')) return 'bg-yellow-100 text-yellow-800';
  if (statusLower.includes('pending')) return 'bg-gray-100 text-gray-800';
  return 'bg-red-100 text-red-800';
};

const getPriorityColor = (priority: string) => {
  const priorityLower = priority.toLowerCase();
  if (priorityLower === 'critical') return 'bg-red-100 text-red-800';
  if (priorityLower === 'high') return 'bg-orange-100 text-orange-800';
  if (priorityLower === 'medium') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};

const EmergenciesPage: React.FC = () => {
  const { user } = useFirePersonnelAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'station'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const stationId = user?.stationId;

  const filteredEmergencies = useMemo(() => {
    let filtered = allEmergencies;

    // Filter by tab
    if (activeTab === 'station' && stationId) {
      filtered = filtered.filter(emergency => emergency.station === 'Accra Central');
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(emergency => emergency.status.toLowerCase() === filterStatus.toLowerCase());
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(emergency => emergency.priority.toLowerCase() === filterPriority.toLowerCase());
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(emergency =>
        emergency.type.toLowerCase().includes(searchLower) ||
        emergency.location.toLowerCase().includes(searchLower) ||
        emergency.callerName?.toLowerCase().includes(searchLower) ||
        emergency.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [activeTab, stationId, filterStatus, filterPriority, searchTerm]);

  const columns: ColumnDef<Emergency>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="font-medium">{row.original.type}</span>
        </div>
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
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(row.original.priority)}`}>
          {row.original.priority}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(row.original.status)}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'reportedAt',
      header: 'Reported At',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{formatDate(row.original.reportedAt)}</span>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredEmergencies,
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Emergencies</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all emergency calls</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          All Emergencies
        </button>
        <button
          onClick={() => setActiveTab('station')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'station'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Station Emergencies
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search emergencies..."
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
            <option value="pending">Pending</option>
            <option value="dispatched">Dispatched</option>
            <option value="en route">En Route</option>
            <option value="on scene">On Scene</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
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
                    No emergencies found
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

export default EmergenciesPage;



