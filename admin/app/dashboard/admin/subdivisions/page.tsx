'use client';

import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  MapPin,
  Users,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2
} from 'lucide-react';

interface SubDivision {
  id: string;
  name: string;
  code: string;
  department: string;
  departmentCode: string;
  description: string;
  supervisor: string; // OIC
  deputySupervisor?: string; // 2IC
  contactNumber: string;
  email: string;
  location: string;
  establishedDate: string;
  status: 'Active' | 'Inactive' | 'Under Review';
  personnelCount: number;
  equipmentCount: number;
}

// Mock data for sub-divisions
const subDivisions: SubDivision[] = [
  {
    id: '1',
    name: 'Fire Suppression Unit A',
    code: 'FSU-A',
    department: 'Fire Suppression',
    departmentCode: 'FS',
    description: 'Primary firefighting unit for high-rise buildings',
    supervisor: 'John Doe',
    deputySupervisor: 'Mary Mensah',
    contactNumber: '+233 24 123 4567',
    email: 'fsu-a@gnfs.gov.gh',
    location: 'Station A1 - Ground Floor - Unit A',
    establishedDate: '2020-01-15',
    status: 'Active',
    personnelCount: 5,
    equipmentCount: 8
  },
  {
    id: '2',
    name: 'Fire Suppression Unit B',
    code: 'FSU-B',
    department: 'Fire Suppression',
    departmentCode: 'FS',
    description: 'Secondary firefighting unit for residential areas',
    supervisor: 'Mike Wilson',
    deputySupervisor: 'Kojo Appiah',
    contactNumber: '+233 24 123 4568',
    email: 'fsu-b@gnfs.gov.gh',
    location: 'Station A1 - Ground Floor - Unit B',
    establishedDate: '2020-01-20',
    status: 'Active',
    personnelCount: 5,
    equipmentCount: 6
  },
  {
    id: '3',
    name: 'Fire Suppression Unit C',
    code: 'FSU-C',
    department: 'Fire Suppression',
    departmentCode: 'FS',
    description: 'Specialized unit for industrial firefighting',
    supervisor: 'Sarah Johnson',
    contactNumber: '+233 24 123 4569',
    email: 'fsu-c@gnfs.gov.gh',
    location: 'Station A1 - Ground Floor - Unit C',
    establishedDate: '2020-02-01',
    status: 'Active',
    personnelCount: 5,
    equipmentCount: 10
  },
  {
    id: '4',
    name: 'Emergency Medical Unit',
    code: 'EMU',
    department: 'Emergency Medical Services',
    departmentCode: 'EMS',
    description: 'Primary medical emergency response unit',
    supervisor: 'Jane Smith',
    deputySupervisor: 'Esi Agyapong',
    contactNumber: '+233 24 234 5678',
    email: 'emu@gnfs.gov.gh',
    location: 'Station A1 - First Floor - Medical Unit',
    establishedDate: '2020-02-20',
    status: 'Active',
    personnelCount: 6,
    equipmentCount: 4
  },
  {
    id: '5',
    name: 'Ambulance Unit',
    code: 'AU',
    department: 'Emergency Medical Services',
    departmentCode: 'EMS',
    description: 'Ambulance services and patient transport',
    supervisor: 'David Brown',
    contactNumber: '+233 24 234 5679',
    email: 'au@gnfs.gov.gh',
    location: 'Station A1 - First Floor - Ambulance Bay',
    establishedDate: '2020-03-01',
    status: 'Active',
    personnelCount: 6,
    equipmentCount: 3
  },
  {
    id: '6',
    name: 'Technical Rescue Unit',
    code: 'TRU',
    department: 'Rescue Operations',
    departmentCode: 'RO',
    description: 'Technical rescue operations and specialized equipment',
    supervisor: 'Mike Johnson',
    contactNumber: '+233 24 345 6789',
    email: 'tru@gnfs.gov.gh',
    location: 'Station A1 - Second Floor - Rescue Unit',
    establishedDate: '2020-03-10',
    status: 'Active',
    personnelCount: 4,
    equipmentCount: 12
  },
  {
    id: '7',
    name: 'Water Rescue Unit',
    code: 'WRU',
    department: 'Rescue Operations',
    departmentCode: 'RO',
    description: 'Water-based rescue operations and marine safety',
    supervisor: 'Lisa Davis',
    deputySupervisor: 'Nana Akua',
    contactNumber: '+233 24 345 6790',
    email: 'wru@gnfs.gov.gh',
    location: 'Station A1 - Second Floor - Water Unit',
    establishedDate: '2020-03-15',
    status: 'Active',
    personnelCount: 4,
    equipmentCount: 8
  },
  {
    id: '8',
    name: 'Fire Prevention Unit',
    code: 'FPU',
    department: 'Prevention & Safety',
    departmentCode: 'PS',
    description: 'Fire prevention inspections and safety education',
    supervisor: 'Sarah Wilson',
    contactNumber: '+233 24 456 7890',
    email: 'fpu@gnfs.gov.gh',
    location: 'Station A1 - Ground Floor - Prevention Unit',
    establishedDate: '2020-04-05',
    status: 'Active',
    personnelCount: 3,
    equipmentCount: 2
  },
  {
    id: '9',
    name: 'Public Education Unit',
    code: 'PEU',
    department: 'Prevention & Safety',
    departmentCode: 'PS',
    description: 'Community outreach and fire safety education',
    supervisor: 'Robert Taylor',
    contactNumber: '+233 24 456 7891',
    email: 'peu@gnfs.gov.gh',
    location: 'Station A1 - Ground Floor - Education Unit',
    establishedDate: '2020-04-10',
    status: 'Active',
    personnelCount: 3,
    equipmentCount: 1
  },
  {
    id: '10',
    name: 'Training Unit',
    code: 'TU',
    department: 'Training & Development',
    departmentCode: 'TD',
    description: 'Personnel training and skill development programs',
    supervisor: 'David Brown',
    deputySupervisor: 'Abena Adjei',
    contactNumber: '+233 24 567 8901',
    email: 'tu@gnfs.gov.gh',
    location: 'Station A1 - Third Floor - Training Center',
    establishedDate: '2020-05-12',
    status: 'Under Review',
    personnelCount: 4,
    equipmentCount: 5
  }
];

const SubDivisionManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const totalSubDivisions = subDivisions.length;
  const activeSubDivisions = subDivisions.filter(sub => sub.status === 'Active').length;

  const columns: ColumnDef<SubDivision>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Sub-Division Name',
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-gray-900">{row.getValue('name')}</div>
            <div className="text-sm text-gray-500">{row.original.code}</div>
          </div>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.getValue('department')}</div>
            <div className="text-sm text-gray-500">{row.original.departmentCode}</div>
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="max-w-xs truncate text-gray-700">
            {row.getValue('description')}
          </div>
        ),
      },
      {
        accessorKey: 'supervisor',
        header: 'OIC / 2IC',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">OIC: {row.getValue('supervisor')}</div>
            <div className="text-xs text-gray-500">2IC: {row.original.deputySupervisor || '-'}</div>
          </div>
        ),
      },
      {
        accessorKey: 'personnelCount',
        header: 'Personnel',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">{row.getValue('personnelCount')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'equipmentCount',
        header: 'Equipment',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">{row.getValue('equipmentCount')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : status === 'Under Review'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {status}
            </span>
          );
        },
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

  const filteredData = useMemo(() => {
    return subDivisions.filter(sub => {
      const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sub.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sub.supervisor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = filterDepartment === 'all' || sub.department === filterDepartment;
      const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [searchTerm, filterDepartment, filterStatus]);

  const table = useReactTable({
    data: filteredData,
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

  const uniqueDepartments = Array.from(new Set(subDivisions.map(sub => sub.department)));

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3">
              Sub-Division Management
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage station sub-divisions and specialized units
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <MapPin className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{totalSubDivisions}</span>
              <p className="text-gray-500 text-sm">Total Sub-Divisions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">Active</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Sub-Divisions</h3>
            <p className="text-3xl font-bold text-gray-900">{activeSubDivisions}</p>
            <p className="text-xs text-gray-500">operational</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">Total</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Personnel</h3>
            <p className="text-3xl font-bold text-gray-900">{subDivisions.reduce((sum, sub) => sum + sub.personnelCount, 0)}</p>
            <p className="text-xs text-gray-500">across sub-divisions</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">Total</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Equipment Units</h3>
            <p className="text-3xl font-bold text-gray-900">{subDivisions.reduce((sum, sub) => sum + sub.equipmentCount, 0)}</p>
            <p className="text-xs text-gray-500">across sub-divisions</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sub-divisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none w-64"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
            <Download className="w-5 h-5" />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold">
            <Plus className="w-5 h-5" />
            Add New Sub-Division
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-red-200 rounded-xl">
        <div className="p-6 border-b-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Sub-Divisions Overview</h3>
              <p className="text-gray-600">Station specialized units and operational structure</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm text-gray-500">{filteredData.length} Sub-Divisions</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
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
      </div>
    </div>
  );
};

export default SubDivisionManagementPage;
