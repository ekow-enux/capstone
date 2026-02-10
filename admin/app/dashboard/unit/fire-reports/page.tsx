'use client';

import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Search, 
  Filter, 
  MapPin,
  Clock,
  FileText,
  Eye,
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

interface FireReport {
  id: string;
  title: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'Under Review' | 'Approved' | 'Rejected' | 'Closed';
  reportedAt: string;
  reportedBy?: string;
  description?: string;
}

// Mock data
const allFireReports: FireReport[] = [
  {
    id: '1',
    title: 'Building Fire - Commercial',
    location: 'Makola Market',
    severity: 'High',
    status: 'Under Review',
    reportedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    reportedBy: 'John Doe',
    description: 'Multi-story building fire',
  },
  {
    id: '2',
    title: 'Vehicle Fire',
    location: 'Highway',
    severity: 'Medium',
    status: 'Approved',
    reportedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    reportedBy: 'Jane Smith',
    description: 'Vehicle fire on highway',
  },
  {
    id: '3',
    title: 'Residential Fire',
    location: 'Residential Area',
    severity: 'Critical',
    status: 'Under Review',
    reportedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    reportedBy: 'Mike Johnson',
    description: 'House fire with injuries',
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
  if (statusLower.includes('approved')) return 'bg-green-100 text-green-800';
  if (statusLower.includes('under review')) return 'bg-yellow-100 text-yellow-800';
  if (statusLower.includes('rejected')) return 'bg-red-100 text-red-800';
  if (statusLower.includes('closed')) return 'bg-gray-100 text-gray-800';
  return 'bg-blue-100 text-blue-800';
};

const getSeverityColor = (severity: string) => {
  const severityLower = severity.toLowerCase();
  if (severityLower === 'critical') return 'bg-red-100 text-red-800';
  if (severityLower === 'high') return 'bg-orange-100 text-orange-800';
  if (severityLower === 'medium') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};

const FireReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const filteredReports = useMemo(() => {
    let filtered = allFireReports;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(report => report.severity.toLowerCase() === filterSeverity.toLowerCase());
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchLower) ||
        report.location.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [filterStatus, filterSeverity, searchTerm]);

  const columns: ColumnDef<FireReport>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-yellow-500" />
          <span className="font-medium">{row.original.title}</span>
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
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => (
        <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(row.original.severity)}`}>
          {row.original.severity}
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
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <button className="text-red-600 hover:text-red-700 flex items-center gap-1">
          <Eye className="w-4 h-4" />
          View
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredReports,
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fire Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all fire reports (24 hours)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reports..."
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
            <option value="draft">Draft</option>
            <option value="under review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Severity</option>
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
                    No fire reports found
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

export default FireReportsPage;



