'use client';

import React, { useState, useMemo } from 'react';
import { 
  ClipboardList,
  Search,
  Plus,
  Edit,
  Eye,
  Download,
  Calendar,
  Clock,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  X
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

interface TurnoutSlip {
  id: string;
  slipNumber: string;
  date: string;
  time: string;
  unit: string;
  group: string;
  incidentType: string;
  location: string;
  officerInCharge: string;
  personnelCount: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

const OperationsTurnoutSlipsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<TurnoutSlip | null>(null);
  const user = useAuthStore((state) => state.user);

  // Mock turnout slips data
  const [turnoutSlips, setTurnoutSlips] = useState<TurnoutSlip[]>([
    {
      id: '1',
      slipNumber: 'TS-2024-001',
      date: '2024-02-15',
      time: '14:30',
      unit: 'Unit A',
      group: 'Group 1',
      incidentType: 'Fire',
      location: 'Accra Central Market',
      officerInCharge: 'James Osei',
      personnelCount: 8,
      status: 'completed'
    },
    {
      id: '2',
      slipNumber: 'TS-2024-002',
      date: '2024-02-15',
      time: '16:45',
      unit: 'Unit B',
      group: 'Group 2',
      incidentType: 'Rescue',
      location: 'Ring Road',
      officerInCharge: 'Kofi Mensah',
      personnelCount: 6,
      status: 'in-progress'
    },
    {
      id: '3',
      slipNumber: 'TS-2024-003',
      date: '2024-02-16',
      time: '09:15',
      unit: 'Unit C',
      group: 'Group 3',
      incidentType: 'Medical Emergency',
      location: 'East Legon',
      officerInCharge: 'Yaw Boateng',
      personnelCount: 4,
      status: 'pending'
    }
  ]);

  const columns: ColumnDef<TurnoutSlip>[] = useMemo(
    () => [
      {
        accessorKey: 'slipNumber',
        header: 'Slip Number',
        cell: ({ getValue }) => (
          <div className="font-semibold text-gray-900">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'time',
        header: 'Time',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        cell: ({ getValue }) => (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            {getValue() as string}
          </span>
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
        accessorKey: 'incidentType',
        header: 'Incident Type',
        cell: ({ getValue }) => (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const statusConfig = {
            pending: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
            'in-progress': { color: 'text-blue-600', bg: 'bg-blue-100', icon: AlertCircle },
            completed: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
            cancelled: { color: 'text-red-600', bg: 'bg-red-100', icon: X }
          };
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
          const Icon = config.icon;
          return (
            <span className={`flex items-center gap-2 px-3 py-1 ${config.bg} ${config.color} text-xs font-semibold rounded-full`}>
              <Icon className="w-3 h-3" />
              {status.replace('-', ' ').toUpperCase()}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedSlip(row.original);
                setShowModal(true);
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: turnoutSlips,
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
    if (!searchTerm) return turnoutSlips;
    return turnoutSlips.filter(
      slip =>
        slip.slipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.incidentType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, turnoutSlips]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <ClipboardList className="w-12 h-12 text-red-600" />
              Turnout Slips
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage and track turnout slips for department units
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Slip
            </button>
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
                placeholder="Search turnout slips..."
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

      {/* Turnout Slips Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <ClipboardList className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Turnout Slips List</h2>
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
              {filteredData.map((slip, index) => (
                <tr key={slip.id} className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
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
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No turnout slips found</p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showModal && selectedSlip && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">Turnout Slip Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Slip Number</label>
                    <p className="text-gray-900 font-bold">{selectedSlip.slipNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                    <p className="text-gray-900">{selectedSlip.date}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
                    <p className="text-gray-900">{selectedSlip.time}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedSlip.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedSlip.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      selectedSlip.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedSlip.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Unit</label>
                    <p className="text-gray-900">{selectedSlip.unit}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Group</label>
                    <p className="text-gray-900">{selectedSlip.group}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Incident Type</label>
                    <p className="text-gray-900">{selectedSlip.incidentType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Personnel Count</label>
                    <p className="text-gray-900">{selectedSlip.personnelCount}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                    <p className="text-gray-900">{selectedSlip.location}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Officer in Charge</label>
                    <p className="text-gray-900">{selectedSlip.officerInCharge}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsTurnoutSlipsPage;




