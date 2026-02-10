'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSuperAdminAuthStore from '@/lib/stores/superAdminAuth';
import { useFirePersonnelStore, selectFirePersonnel, selectFirePersonnelIsLoading, selectFirePersonnelError, selectFirePersonnelCount } from '@/lib/stores/firePersonnel';
import { useRanksStore, selectRanks } from '@/lib/stores/ranks';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import { useUnitsStore, selectUnits } from '@/lib/stores/units';
import { 
  Flame,
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
  X,
  Plus,
  Key,
  Loader2
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
import toast, { Toaster } from 'react-hot-toast';

interface FirePersonnel {
  id: string;
  name: string;
  rank: string;
  email: string;
  phone: string;
  station: string;
  department: string;
  status: 'active' | 'on-leave' | 'retired';
  incidentCount: number;
  lastIncident: string;
  joinedDate: string;
}

const FirePersonnelPage: React.FC = () => {
  const router = useRouter();
  const user = useSuperAdminAuthStore((state) => state.user);
  
  const firePersonnel = useFirePersonnelStore(selectFirePersonnel);
  const isLoading = useFirePersonnelStore(selectFirePersonnelIsLoading);
  const error = useFirePersonnelStore(selectFirePersonnelError);
  const count = useFirePersonnelStore(selectFirePersonnelCount);
  const fetchFirePersonnel = useFirePersonnelStore((state) => state.fetchFirePersonnel);
  const createFirePersonnel = useFirePersonnelStore((state) => state.createFirePersonnel);
  const clearError = useFirePersonnelStore((state) => state.clearError);

  const ranks = useRanksStore(selectRanks);
  const fetchRanks = useRanksStore((state) => state.fetchRanks);
  
  const stations = useStationsStore(selectStations);
  const fetchStations = useStationsStore((state) => state.fetchStations);

  const units = useUnitsStore(selectUnits);
  const fetchUnits = useUnitsStore((state) => state.fetchUnits);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedUser, setSelectedUser] = useState<TransformedFirePersonnel | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceNumber: '',
    name: '',
    rank: '', // rankId
    department: '', // departmentId (will be set by station admin later)
    unit: '', // unitId (optional)
    station_id: '', // stationId
    tempPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch data on mount
  useEffect(() => {
    fetchFirePersonnel().catch((err) => {
      console.error('Failed to fetch fire personnel:', err);
    });
    fetchRanks().catch((err) => {
      console.error('Failed to fetch ranks:', err);
    });
    if (stations.length === 0) {
      fetchStations().catch((err) => {
        console.error('Failed to fetch stations:', err);
      });
    }
    if (units.length === 0) {
      fetchUnits().catch((err) => {
        console.error('Failed to fetch units:', err);
      });
    }
  }, [fetchFirePersonnel, fetchRanks, fetchStations, stations.length]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, tempPassword: password });
    setErrors({ ...errors, tempPassword: '' });
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.serviceNumber.trim()) {
      newErrors.serviceNumber = 'Service number is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.rank) {
      newErrors.rank = 'Rank is required';
    }

    if (!formData.station_id) {
      newErrors.station_id = 'Station is required';
    }

    if (!formData.tempPassword.trim()) {
      newErrors.tempPassword = 'Temporary password is required';
    } else if (formData.tempPassword.trim().length < 6) {
      newErrors.tempPassword = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createFirePersonnel({
        serviceNumber: formData.serviceNumber.trim(),
        name: formData.name.trim(),
        rank: formData.rank, // rankId
        department: formData.department || '', // departmentId (empty for superadmin, will be set by station admin)
        unit: formData.unit || undefined, // unitId (optional)
        station_id: formData.station_id, // stationId
        tempPassword: formData.tempPassword,
      });
      toast.success(`Officer "${formData.name}" created successfully!`, {
        icon: '✅',
        duration: 3000,
      });
      handleCloseModal();
      // Refresh fire personnel list
      await fetchFirePersonnel();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create officer';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowAddModal(false);
    setErrors({});
    setFormData({
      serviceNumber: '',
      name: '',
      rank: '',
      department: '',
      unit: '',
      station_id: '',
      tempPassword: ''
    });
  };

  // Get rank name helper
  const getRankName = (rankId?: string): string => {
    if (!rankId) return '-';
    const rank = ranks.find(r => (r.id || r._id) === rankId);
    return rank?.name || rank?.initials || '-';
  };

  // Get station name helper
  const getStationName = (stationId?: string): string => {
    if (!stationId) return '-';
    const station = stations.find(s => (s.id || s._id) === stationId);
    return station?.name || station?.call_sign || '-';
  };

  // Type for transformed personnel data
  type TransformedFirePersonnel = typeof firePersonnel[0] & { 
    id: string;
    rankName: string; 
    stationName: string;
  };

  // Transform fire personnel to match table format
  const transformedPersonnel = useMemo<TransformedFirePersonnel[]>(() => {
    return firePersonnel.map((personnel) => ({
      ...personnel,
      id: personnel.id || personnel._id,
      rankName: getRankName(personnel.rankId),
      stationName: getStationName(personnel.stationId),
    }));
  }, [firePersonnel, ranks, stations]);

  const columns: ColumnDef<TransformedFirePersonnel>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
              {(row.original.name || '').split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.name || '-'}</div>
              <div className="text-xs text-gray-500">{row.original.serviceNumber || '-'}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'rankName',
        header: 'Rank',
        cell: ({ row }) => (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
            {row.original.rankName || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'stationName',
        header: 'Station',
        cell: ({ row }) => (
          <div className="text-gray-600">{row.original.stationName || '-'}</div>
        ),
      },
      {
        accessorKey: 'incidentCount',
        header: 'Incidents',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
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
              status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
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
    let filtered = transformedPersonnel;
    
    if (searchTerm) {
      filtered = filtered.filter(
        personnel =>
          personnel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          personnel.rankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          personnel.serviceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          personnel.stationName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchTerm, transformedPersonnel]);

  const table = useReactTable<TransformedFirePersonnel>({
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

  const totalPersonnel = count || transformedPersonnel.length;
  const activePersonnel = transformedPersonnel.length; // TODO: Filter by status when available
  const totalIncidents = 0; // TODO: Calculate from incidents when available

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <Flame className="w-12 h-12 text-red-600" />
              Officers (Fire Personnel)
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage fire service officers. Super Admin can add officers and assign stations only.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Flame className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+12%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Personnel</h3>
            <p className="text-3xl font-bold text-gray-900">{totalPersonnel}</p>
            <p className="text-xs text-gray-500">fire service members</p>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 p-6 rounded-xl hover:border-blue-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">{activePersonnel}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Personnel</h3>
            <p className="text-3xl font-bold text-gray-900">{activePersonnel}</p>
            <p className="text-xs text-gray-500">on duty</p>
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
                <span className="text-xs text-green-600 font-semibold">+8%</span>
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
            <p className="text-blue-800 font-semibold mb-1">Super Admin Permissions</p>
            <p className="text-blue-700 text-sm">
              Super Admin can add officers and assign stations only. Department assignment is handled by Station Admins.
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
                placeholder="Search officers..."
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
              <option value="on-leave">On Leave</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add New Officer
            </button>
          </div>
        </div>
      </div>

      {/* Personnel Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Flame className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Personnel Directory</h2>
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
            Showing {table.getRowModel().rows.length} of {filteredData.length} officers
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">Personnel Profile</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {(selectedUser.name || '').split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{selectedUser.name || '-'}</h3>
                    <p className="text-lg text-red-600 font-semibold">{selectedUser.rankName || '-'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedUser.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedUser.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedUser.stationName || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {typeof selectedUser.department === 'string' 
                        ? selectedUser.department 
                        : selectedUser.department?.name || '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-red-600" />
                  Service Information
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                        <p className="font-semibold text-gray-900">Service Number: {selectedUser.serviceNumber || 'N/A'}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                            Joined: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Officer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Add New Officer</h2>
                    <p className="text-sm text-gray-600 mt-1">Fill in the officer details below. Station assignment only.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Required Fields Section */}
                <div className="bg-red-50/50 border-2 border-red-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <h3 className="text-lg font-bold text-red-900">Required Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2.5">Service Number *</label>
                      <input
                        type="text"
                        value={formData.serviceNumber}
                        onChange={(e) => {
                          setFormData({ ...formData, serviceNumber: e.target.value });
                          setErrors({ ...errors, serviceNumber: '' });
                        }}
                        placeholder="e.g., GNFS-2024-001"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                          errors.serviceNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                        }`}
                      />
                      {errors.serviceNumber && (
                        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {errors.serviceNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2.5">Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          setErrors({ ...errors, name: '' });
                        }}
                        placeholder="e.g., James Osei"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                          errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2.5">Rank *</label>
                      <select
                        value={formData.rank}
                        onChange={(e) => {
                          setFormData({ ...formData, rank: e.target.value });
                          setErrors({ ...errors, rank: '' });
                        }}
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                          errors.rank ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="">Select Rank</option>
                        {ranks.map((rank) => (
                          <option key={rank.id || rank._id} value={rank.id || rank._id}>
                            {rank.name || rank.initials || 'Unnamed Rank'}
                          </option>
                        ))}
                      </select>
                      {errors.rank && (
                        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {errors.rank}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2.5">Station *</label>
                      <select
                        value={formData.station_id}
                        onChange={(e) => {
                          setFormData({ ...formData, station_id: e.target.value });
                          setErrors({ ...errors, station_id: '' });
                        }}
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                          errors.station_id ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="">Select Station</option>
                        {stations.map((station) => (
                          <option key={station.id || station._id} value={station.id || station._id}>
                            {station.name || station.call_sign || 'Unnamed Station'}
                          </option>
                        ))}
                      </select>
                      {errors.station_id && (
                        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {errors.station_id}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">Unit (Optional)</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => {
                          setFormData({ ...formData, unit: e.target.value });
                        }}
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 border-gray-200 focus:border-red-400 focus:bg-red-50/30 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="">Select Unit (Optional)</option>
                        {units.map((unit) => (
                          <option key={unit.id || unit._id} value={unit.id || unit._id}>
                            {unit.name || 'Unnamed Unit'}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1.5">Optional: Assign to a specific unit within the station</p>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4 text-green-600" />
                    <h3 className="text-lg font-bold text-green-900">Temporary Password *</h3>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formData.tempPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, tempPassword: e.target.value });
                        setErrors({ ...errors, tempPassword: '' });
                      }}
                      placeholder="Type or auto-generate password"
                      disabled={isSubmitting}
                      className={`flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.tempPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-400 focus:bg-white'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={generateTempPassword}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      title="Auto-generate password"
                    >
                      <Key className="w-4 h-4" />
                      Generate
                    </button>
                  </div>
                  {errors.tempPassword ? (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.tempPassword}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Secure password will be auto-generated for better security
                    </p>
                  )}
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <p className="text-blue-800 text-sm">
                      <strong>Note:</strong> Super Admin can only assign stations. Department assignment will be handled by Station Admins after the officer is added.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Add Officer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirePersonnelPage;

