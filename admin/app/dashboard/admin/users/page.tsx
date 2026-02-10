'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  Users,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  Building2
} from 'lucide-react';
import { formatRank, getCorps, resolveRankCode } from '@/lib/types/ranks';

interface StationUser {
  id: string;
  name: string;
  gender?: 'Male' | 'Female';
  email: string;
  phone: string;
  rank: string;
  position?: string;
  department: string;
  subDivision: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  lastLogin: string;
  permissions: string[];
  watch?: string;
  unit?: string;
  service_number?: string;
}

// Mock data for station users (loaded from provided personnel payload)
// Updated personnel from payload
const stationUsers: StationUser[] = [
  {
    id: '20201122K',
    name: 'Kwame Owusu',
    gender: 'Male',
    rank: resolveRankCode('DO I', 'Male'),
    position: 'DFO',
    department: '-',
    service_number: '20201122K',
    status: 'Active',
    email: 'kwame.owusu@gnfs.gov.gh',
    phone: '+233 24 000 0022',
    subDivision: '-',
    lastLogin: '2024-01-15 09:10:00',
    permissions: ['Station Command']
  },
  {
    id: '20201118K',
    name: 'Kojo Appiah',
    gender: 'Male',
    rank: resolveRankCode('Station Officer I', 'Male'),
    position: 'OIC',
    department: 'Safety',
    service_number: '20201118K',
    status: 'Active',
    email: 'kojo.appiah@gnfs.gov.gh',
    phone: '+233 24 000 0018',
    subDivision: '-',
    lastLogin: '2024-01-15 06:45:00',
    permissions: ['Safety']
  },
  {
    id: '20201119A',
    name: 'Abena Adjei',
    gender: 'Female',
    rank: resolveRankCode('Group Officer I', 'Female'),
    position: '2IC',
    department: 'Welfare',
    service_number: '20201119A',
    status: 'Active',
    email: 'abena.adjei@gnfs.gov.gh',
    phone: '+233 24 000 0019',
    subDivision: '-',
    lastLogin: '2024-01-15 06:30:00',
    permissions: ['Welfare']
  },
  {
    id: '20201120K',
    name: 'Kwesi Darko',
    gender: 'Male',
    rank: resolveRankCode('Leading Fireman', 'Male'),
    position: 'Firefighter',
    department: 'Operations',
    watch: 'Blue Watch',
    unit: 'Crew',
    service_number: '20201120K',
    status: 'Active',
    email: 'kwesi.darko@gnfs.gov.gh',
    phone: '+233 24 000 0020',
    subDivision: 'Crew',
    lastLogin: '2024-01-15 08:10:00',
    permissions: ['Operations']
  },
  {
    id: '20201121A',
    name: 'Akua Ofori',
    gender: 'Female',
    rank: resolveRankCode('Recruit Firewoman', 'Female'),
    position: 'Firefighter',
    department: 'Operations',
    watch: 'Green Watch',
    unit: 'Watch Room',
    service_number: '20201121A',
    status: 'Active',
    email: 'akua.ofori@gnfs.gov.gh',
    phone: '+233 24 000 0021',
    subDivision: 'Watch Room',
    lastLogin: '2024-01-15 08:05:00',
    permissions: ['Operations']
  },
  {
    id: '20201117N',
    name: 'Nana Akua',
    gender: 'Female',
    rank: resolveRankCode('ADO I', 'Female'),
    position: 'Safety Officer',
    department: 'Special Duty',
    service_number: '20201117N',
    status: 'Active',
    email: 'nana.akua@gnfs.gov.gh',
    phone: '+233 24 000 0017',
    subDivision: '-',
    lastLogin: '2024-01-15 07:45:00',
    permissions: ['Special Duty']
  }
];

const AdminUserManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const totalUsers = stationUsers.length;
  const activeUsers = stationUsers.filter(user => user.status === 'Active').length;

  const columns: ColumnDef<StationUser>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-gray-900">{row.getValue('name')}</div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        ),
      },
      {
        accessorKey: 'rank',
        header: 'Rank',
        cell: ({ row }) => {
          const formatted = formatRank(row.getValue('rank') as string);
          const [initials, full] = formatted.includes(' — ')
            ? formatted.split(' — ')
            : [formatted, ''];
          return (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">{initials}</span>
              <span className="text-xs text-gray-600">{full}</span>
            </div>
          );
        },
      },
      {
        id: 'corps',
        header: 'Corps',
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {getCorps(row.getValue('rank') as string)}
          </span>
        ),
      },
      {
        accessorKey: 'service_number',
        header: 'Service No.',
        cell: ({ row }) => (
          <div className="font-mono text-gray-700">{row.getValue('service_number') as string}</div>
        ),
      },
      {
        accessorKey: 'position',
        header: 'Position',
        cell: ({ row }) => (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            {(row.getValue('position') as string) || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => {
          const rankCode = (row.original.rank || '').toString().toUpperCase();
          const isStationCommand = rankCode === 'DO I' || rankCode === 'ACFO';
          if (isStationCommand) {
            return (
              <div>
                <div className="font-medium text-gray-900">Station Command <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">{row.original.position || 'MFO/DFO'}</span></div>
                <div className="text-sm text-gray-500">-</div>
              </div>
            );
          }
          return (
            <div>
              <div className="font-medium text-gray-900">{row.getValue('department')}</div>
              <div className="text-sm text-gray-500">{row.original.subDivision}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'watch',
        header: 'Watch',
        cell: ({ row }) => (
          <div className="text-gray-700">{(row.getValue('watch') as string) || '-'}</div>
        ),
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        cell: ({ row }) => (
          <div className="text-gray-700">{(row.getValue('unit') as string) || '-'}</div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Contact',
        cell: ({ row }) => (
          <div className="text-gray-700">{row.getValue('phone')}</div>
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
                : status === 'On Leave'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'lastLogin',
        header: 'Last Login',
        cell: ({ row }) => (
          <div className="text-gray-600 text-sm">
            {new Date(row.getValue('lastLogin')).toLocaleDateString()}
          </div>
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

  const filteredData = useMemo(() => {
    return stationUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.service_number || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const rankCode = (user.rank || '').toUpperCase();
      const isStationCommand = rankCode === 'DO I' || rankCode === 'ACFO';
      const effectiveDept = isStationCommand ? 'Station Command' : user.department;
      const matchesDepartment = filterDepartment === 'all' || effectiveDept === filterDepartment;
      const matchesPosition = (user.position || '').toLowerCase().includes(searchTerm.toLowerCase());
      return (matchesSearch || matchesPosition) && matchesStatus && matchesDepartment;
    });
  }, [searchTerm, filterStatus, filterDepartment]);

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

  const uniqueDepartments = useMemo(() => {
    const depts = new Set<string>();
    for (const u of stationUsers) {
      const rankCode = (u.rank || '').toUpperCase();
      const isStationCommand = rankCode === 'DO I' || rankCode === 'ACFO';
      depts.add(isStationCommand ? 'Station Command' : u.department);
    }
    return Array.from(depts);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3">
              Personnel Management
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage station officers (fire personnel). Civilians register themselves.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <Users className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{totalUsers}</span>
              <p className="text-gray-500 text-sm">Total Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">Active</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Users</h3>
            <p className="text-3xl font-bold text-gray-900">{activeUsers}</p>
            <p className="text-xs text-gray-500">station personnel</p>
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
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Departments</h3>
            <p className="text-3xl font-bold text-gray-900">{uniqueDepartments.length}</p>
            <p className="text-xs text-gray-500">operational</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">Online</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Online Today</h3>
            <p className="text-3xl font-bold text-gray-900">{activeUsers}</p>
            <p className="text-xs text-gray-500">active sessions</p>
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none w-64"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
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
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
            <Download className="w-5 h-5" />
            Export Data
          </button>
          <Link
            href="/dashboard/admin/users/fire-personnel"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add New Officer
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl mb-6">
        <div className="flex items-center gap-4 border-b-2 border-gray-200 pb-4">
          <Link
            href="/dashboard/admin/users/civilian"
            className="px-6 py-3 text-lg font-semibold text-gray-700 hover:text-red-600 border-b-2 border-transparent hover:border-red-600 transition-colors"
          >
            Civilians
          </Link>
          <Link
            href="/dashboard/admin/users/fire-personnel"
            className="px-6 py-3 text-lg font-semibold text-gray-700 hover:text-red-600 border-b-2 border-transparent hover:border-red-600 transition-colors"
          >
            Officers (Fire Personnel)
          </Link>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> Admin can add Officers (Fire Personnel). Civilians are external users who register themselves.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-red-200 rounded-xl">
        <div className="p-6 border-b-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Station Personnel (Officers)</h3>
              <p className="text-gray-600">Current staff accounts and permissions</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm text-gray-500">{filteredData.length} Users</span>
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

export default AdminUserManagementPage;
