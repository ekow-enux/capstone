'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import useSuperAdminAuthStore from '@/lib/stores/superAdminAuth';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
import { resolveDashboardPath } from '@/lib/constants/roles';
import { 
  User,
  Search,
  Eye,
  FileText,
  Shield,
  AlertTriangle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Download,
  TrendingUp,
  Building2,
  X
} from 'lucide-react';
import { ColumnDef, SortingState, ColumnFiltersState, getPaginationRowModel } from '@tanstack/react-table';
import DataTable from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';

interface Civilian {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  status: 'active' | 'inactive';
  incidentCount: number;
  lastIncident: string;
  registeredDate: string;
  station?: string;
  assignedUnit?: string;
}

const CivilianPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Get user from appropriate auth store based on route
  // Both Admin and SuperAdmin can access this page
  const superAdminUser = useSuperAdminAuthStore((state) => state.user);
  const stationAdminUser = useStationAdminAuthStore((state) => state.user);
  const authStoreUser = useAuthStore((state) => state.user);
  
  // Determine which user to use based on the pathname
  // This allows the same component to work for both /dashboard/admin and /dashboard/superadmin routes
  const user = pathname?.includes('/superadmin') 
    ? superAdminUser 
    : pathname?.includes('/admin')
    ? stationAdminUser
    : authStoreUser;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedUser, setSelectedUser] = useState<Civilian | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Access control: Only Admin and SuperAdmin can view civilians
  // Both roles are allowed - this page is shared between /dashboard/admin/users/civilian and /dashboard/superadmin/users/civilian
  useEffect(() => {
    // Wait a bit for auth stores to initialize before checking
    const timer = setTimeout(() => {
      // Only redirect if user exists and doesn't have Admin or SuperAdmin role
      if (user && user.role !== 'Admin' && user.role !== 'SuperAdmin') {
        // Redirect unauthorized users to their appropriate dashboard
        const dashboardPath = resolveDashboardPath(user.role) || '/dashboard';
        router.replace(dashboardPath);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user, router]);

  // Mock data - in production, this would come from an API
  const civilians: Civilian[] = [
    {
      id: '1',
      name: 'Abena Osei',
      email: 'abena.osei@email.com',
      phone: '+233 54 123 4567',
      address: '123 Oxford Street, Osu',
      district: 'Greater Accra',
      status: 'active',
      incidentCount: 3,
      lastIncident: '2024-02-10',
      registeredDate: '2023-01-15',
      station: 'Accra Central Fire Station',
      assignedUnit: 'Unit A'
    },
    {
      id: '2',
      name: 'Kwame Asante',
      email: 'kwame.asante@email.com',
      phone: '+233 54 234 5678',
      address: '456 Ring Road, Abeka',
      district: 'Greater Accra',
      status: 'active',
      incidentCount: 5,
      lastIncident: '2024-02-12',
      registeredDate: '2022-08-20',
      station: 'Accra Central Fire Station',
      assignedUnit: 'Unit B'
    },
    {
      id: '3',
      name: 'Efua Mensah',
      email: 'efua.mensah@email.com',
      phone: '+233 54 345 6789',
      address: '789 High Street, Tamale',
      district: 'Northern Region',
      status: 'active',
      incidentCount: 1,
      lastIncident: '2024-01-25',
      registeredDate: '2024-01-01',
      station: 'Tamale Central Fire Station'
    },
    {
      id: '4',
      name: 'Yaw Bonsu',
      email: 'yaw.bonsu@email.com',
      phone: '+233 54 456 7890',
      address: '321 Kasoa Road, Cape Coast',
      district: 'Central Region',
      status: 'inactive',
      incidentCount: 2,
      lastIncident: '2023-12-15',
      registeredDate: '2023-06-10',
      station: 'Cape Coast Fire Station'
    },
    {
      id: '5',
      name: 'Akua Adjei',
      email: 'akua.adjei@email.com',
      phone: '+233 54 567 8901',
      address: '654 Kumasi Street, Kumasi',
      district: 'Ashanti Region',
      status: 'active',
      incidentCount: 7,
      lastIncident: '2024-02-14',
      registeredDate: '2021-03-05',
      station: 'Kumasi Central Fire Station',
      assignedUnit: 'Medical Response Unit'
    },
    {
      id: '6',
      name: 'Kofi Darko',
      email: 'kofi.darko@email.com',
      phone: '+233 54 678 9012',
      address: '987 Takoradi Avenue, Takoradi',
      district: 'Western Region',
      status: 'active',
      incidentCount: 4,
      lastIncident: '2024-02-08',
      registeredDate: '2022-11-12',
      station: 'Takoradi Fire Station'
    }
  ];

  const columns: ColumnDef<Civilian>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {row.original.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.name}</div>
              <div className="text-xs text-gray-500">{row.original.email}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'district',
        header: 'District',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'station',
        header: 'Station / Unit',
        cell: ({ row }) => (
          <div className="text-gray-600">
            {row.original.station ? (
              <div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>{row.original.station}</span>
                </div>
                {row.original.assignedUnit && (
                  <div className="text-xs text-gray-500 mt-1">
                    Unit: {row.original.assignedUnit}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'incidentCount',
        header: 'Incidents',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <span className="font-semibold text-gray-900">{getValue() as number}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              status === 'active' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
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
                setSelectedUser(row.original);
                setShowModal(true);
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    let filtered = civilians;
    
    if (searchTerm) {
      filtered = filtered.filter(
        civilian =>
          civilian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          civilian.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          civilian.phone.includes(searchTerm) ||
          civilian.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
          civilian.station?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          civilian.assignedUnit?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(civilian => civilian.status === filterStatus);
    }
    
    return filtered;
  }, [searchTerm, filterStatus]);

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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const totalCivilians = civilians.length;
  const activeCivilians = civilians.filter(c => c.status === 'active').length;
  const totalIncidents = civilians.reduce((sum, c) => sum + c.incidentCount, 0);
  const isSuperAdmin = user?.role === 'SuperAdmin';

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <User className="w-12 h-12 text-blue-600" />
              Civilian Users
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              View civilian user profiles. Civilians self-register and cannot be added manually.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-blue-200 p-6 rounded-xl hover:border-blue-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+15%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Civilians</h3>
            <p className="text-3xl font-bold text-gray-900">{totalCivilians}</p>
            <p className="text-xs text-gray-500">registered users</p>
          </div>
        </div>

        <div className="bg-white border-2 border-green-200 p-6 rounded-xl hover:border-green-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">{activeCivilians}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Users</h3>
            <p className="text-3xl font-bold text-gray-900">{activeCivilians}</p>
            <p className="text-xs text-gray-500">currently active</p>
          </div>
        </div>

        <div className="bg-white border-2 border-orange-200 p-6 rounded-xl hover:border-orange-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+10%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Incidents</h3>
            <p className="text-3xl font-bold text-gray-900">{totalIncidents}</p>
            <p className="text-xs text-gray-500">reported</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-blue-800 font-semibold mb-1">Self-Registration Only</p>
            <p className="text-blue-700 text-sm">
              Civilians are external users who register themselves through the public registration system. 
              {isSuperAdmin ? 'Super Admin' : 'Admin'} can view civilian profiles but cannot add, edit, or delete civilian accounts.
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
                placeholder="Search civilians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-300 focus:outline-none transition-colors"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-300 focus:outline-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Civilians Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <User className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Civilian Directory</h2>
        </div>
        <DataTable
          data={filteredData}
          columns={columns}
          searchTerm={searchTerm}
          searchMessage="No civilians found matching your search"
          sorting={sorting}
          onSortingChange={setSorting}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          table={table}
          headerClassName="bg-gradient-to-r from-gray-100 to-gray-200"
        />

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-700">
            Page{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
          </div>
          <div className="text-sm text-gray-700">
            Showing {table.getRowModel().rows.length} of {filteredData.length} civilians
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">Civilian Profile</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{selectedUser.name}</h3>
                    <p className="text-lg text-blue-600 font-semibold">Civilian User</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedUser.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedUser.district}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Incident Reports ({selectedUser.incidentCount})
                </h3>
                <div className="space-y-3">
                  {selectedUser.incidentCount > 0 ? (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">Emergency - Fire Outbreak</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {selectedUser.lastIncident}
                              </span>
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                                Urgent
                              </span>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                      <div className="text-center py-4">
                        <button className="text-blue-600 hover:text-blue-700 font-semibold">
                          View All Incidents
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No incidents reported</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CivilianPage;

