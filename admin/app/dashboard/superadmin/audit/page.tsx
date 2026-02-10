'use client';

import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  Search, 
  Filter, 
  Download,
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Activity
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

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'warning';
  details: string;
}

const AuditLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const downloadCsv = (rows: AuditLog[], filename: string) => {
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'IP Address', 'Status', 'Details'];
    const csvLines = [
      headers.join(','),
      ...rows.map((row) =>
        [
          row.timestamp,
          row.user,
          row.action,
          row.resource,
          row.ipAddress,
          row.status,
          `"${row.details.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Mock data
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2024-02-15 14:30:25',
      user: 'john.doe@gnfs.gov.gh',
      action: 'LOGIN',
      resource: 'Authentication System',
      ipAddress: '192.168.1.100',
      status: 'success',
      details: 'User logged in successfully'
    },
    {
      id: '2',
      timestamp: '2024-02-15 14:25:10',
      user: 'jane.smith@gnfs.gov.gh',
      action: 'CREATE_USER',
      resource: 'User Management',
      ipAddress: '192.168.1.101',
      status: 'success',
      details: 'Created new user account for mike.johnson@gnfs.gov.gh'
    },
    {
      id: '3',
      timestamp: '2024-02-15 14:20:45',
      user: 'admin@gnfs.gov.gh',
      action: 'UPDATE_STATION',
      resource: 'Station Management',
      ipAddress: '192.168.1.102',
      status: 'success',
      details: 'Updated Tamale Central Fire Station details'
    },
    {
      id: '4',
      timestamp: '2024-02-15 14:15:30',
      user: 'unknown@external.com',
      action: 'LOGIN',
      resource: 'Authentication System',
      ipAddress: '203.45.67.89',
      status: 'failed',
      details: 'Failed login attempt - invalid credentials'
    },
    {
      id: '5',
      timestamp: '2024-02-15 14:10:15',
      user: 'sarah.wilson@gnfs.gov.gh',
      action: 'DELETE_USER',
      resource: 'User Management',
      ipAddress: '192.168.1.103',
      status: 'warning',
      details: 'Attempted to delete user account - insufficient permissions'
    },
    {
      id: '6',
      timestamp: '2024-02-15 14:05:00',
      user: 'david.brown@gnfs.gov.gh',
      action: 'EXPORT_DATA',
      resource: 'Analytics',
      ipAddress: '192.168.1.104',
      status: 'success',
      details: 'Exported monthly analytics report'
    },
    {
      id: '7',
      timestamp: '2024-02-15 14:00:30',
      user: 'lisa.anderson@gnfs.gov.gh',
      action: 'UPDATE_PERMISSIONS',
      resource: 'User Management',
      ipAddress: '192.168.1.105',
      status: 'success',
      details: 'Updated user permissions for operations team'
    },
    {
      id: '8',
      timestamp: '2024-02-15 13:55:20',
      user: 'robert.taylor@gnfs.gov.gh',
      action: 'SYSTEM_CONFIG',
      resource: 'System Configuration',
      ipAddress: '192.168.1.106',
      status: 'success',
      details: 'Updated system configuration settings'
    },
    {
      id: '9',
      timestamp: '2024-02-15 13:50:10',
      user: 'maria.garcia@gnfs.gov.gh',
      action: 'BACKUP_CREATE',
      resource: 'Backup System',
      ipAddress: '192.168.1.107',
      status: 'success',
      details: 'Created system backup - completed successfully'
    },
    {
      id: '10',
      timestamp: '2024-02-15 13:45:45',
      user: 'admin@gnfs.gov.gh',
      action: 'SECURITY_SCAN',
      resource: 'Security System',
      ipAddress: '192.168.1.108',
      status: 'warning',
      details: 'Security scan detected potential vulnerability'
    }
  ];

  // TanStack table columns
  const columns: ColumnDef<AuditLog>[] = useMemo(
    () => [
      {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: ({ getValue }) => (
          <div className="text-gray-600 font-mono text-sm">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'user',
        header: 'User',
        cell: ({ getValue }) => (
          <div className="font-semibold text-gray-900">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ getValue }) => (
          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'resource',
        header: 'Resource',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP Address',
        cell: ({ getValue }) => (
          <div className="text-gray-600 font-mono text-sm">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              status === 'success' ? 'bg-green-100 text-green-800' :
              status === 'failed' ? 'bg-red-100 text-red-800' :
              status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: 'details',
        header: 'Details',
        cell: ({ getValue }) => (
          <div className="text-gray-600 max-w-xs truncate">{getValue() as string}</div>
        ),
      },
    ],
    []
  );

  const filteredLogs = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.user.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.resource.toLowerCase().includes(searchLower) ||
        log.details.toLowerCase().includes(searchLower);
      const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      return matchesSearch && matchesStatus && matchesAction;
    });
  }, [auditLogs, searchTerm, filterStatus, filterAction]);

  const table = useReactTable({
    data: filteredLogs,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Calculate metrics (filtered)
  const successLogs = filteredLogs.filter(log => log.status === 'success').length;
  const failedLogs = filteredLogs.filter(log => log.status === 'failed').length;
  const warningLogs = filteredLogs.filter(log => log.status === 'warning').length;
  const totalLogs = filteredLogs.length || 1;

  const handleGenerateReport = () => {
    const rows = filteredLogs.length ? filteredLogs : auditLogs;
    if (!rows.length) {
      alert('No audit logs to include in the report.');
      return;
    }
    downloadCsv(rows, 'superadmin-audit-report.csv');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3">
              Audit Logs
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Monitor system activity and security events
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <Eye className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{totalLogs}</span>
              <p className="text-gray-500 text-sm">Total Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">{Math.round((successLogs/totalLogs)*100)}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Success</h3>
            <p className="text-3xl font-bold text-gray-900">{successLogs}</p>
            <p className="text-xs text-gray-500">successful events</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-600 font-semibold">{Math.round((failedLogs/totalLogs)*100)}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Failed</h3>
            <p className="text-3xl font-bold text-gray-900">{failedLogs}</p>
            <p className="text-xs text-gray-500">failed events</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-yellow-600 font-semibold">{Math.round((warningLogs/totalLogs)*100)}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Warnings</h3>
            <p className="text-3xl font-bold text-gray-900">{warningLogs}</p>
            <p className="text-xs text-gray-500">warning events</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-semibold">100%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Events</h3>
            <p className="text-3xl font-bold text-gray-900">{totalLogs}</p>
            <p className="text-xs text-gray-500">logged today</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="warning">Warning</option>
            </select>

            {/* Action Filter */}
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
            >
              <option value="all">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="CREATE_USER">Create User</option>
              <option value="UPDATE_STATION">Update Station</option>
              <option value="DELETE_USER">Delete User</option>
              <option value="EXPORT_DATA">Export Data</option>
            </select>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export Logs
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold">
              <Calendar className="w-5 h-5" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Eye className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Audit Trail</h2>
        </div>
        <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row, index) => (
                <tr key={row.id} className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;