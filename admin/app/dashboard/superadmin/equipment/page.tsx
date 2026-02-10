'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Wrench,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
  Upload,
  TrendingUp,
  Users,
  Activity,
  Truck,
  Shield
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
  type: 'Fire Truck' | 'Ambulance' | 'Ladder Truck' | 'Rescue Vehicle' | 'Command Vehicle' | 'Other';
  serialNumber: string;
  station: string;
  status: 'Active' | 'Maintenance' | 'Out of Service' | 'Retired';
  lastInspection: string;
  nextInspection: string;
  assignedTo: string;
  location: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  mileage?: number;
  hours?: number;
  notes: string;
}

const EquipmentTrackingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Mock data
  const equipment: Equipment[] = [
    {
      id: '1',
      name: 'Fire Engine A1',
      type: 'Fire Truck',
      serialNumber: 'FE-2024-001',
      station: 'Accra Central',
      status: 'Active',
      lastInspection: '2024-02-01',
      nextInspection: '2024-03-01',
      assignedTo: 'Station Commander',
      location: 'Station Bay 1',
      condition: 'Excellent',
      mileage: 12500,
      hours: 2450,
      notes: 'Recently serviced, all systems operational'
    },
    {
      id: '2',
      name: 'Ladder Truck L1',
      type: 'Ladder Truck',
      serialNumber: 'LT-2024-002',
      station: 'Accra Central',
      status: 'Maintenance',
      lastInspection: '2024-01-15',
      nextInspection: '2024-02-15',
      assignedTo: 'Maintenance Team',
      location: 'Maintenance Bay',
      condition: 'Good',
      mileage: 8900,
      hours: 1890,
      notes: 'Hydraulic system repair in progress'
    },
    {
      id: '3',
      name: 'Ambulance AM1',
      type: 'Ambulance',
      serialNumber: 'AM-2024-003',
      station: 'Kumasi Central',
      status: 'Active',
      lastInspection: '2024-02-10',
      nextInspection: '2024-03-10',
      assignedTo: 'Medical Team',
      location: 'Station Bay 2',
      condition: 'Excellent',
      mileage: 15600,
      hours: 3200,
      notes: 'Fully equipped medical unit'
    },
    {
      id: '4',
      name: 'Rescue Vehicle R1',
      type: 'Rescue Vehicle',
      serialNumber: 'RV-2024-004',
      station: 'Tamale Central',
      status: 'Out of Service',
      lastInspection: '2024-01-20',
      nextInspection: '2024-02-20',
      assignedTo: 'Repair Team',
      location: 'External Repair Shop',
      condition: 'Poor',
      mileage: 22100,
      hours: 4500,
      notes: 'Major engine overhaul required'
    },
    {
      id: '5',
      name: 'Command Vehicle C1',
      type: 'Command Vehicle',
      serialNumber: 'CV-2024-005',
      station: 'Takoradi',
      status: 'Active',
      lastInspection: '2024-02-05',
      nextInspection: '2024-03-05',
      assignedTo: 'Incident Commander',
      location: 'Station Bay 3',
      condition: 'Good',
      mileage: 9800,
      hours: 2100,
      notes: 'Communication systems updated'
    },
    {
      id: '6',
      name: 'Fire Engine A2',
      type: 'Fire Truck',
      serialNumber: 'FE-2024-006',
      station: 'Cape Coast',
      status: 'Active',
      lastInspection: '2024-02-12',
      nextInspection: '2024-03-12',
      assignedTo: 'Station Commander',
      location: 'Station Bay 1',
      condition: 'Excellent',
      mileage: 11200,
      hours: 2300,
      notes: 'New water pump installed'
    },
    {
      id: '7',
      name: 'Ambulance AM2',
      type: 'Ambulance',
      serialNumber: 'AM-2024-007',
      station: 'Sunyani',
      status: 'Maintenance',
      lastInspection: '2024-01-25',
      nextInspection: '2024-02-25',
      assignedTo: 'Maintenance Team',
      location: 'Maintenance Bay',
      condition: 'Fair',
      mileage: 18700,
      hours: 3800,
      notes: 'Brake system maintenance'
    },
    {
      id: '8',
      name: 'Ladder Truck L2',
      type: 'Ladder Truck',
      serialNumber: 'LT-2024-008',
      station: 'Ho',
      status: 'Active',
      lastInspection: '2024-02-08',
      nextInspection: '2024-03-08',
      assignedTo: 'Station Commander',
      location: 'Station Bay 2',
      condition: 'Good',
      mileage: 13400,
      hours: 2750,
      notes: 'Ladder mechanism serviced'
    }
  ];

  // TanStack table columns
  const columns: ColumnDef<Equipment>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Equipment Name',
        cell: ({ getValue }) => (
          <div className="font-semibold text-gray-900">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => {
          const type = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              type === 'Fire Truck' ? 'bg-red-100 text-red-800' :
              type === 'Ambulance' ? 'bg-blue-100 text-blue-800' :
              type === 'Ladder Truck' ? 'bg-green-100 text-green-800' :
              type === 'Rescue Vehicle' ? 'bg-yellow-100 text-yellow-800' :
              type === 'Command Vehicle' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: 'serialNumber',
        header: 'Serial Number',
        cell: ({ getValue }) => (
          <div className="text-gray-600 font-mono text-sm">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'station',
        header: 'Station',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              status === 'Active' ? 'bg-green-100 text-green-800' :
              status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
              status === 'Out of Service' ? 'bg-red-100 text-red-800' :
              status === 'Retired' ? 'bg-gray-100 text-gray-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'condition',
        header: 'Condition',
        cell: ({ getValue }) => {
          const condition = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              condition === 'Excellent' ? 'bg-green-100 text-green-800' :
              condition === 'Good' ? 'bg-blue-100 text-blue-800' :
              condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
              condition === 'Poor' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {condition}
            </span>
          );
        },
      },
      {
        accessorKey: 'assignedTo',
        header: 'Assigned To',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'nextInspection',
        header: 'Next Inspection',
        cell: ({ getValue }) => (
          <div className="text-gray-600 text-sm">{getValue() as string}</div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-md">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: equipment,
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

  // Calculate metrics
  const activeEquipment = equipment.filter(item => item.status === 'Active').length;
  const maintenanceEquipment = equipment.filter(item => item.status === 'Maintenance').length;
  const outOfServiceEquipment = equipment.filter(item => item.status === 'Out of Service').length;
  const totalEquipment = equipment.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3">
              Equipment Tracking
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Monitor and manage fire service equipment and vehicles
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <Building2 className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{totalEquipment}</span>
              <p className="text-gray-500 text-sm">Total Equipment</p>
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
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+8%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active</h3>
            <p className="text-3xl font-bold text-gray-900">{activeEquipment}</p>
            <p className="text-xs text-gray-500">operational</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Wrench className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Wrench className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-yellow-600 font-semibold">{maintenanceEquipment}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Maintenance</h3>
            <p className="text-3xl font-bold text-gray-900">{maintenanceEquipment}</p>
            <p className="text-xs text-gray-500">under repair</p>
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
                <span className="text-xs text-red-600 font-semibold">{outOfServiceEquipment}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Out of Service</h3>
            <p className="text-3xl font-bold text-gray-900">{outOfServiceEquipment}</p>
            <p className="text-xs text-gray-500">unavailable</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Truck className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-semibold">100%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Equipment</h3>
            <p className="text-3xl font-bold text-gray-900">{totalEquipment}</p>
            <p className="text-xs text-gray-500">registered</p>
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
                placeholder="Search equipment..."
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
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Service">Out of Service</option>
              <option value="Retired">Retired</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
            >
              <option value="all">All Types</option>
              <option value="Fire Truck">Fire Truck</option>
              <option value="Ambulance">Ambulance</option>
              <option value="Ladder Truck">Ladder Truck</option>
              <option value="Rescue Vehicle">Rescue Vehicle</option>
              <option value="Command Vehicle">Command Vehicle</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export Data
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold">
              <Plus className="w-5 h-5" />
              Add Equipment
            </button>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Equipment Inventory</h2>
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

export default EquipmentTrackingPage;
