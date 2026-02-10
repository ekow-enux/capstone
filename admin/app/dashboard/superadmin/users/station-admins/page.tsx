'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSuperAdminAuthStore from '@/lib/stores/superAdminAuth';
import { resolveDashboardPath } from '@/lib/constants/roles';
import { 
  UserCog,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Mail,
  Building2,
  Shield,
  CheckCircle,
  XCircle,
  Download,
  AlertTriangle,
  Calendar,
  X,
  Key,
  Copy,
  Check
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
  getPaginationRowModel,
} from '@tanstack/react-table';
import { StationAdmin } from '@/lib/types/stationAdmin';
import StationAdminForm from '@/components/admin/StationAdminForm';
import { StationAdminFormData } from '@/lib/types/stationAdmin';
import toast, { Toaster } from 'react-hot-toast';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import { 
  useStationAdminsStore, 
  selectStationAdmins, 
  selectStationAdminsIsLoading, 
  selectStationAdminsError,
  selectStationAdminsCount 
} from '@/lib/stores/stationAdmins';

const StationAdminsPage: React.FC = () => {
  const router = useRouter();
  const user = useSuperAdminAuthStore((state) => state.user);
  const stations = useStationsStore(selectStations);
  const stationAdmins = useStationAdminsStore(selectStationAdmins);
  const isLoadingStore = useStationAdminsStore(selectStationAdminsIsLoading);
  const error = useStationAdminsStore(selectStationAdminsError);
  const count = useStationAdminsStore(selectStationAdminsCount);
  const fetchStationAdmins = useStationAdminsStore((state) => state.fetchStationAdmins);
  const createStationAdmin = useStationAdminsStore((state) => state.createStationAdmin);
  const updateStationAdmin = useStationAdminsStore((state) => state.updateStationAdmin);
  const deleteStationAdmin = useStationAdminsStore((state) => state.deleteStationAdmin);
  const changePassword = useStationAdminsStore((state) => state.changePassword);
  const clearError = useStationAdminsStore((state) => state.clearError);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<StationAdmin | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<StationAdmin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAdmin, setPasswordAdmin] = useState<StationAdmin | null>(null);
  const [tempPassword, setTempPassword] = useState<string>('');
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Check if user is Super Admin
  // Only redirect if user is explicitly set and doesn't have SuperAdmin role
  useEffect(() => {
    // Wait a bit for auth store to initialize before checking
    const timer = setTimeout(() => {
      if (user && user.role !== 'SuperAdmin') {
        // Redirect unauthorized users to their appropriate dashboard
        const dashboardPath = resolveDashboardPath(user.role) || '/dashboard';
        router.replace(dashboardPath);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user, router]);

  // Fetch station admins on mount
  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchStationAdmins().catch((err) => {
        console.error('Failed to fetch station admins:', err);
      });
    }
  }, [user, fetchStationAdmins]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Get station name from stationId
  const getStationName = (stationId: string): string => {
    const station = stations.find(s => (s.id || s._id) === stationId);
    return station?.name || stationId;
  };

  const columns: ColumnDef<StationAdmin>[] = useMemo(
    () => [
      {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              {row.original.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.username}</div>
              {row.original.name && (
                <div className="text-xs text-gray-500">{row.original.name}</div>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: 'station',
        header: 'Station',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">
              {row.original.station || getStationName(row.original.stationId || '')}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.isActive ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-semibold">Active</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-700 font-semibold">Inactive</span>
              </>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 text-sm">
              {row.original.createdAt
                ? new Date(row.original.createdAt).toLocaleDateString()
                : '-'}
            </span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedAdmin(row.original);
                setShowModal(true);
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditingAdmin(row.original);
                setShowAddModal(true);
              }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Edit Station Admin"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleChangePassword(row.original)}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
              title="Reset Password (Station admin will be required to change it on next login)"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete Station Admin"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [stations]
  );

  const filteredData = useMemo(() => {
    let filtered = stationAdmins;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (admin) =>
          admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.station?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((admin) => {
        if (filterStatus === 'active') return admin.isActive === true;
        if (filterStatus === 'inactive') return admin.isActive === false;
        return true;
      });
    }

    return filtered;
  }, [searchTerm, filterStatus, stationAdmins]);

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

  const handleSubmit = async (data: StationAdminFormData) => {
    setIsSubmitting(true);
    try {
      if (editingAdmin) {
        const adminId = editingAdmin.id || editingAdmin._id;
        if (!adminId) {
          throw new Error('Station admin ID is missing');
        }
        await updateStationAdmin(adminId, data);
        toast.success(`Station Admin "${data.username}" updated successfully!`, {
          duration: 4000,
          icon: '✅',
        });
      } else {
        const newAdmin = await createStationAdmin(data);
        toast.success(`Station Admin "${data.username}" created successfully!`, {
          duration: 4000,
          icon: '✅',
        });
        console.log('Created station admin:', newAdmin);
      }
      
      // Refresh the list to show the new/updated admin
      await fetchStationAdmins();
      
      setShowAddModal(false);
      setEditingAdmin(null);
    } catch (error) {
      console.error('Error saving station admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save station admin';
      toast.error(`Failed to ${editingAdmin ? 'update' : 'create'} station admin: ${errorMessage}`, {
        duration: 5000,
        icon: '❌',
      });
      throw error; // Re-throw so form can handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (admin: StationAdmin) => {
    if (!confirm(`Are you sure you want to delete station admin "${admin.username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const adminId = admin.id || admin._id;
      if (!adminId) {
        throw new Error('Station admin ID is missing');
      }
      await deleteStationAdmin(adminId);
      toast.success(`Station Admin "${admin.username}" deleted successfully!`, {
        duration: 4000,
        icon: '✅',
      });
      // Refresh the list
      await fetchStationAdmins();
    } catch (error) {
      console.error('Error deleting station admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete station admin';
      toast.error(`Failed to delete station admin: ${errorMessage}`, {
        duration: 5000,
        icon: '❌',
      });
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setEditingAdmin(null);
  };

  const handleChangePassword = async (admin: StationAdmin) => {
    setIsChangingPassword(true);
    setPasswordAdmin(admin);
    try {
      const adminId = admin.id || admin._id;
      if (!adminId) {
        throw new Error('Station admin ID is missing');
      }
      const newTempPassword = await changePassword(adminId);
      setTempPassword(newTempPassword);
      setShowPasswordModal(true);
      toast.success(`Password reset successful for "${admin.username}". They will be required to change it on next login.`, {
        duration: 4000,
        icon: '✅',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(`Failed to change password: ${errorMessage}`, {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      setPasswordCopied(true);
      toast.success('Password copied to clipboard!', {
        duration: 2000,
        icon: '📋',
      });
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy password', {
        duration: 3000,
        icon: '❌',
      });
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordAdmin(null);
    setTempPassword('');
    setPasswordCopied(false);
  };

  const totalAdmins = count || stationAdmins.length;
  const activeAdmins = stationAdmins.filter(a => a.isActive).length;
  const inactiveAdmins = stationAdmins.filter(a => !a.isActive).length;

  if (user?.role !== 'SuperAdmin') {
    return null;
  }

  // Show loading state
  if (isLoadingStore && stationAdmins.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading station admins...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <UserCog className="w-12 h-12 text-red-600" />
              Station Admins
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage station administrators. Only Super Admin can perform these actions.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <UserCog className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Admins</h3>
            <p className="text-3xl font-bold text-gray-900">{totalAdmins}</p>
            <p className="text-xs text-gray-500">station administrators</p>
          </div>
        </div>

        <div className="bg-white border-2 border-green-200 p-6 rounded-xl hover:border-green-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active</h3>
            <p className="text-3xl font-bold text-gray-900">{activeAdmins}</p>
            <p className="text-xs text-gray-500">currently active</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Inactive</h3>
            <p className="text-3xl font-bold text-gray-900">{inactiveAdmins}</p>
            <p className="text-xs text-gray-500">deactivated accounts</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-blue-800 font-semibold mb-1">Super Admin Only</p>
            <p className="text-blue-700 text-sm">
              Only Super Admin users can view, create, edit, and delete Station Admins. 
              Station Admins manage individual fire stations and their personnel.
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
                placeholder="Search station admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
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
            <button
              onClick={() => {
                setEditingAdmin(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Station Admin
            </button>
          </div>
        </div>
      </div>

      {/* Station Admins Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <UserCog className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Station Administrators</h2>
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <UserCog className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-600 text-lg font-semibold">No station admins found</p>
                      <p className="text-gray-500 text-sm">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Click "Add Station Admin" to create one'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
            Showing {table.getRowModel().rows.length} of {filteredData.length} station admins
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">Station Admin Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedAdmin.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{selectedAdmin.username}</h3>
                    {selectedAdmin.name && (
                      <p className="text-lg text-gray-600">{selectedAdmin.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedAdmin.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {selectedAdmin.station || getStationName(selectedAdmin.stationId || '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAdmin.isActive ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-semibold">Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 font-semibold">Inactive</span>
                      </>
                    )}
                  </div>
                  {selectedAdmin.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        Created: {new Date(selectedAdmin.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={handleCancel}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <UserCog className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    {editingAdmin ? 'Edit Station Admin' : 'Add New Station Admin'}
                  </h2>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <StationAdminForm
                initialData={editingAdmin || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && passwordAdmin && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={handleClosePasswordModal}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Key className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Password Reset Successful</h2>
                </div>
                <button
                  onClick={handleClosePasswordModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-blue-800 font-semibold mb-2">Station Admin:</p>
                  <p className="text-blue-900 text-lg font-bold">{passwordAdmin.username}</p>
                  {passwordAdmin.name && (
                    <p className="text-blue-700 text-sm mt-1">{passwordAdmin.name}</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-bold text-green-900">Temporary Password</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white border-2 border-green-300 rounded-lg p-4">
                      <code className="text-lg font-mono font-bold text-gray-900 break-all">
                        {tempPassword}
                      </code>
                    </div>
                    <button
                      onClick={handleCopyPassword}
                      className={`p-3 rounded-lg transition-all duration-200 ${
                        passwordCopied
                          ? 'bg-green-500 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      title="Copy password"
                    >
                      {passwordCopied ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 font-semibold mb-1">Important:</p>
                      <p className="text-yellow-700 text-sm">
                        This temporary password will be shown only once. Please copy it now and share it securely with the station admin.
                      </p>
                      <p className="text-yellow-700 text-sm mt-2">
                        <strong>Password Change Required:</strong> When the station admin logs in with this temporary password, 
                        they will be required to change it to a new password before they can access the dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleClosePasswordModal}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default StationAdminsPage;

