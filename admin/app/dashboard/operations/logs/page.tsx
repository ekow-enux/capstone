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
  Activity,
  FolderTree
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
import { useAuthStore } from '@/lib/stores/auth';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  unit: string;
  group: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'warning';
  details: string;
}

// Mock department mapping
const getDepartmentName = (departmentId?: string): string => {
  const departments: Record<string, string> = {
    'dept-1': 'Fire Suppression',
    'dept-2': 'Emergency Medical Services',
    'dept-3': 'Rescue Operations',
    'dept-4': 'Prevention & Safety',
    'dept-5': 'Training & Development',
  };
  return departments[departmentId || ''] || 'Operations';
};

const OperationsLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const user = useAuthStore((state) => state.user);
  
  const userDepartmentName = getDepartmentName(user?.departmentId);

  // Mock logs data - would be filtered by department units/groups in production
  const allLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2024-02-15 14:30:25',
      user: 'james.osei@gnfs.gov.gh',
      action: 'PERSONNEL_ASSIGNMENT',
      resource: 'Fire Personnel',
      unit: 'Unit A',
      group: 'Group 1',
      ipAddress: '192.168.1.100',
      status: 'success',
      details: 'Assigned personnel to incident #12345'
    },
    {
      id: '2',
      timestamp: '2024-02-15 14:25:10',
      user: 'kofi.mensah@gnfs.gov.gh',
      action: 'INCIDENT_UPDATE',
      resource: 'Incident Reports',
      unit: 'Unit A',
      group: 'Group 2',
      ipAddress: '192.168.1.101',
      status: 'success',
      details: 'Updated incident report #12345 status'
    },
    {
      id: '3',
      timestamp: '2024-02-15 14:20:45',
      user: 'yaw.boateng@gnfs.gov.gh',
      action: 'EQUIPMENT_CHECKOUT',
      resource: 'Equipment Tracking',
      unit: 'Unit B',
      group: 'Group 3',
      ipAddress: '192.168.1.102',
      status: 'success',
      details: 'Checked out Fire Truck A1 for incident'
    },
    {
      id: '4',
      timestamp: '2024-02-15 14:15:30',
      user: 'kwame.asante@gnfs.gov.gh',
      action: 'TURNOUT_SLIP_CREATE',
      resource: 'Turnout Slips',
      unit: 'Unit C',
      group: 'Group 4',
      ipAddress: '192.168.1.103',
      status: 'success',
      details: 'Created turnout slip for Unit C'
    },
    {
      id: '5',
      timestamp: '2024-02-15 14:10:15',
      user: 'ama.darko@gnfs.gov.gh',
      action: 'UNIT_UPDATE',
      resource: 'Department Management',
      unit: 'Unit A',
      group: 'Group 1',
      ipAddress: '192.168.1.104',
      status: 'success',
      details: 'Updated unit details for Unit A'
    },
    {
      id: '6',
      timestamp: '2024-02-15 14:05:00',
      user: 'unknown@external.com',
      action: 'LOGIN',
      resource: 'Authentication System',
      unit: 'Unit A',
      group: 'Group 1',
      ipAddress: '203.45.67.89',
      status: 'failed',
      details: 'Failed login attempt - invalid credentials'
    }
  ];

  // Mock units and groups for the department
  const departmentUnits = ['Unit A', 'Unit B', 'Unit C'];
  const departmentGroups = ['Group 1', 'Group 2', 'Group 3', 'Group 4', 'Group 5'];

  // Filter logs by department units and groups - operations account only sees their department logs
  const logs = useMemo(() => {
    return allLogs.filter(log => 
      departmentUnits.includes(log.unit) || departmentGroups.includes(log.group)
    );
  }, [departmentUnits, departmentGroups]);

  const columns: ColumnDef<AuditLog>[] = useMemo(
    () => [
      {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">{getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'user',
        header: 'User',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ getValue }) => (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'group',
        header: 'Group',
        cell: ({ getValue }) => (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const statusConfig = {
            success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
            failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
            warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' }
          };
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.success;
          const Icon = config.icon;
          return (
            <span className={`flex items-center gap-2 px-3 py-1 ${config.bg} ${config.color} text-xs font-semibold rounded-full`}>
              <Icon className="w-3 h-3" />
              {status.toUpperCase()}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <button
            onClick={() => {
              setSelectedLog(row.original);
              setShowModal(true);
            }}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: logs,
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

  const filteredData = useMemo(() => {
    if (!searchTerm) return logs;
    return logs.filter(
      log =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, logs]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <Shield className="w-12 h-12 text-red-600" />
              Department Logs - {userDepartmentName}
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              View activity logs for units and groups in your department
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Activity Logs</h2>
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
              {filteredData.map((log, index) => (
                <tr key={log.id} className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}>
                  {table.getRowModel().rows[index]?.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No logs found</p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">Log Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Timestamp</label>
                    <p className="text-gray-900">{selectedLog.timestamp}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedLog.status === 'success' ? 'bg-green-100 text-green-800' :
                      selectedLog.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedLog.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">User</label>
                    <p className="text-gray-900">{selectedLog.user}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Action</label>
                    <p className="text-gray-900">{selectedLog.action}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Resource</label>
                    <p className="text-gray-900">{selectedLog.resource}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">IP Address</label>
                    <p className="text-gray-900 font-mono text-sm">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Unit</label>
                    <p className="text-gray-900">{selectedLog.unit}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Group</label>
                    <p className="text-gray-900">{selectedLog.group}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Details</label>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedLog.details}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsLogsPage;




