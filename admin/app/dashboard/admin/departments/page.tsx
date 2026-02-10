'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Download,
  Edit,
  Trash2,
  Building2,
  Users,
  X,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useDepartmentsStore, selectDepartments, selectDepartmentsIsLoading, selectDepartmentsError, selectDepartmentsCount, Department } from '@/lib/stores/departments';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
import toast, { Toaster } from 'react-hot-toast';

const DepartmentManagementPage: React.FC = () => {
  const user = useStationAdminAuthStore((state) => state.user);
  const departments = useDepartmentsStore(selectDepartments);
  const isLoading = useDepartmentsStore(selectDepartmentsIsLoading);
  const error = useDepartmentsStore(selectDepartmentsError);
  const count = useDepartmentsStore(selectDepartmentsCount);
  const fetchDepartments = useDepartmentsStore((state) => state.fetchDepartments);
  const createDepartment = useDepartmentsStore((state) => state.createDepartment);
  const updateDepartment = useDepartmentsStore((state) => state.updateDepartment);
  const deleteDepartment = useDepartmentsStore((state) => state.deleteDepartment);
  const clearError = useDepartmentsStore((state) => state.clearError);

  const stations = useStationsStore(selectStations);
  const fetchStations = useStationsStore((state) => state.fetchStations);

  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stationId: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch stations on mount
  useEffect(() => {
    if (stations.length === 0) {
      fetchStations().catch((err) => {
        console.error('Failed to fetch stations:', err);
      });
    }
  }, [stations.length, fetchStations]);

  // Fetch departments on mount and when user's stationId changes
  // Only fetches departments that belong to the admin's assigned station
  useEffect(() => {
    // Wait for user to be loaded
    if (user === undefined) {
      return; // User is still loading
    }

    const stationId = user?.stationId;
    if (stationId) {
      console.log('Fetching departments for station:', stationId);
      // Fetch departments for the admin's station only
      fetchDepartments(stationId)
        .then(() => {
          console.log('Departments fetched successfully');
        })
        .catch((err) => {
          console.error('Failed to fetch departments:', err);
          toast.error('Failed to load departments. Please refresh the page.', {
            icon: '⚠️',
            duration: 3000,
          });
        });
    } else if (user === null) {
      // User is not authenticated
      console.warn('User is not authenticated');
    } else {
      // User is loaded but has no stationId
      console.warn('User has no stationId assigned');
      toast.error('No station assigned. Please contact administrator.', {
        icon: '⚠️',
        duration: 4000,
      });
    }
  }, [user?.stationId, fetchDepartments, user]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    }

    if (!formData.stationId) {
      newErrors.stationId = 'Station is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const departmentData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        stationId: formData.stationId,
      };

      if (editingDepartment) {
        await updateDepartment(editingDepartment.id || editingDepartment._id, departmentData);
        toast.success(`Department "${formData.name}" updated successfully!`, {
          icon: '✅',
          duration: 3000,
        });
      } else {
        await createDepartment(departmentData);
        toast.success(`Department "${formData.name}" created successfully!`, {
          icon: '✅',
          duration: 3000,
        });
      }
      handleCloseModal();
      
      // Refresh departments list after create/update
      const stationId = user?.stationId;
      if (stationId) {
        await fetchDepartments(stationId).catch((err) => {
          console.error('Failed to refresh departments:', err);
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save department';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDepartment(id);
      toast.success('Department deleted successfully!', {
        icon: '✅',
        duration: 3000,
      });
      
      // Refresh departments list after delete
      const stationId = user?.stationId;
      if (stationId) {
        await fetchDepartments(stationId).catch((err) => {
          console.error('Failed to refresh departments:', err);
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete department';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    setShowAddModal(false);
    setEditingDepartment(null);
    setErrors({});
    // Set default stationId to user's station if available
    setFormData({
      name: '',
      description: '',
      stationId: user?.stationId || ''
    });
  };

  // Helper to extract stationId string from string or object
  const extractStationId = (stationId?: string | { _id?: string; id?: string }): string | undefined => {
    if (!stationId) return undefined;
    if (typeof stationId === 'string') return stationId;
    if (typeof stationId === 'object') return stationId._id || stationId.id || undefined;
    return undefined;
  };

  // Get station name helper
  const getStationName = (stationId?: string): string => {
    if (!stationId) return '-';
    const station = stations.find(s => (s.id || s._id) === stationId);
    return station?.name || station?.call_sign || '-';
  };

  // Transform departments to match table format and filter by admin's station
  // This ensures only departments belonging to the admin's assigned station are displayed
  const transformedDepartments = useMemo(() => {
    const adminStationId = user?.stationId;
    
    console.log('Transforming departments:', {
      adminStationId,
      departmentsCount: departments.length,
      departments: departments.map(d => ({
        id: d.id || d._id,
        name: d.name,
        stationId: d.stationId || d.station_id
      }))
    });
    
    if (!adminStationId) {
      // If no stationId, return empty array (admin might not be loaded yet)
      return [];
    }
    
    // Since API already filters by stationId, we trust the API response
    // But we still do a safety check to ensure data integrity
    const filtered = departments
      .filter((dept) => {
        // Handle different stationId formats (string, object with _id/id, or nested)
        const deptStationId = extractStationId(dept.stationId) || extractStationId(dept.station_id);
        
        // Convert both to strings for comparison to handle any type mismatches
        const deptStationIdStr = String(deptStationId || '').trim();
        const adminStationIdStr = String(adminStationId || '').trim();
        
        // If department has no stationId, include it (might be a data issue, but show it)
        if (!deptStationIdStr) {
          console.warn('Department has no stationId:', dept.name);
          return true; // Include departments without stationId for debugging
        }
        
        const matches = deptStationIdStr === adminStationIdStr;
        
        // Log all departments for debugging
        console.log('Department filter check:', {
          deptName: dept.name,
          deptStationId: deptStationId,
          deptStationIdStr,
          adminStationId,
          adminStationIdStr,
          matches,
          deptRaw: {
            stationId: dept.stationId,
            station_id: dept.station_id
          }
        });
        
        return matches;
      })
      .map((dept) => {
        const stationIdStr = extractStationId(dept.stationId) || extractStationId(dept.station_id);
        return {
        ...dept,
        id: dept.id || dept._id,
          stationId: stationIdStr, // Normalize station_id to stationId as string
          stationName: getStationName(stationIdStr),
        unitCount: dept.unitCount || dept.units?.length || 0,
        description: dept.description || '',
        };
      });
    
    console.log('Transformed departments result:', {
      filteredCount: filtered.length,
      filtered: filtered.map(d => ({ id: d.id, name: d.name, stationId: d.stationId }))
    });
    
    return filtered;
  }, [departments, stations, user?.stationId]);

  const columns: ColumnDef<Department & { stationName: string }>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Department Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.name || '-'}</div>
              <div className="text-xs text-gray-500">{row.original.description || '-'}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'stationName',
        header: 'Station',
        cell: ({ row }) => (
          <div className="font-medium text-gray-900">{row.original.stationName || '-'}</div>
        ),
      },
      {
        accessorKey: 'unitCount',
        header: 'Units',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-red-600" />
            <span className="font-semibold text-gray-900">{row.original.unitCount || 0}</span>
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
                setEditingDepartment(row.original);
                const stationIdStr = extractStationId(row.original.stationId) || extractStationId(row.original.station_id) || '';
                setFormData({
                  name: row.original.name || '',
                  description: row.original.description || '',
                  stationId: stationIdStr
                });
                setShowAddModal(true);
              }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Edit Department"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original.id || row.original._id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete Department"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [stations]
  );

  // Apply search filter
  const filteredDepartments = useMemo(() => {
    console.log('Applying search filter:', {
      searchTerm,
      transformedDepartmentsCount: transformedDepartments.length,
      transformedDepartments: transformedDepartments.map(d => ({ id: d.id, name: d.name }))
    });
    
    if (!searchTerm) {
      console.log('No search term, returning all transformed departments:', transformedDepartments.length);
      return transformedDepartments;
    }
    
    const filtered = transformedDepartments.filter(
      dept =>
        dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.stationName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log('After search filter:', filtered.length);
    return filtered;
  }, [searchTerm, transformedDepartments]);

  const table = useReactTable({
    data: filteredDepartments,
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

  const totalDepartments = count || transformedDepartments.length;
  const totalUnits = transformedDepartments.reduce((sum, d) => sum + (d.unitCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3">Department Management</h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage station departments and organizational structure
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Departments</h3>
            <p className="text-3xl font-bold text-gray-900">{totalDepartments}</p>
            <p className="text-xs text-gray-500">operational departments</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Units</h3>
            <p className="text-3xl font-bold text-gray-900">{totalUnits}</p>
            <p className="text-xs text-gray-500">across departments</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export
            </button>
            <button
              onClick={() => {
                setEditingDepartment(null);
                setFormData({
                  name: '',
                  description: '',
                  stationId: user?.stationId || ''
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Department
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Department Directory</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading departments...</span>
          </div>
        ) : user === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading user information...</span>
          </div>
        ) : !user?.stationId ? (
          <div className="text-center py-12 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold mb-2">No Station Assigned</p>
            <p className="text-gray-500 text-sm">Please contact your administrator to assign a station.</p>
            <p className="text-xs text-gray-400 mt-2">Debug: User = {user ? 'exists' : 'null'}, StationId = {user?.stationId || 'undefined'}</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold mb-2">
              {searchTerm ? 'No departments found matching your search' : 'No departments found'}
            </p>
            {!searchTerm && (
              <>
                <p className="text-gray-500 text-sm mt-2">
                  Get started by creating your first department for {getStationName(user.stationId)}.
                </p>
                <div className="text-xs text-gray-400 mt-2 space-y-1 text-left max-w-md mx-auto">
                  <p><strong>Debug Info:</strong></p>
                  <p>Total departments in store: {departments.length}</p>
                  <p>Admin StationId: {user.stationId || 'undefined'}</p>
                  <p>Transformed departments: {transformedDepartments.length}</p>
                  <p>Filtered departments: {filteredDepartments.length}</p>
                  {departments.length > 0 && (
                    <div className="mt-2">
                      <p><strong>Departments in store:</strong></p>
                      {departments.map((d, idx) => (
                        <p key={idx} className="pl-2">
                          - {d.name || 'Unnamed'}: stationId={String(d.stationId || d.station_id || 'undefined')}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gradient-to-r from-red-500 to-red-600">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors"
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div className="flex items-center gap-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {header.column.getCanSort() && (
                            <span className="text-white/70">
                              {{
                                asc: ' ↑',
                                desc: ' ↓',
                              }[header.column.getIsSorted() as string] ?? ' ↕'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-red-50 transition-all duration-200">
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
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    {editingDepartment ? 'Edit Department' : 'Add New Department'}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Department Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: '' });
                    }}
                    placeholder="e.g., Fire Suppression"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Enter department description"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:bg-red-50/30 focus:outline-none transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Station *</label>
                  <select
                    value={formData.stationId || user?.stationId || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, stationId: e.target.value });
                      setErrors({ ...errors, stationId: '' });
                    }}
                    disabled={isSubmitting || !!user?.stationId}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.stationId ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                    } ${isSubmitting || !!user?.stationId ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                  >
                    {user?.stationId ? (
                      <option value={user.stationId}>
                        {getStationName(user.stationId)}
                      </option>
                    ) : (
                      <>
                        <option value="">Select Station</option>
                        {stations.map((station) => (
                          <option key={station.id || station._id} value={station.id || station._id}>
                            {station.name || station.call_sign || 'Unnamed Station'}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {user?.stationId && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      You can only create departments for your assigned station.
                    </p>
                  )}
                  {errors.stationId && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.stationId}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingDepartment ? 'Update Department' : 'Create Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <Toaster position="top-right" />
    </div>
  );
};

export default DepartmentManagementPage;
