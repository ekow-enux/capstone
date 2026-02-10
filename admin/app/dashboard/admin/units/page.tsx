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
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Users,
  Download,
  AlertTriangle,
  Loader2,
  Shield
} from 'lucide-react';
import { useUnitsStore, selectUnits, selectUnitsIsLoading, selectUnitsError, selectUnitsCount, Unit } from '@/lib/stores/units';
import { useDepartmentsStore, selectDepartments } from '@/lib/stores/departments';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
import toast, { Toaster } from 'react-hot-toast';

const UnitsPage: React.FC = () => {
  const user = useStationAdminAuthStore((state) => state.user);
  const units = useUnitsStore(selectUnits);
  const isLoading = useUnitsStore(selectUnitsIsLoading);
  const error = useUnitsStore(selectUnitsError);
  const count = useUnitsStore(selectUnitsCount);
  const fetchUnits = useUnitsStore((state) => state.fetchUnits);
  const createUnit = useUnitsStore((state) => state.createUnit);
  const updateUnit = useUnitsStore((state) => state.updateUnit);
  const deleteUnit = useUnitsStore((state) => state.deleteUnit);
  const clearError = useUnitsStore((state) => state.clearError);

  const departments = useDepartmentsStore(selectDepartments);
  const fetchDepartments = useDepartmentsStore((state) => state.fetchDepartments);

  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
    department: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch departments on mount
  useEffect(() => {
    const stationId = user?.stationId;
    if (stationId) {
      fetchDepartments(stationId).catch((err) => {
        console.error('Failed to fetch departments:', err);
      });
    }
  }, [user?.stationId, fetchDepartments]);

  // Fetch units on mount
  useEffect(() => {
    const stationId = user?.stationId;
    if (stationId) {
      fetchUnits(undefined, stationId).catch((err) => {
        console.error('Failed to fetch units:', err);
      });
    }
  }, [user?.stationId, fetchUnits]);

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
      newErrors.name = 'Unit name is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
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
      if (editingUnit) {
        await updateUnit(editingUnit.id || editingUnit._id, {
          name: formData.name.trim(),
          color: formData.color || '#000000',
          department: formData.department
        });
        toast.success(`Unit "${formData.name}" updated successfully`, {
          icon: '✅',
          duration: 3000,
        });
      } else {
        await createUnit({
          name: formData.name.trim(),
          color: formData.color || '#000000',
          department: formData.department
        });
        toast.success(`Unit "${formData.name}" created successfully`, {
          icon: '✅',
          duration: 3000,
        });
      }
      handleCloseModal();
      // Refresh units list
      const stationId = user?.stationId;
      if (stationId) {
        await fetchUnits(undefined, stationId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save unit';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUnit(id);
      toast.success('Unit deleted successfully', {
        icon: '✅',
        duration: 3000,
      });
      // Refresh units list
      const stationId = user?.stationId;
      if (stationId) {
        await fetchUnits(undefined, stationId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete unit';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    setShowAddModal(false);
    setEditingUnit(null);
    setErrors({});
    setFormData({
      name: '',
      color: '#000000',
      department: ''
    });
  };

  // Get department name helper
  const getDepartmentName = (departmentId?: string): string => {
    if (!departmentId) return '-';
    const dept = departments.find(d => (d.id || d._id) === departmentId);
    return dept?.name || '-';
  };

  // Transform units to match table format and filter by station
  const transformedUnits = useMemo(() => {
    const adminStationId = user?.stationId;

    if (!adminStationId) {
      return [];
    }

    // Get department IDs that belong to the admin's station
    const stationDepartmentIds = new Set(
      departments
        .filter((dept) => {
          const deptStationId = typeof dept.stationId === 'string'
            ? dept.stationId
            : dept.stationId?._id || dept.stationId?.id || dept.station_id;
          return deptStationId === adminStationId;
        })
        .map((dept) => dept.id || dept._id)
    );

    return units
      .filter((unit) => {
        const unitDepartmentId = typeof unit.department === 'string'
          ? unit.department
          : unit.department?._id || unit.department?.id || unit.departmentId;
        // Only include units whose department belongs to the admin's station
        return unitDepartmentId && stationDepartmentIds.has(unitDepartmentId);
      })
      .map((unit) => ({
        ...unit,
        id: unit.id || unit._id,
        _id: unit._id || unit.id,
        departmentId: typeof unit.department === 'string'
          ? unit.department
          : unit.department?._id || unit.department?.id || unit.departmentId,
        departmentName: getDepartmentName(
          typeof unit.department === 'string'
            ? unit.department
            : unit.department?._id || unit.department?.id || unit.departmentId
        ),
      }));
  }, [units, departments, user?.stationId]);

  const columns: ColumnDef<Unit & { departmentName: string }>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Unit Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center" 
              style={{ backgroundColor: row.original.color || '#000000' }}
            >
              <FolderTree className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.name || '-'}</div>
              <div className="text-xs text-gray-500">{row.original.departmentName || '-'}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'color',
        header: 'Color',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded border-2 border-gray-300" 
              style={{ backgroundColor: row.original.color || '#000000' }}
            />
            <span className="text-sm text-gray-600 font-mono">{row.original.color || '#000000'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'departmentName',
        header: 'Department',
        cell: ({ row }) => (
          <div className="font-medium text-gray-900">{row.original.departmentName || '-'}</div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const unit = row.original;
                setEditingUnit(unit);
                setFormData({
                  name: unit.name || '',
                  color: unit.color || '#000000',
                  department: unit.departmentId || ''
                });
                setShowAddModal(true);
              }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Edit Unit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original.id || row.original._id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete Unit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [departments]
  );

  // Apply search filter
  const filteredUnits = useMemo(() => {
    if (!searchTerm) return transformedUnits;
    return transformedUnits.filter(
      unit =>
        unit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transformedUnits]);

  const table = useReactTable({
    data: filteredUnits,
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

  const totalUnits = count || transformedUnits.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Toaster position="top-right" />
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <Shield className="w-12 h-12 text-red-600" />
              Unit Management
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage organizational units and personnel assignments
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <FolderTree className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Units</h3>
            <p className="text-3xl font-bold text-gray-900">{totalUnits}</p>
            <p className="text-xs text-gray-500">operational units</p>
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
              placeholder="Search units..."
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
                setEditingUnit(null);
                setFormData({
                  name: '',
                  color: '#000000',
                  department: ''
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Unit
            </button>
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <FolderTree className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Unit Directory</h2>
        </div>
        {isLoading || (user?.stationId && units.length === 0 && !error) ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading units...</span>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
            <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No units found matching your search' : 'No units found'}
            </p>
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
                        className="px-6 py-4 text-left text-sm font-black text-white uppercase tracking-wider cursor-pointer hover:bg-red-600"
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
                {table.getRowModel().rows.map((row, index) => (
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <FolderTree className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    {editingUnit ? 'Edit Unit' : 'Add New Unit'}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Unit Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: '' });
                    }}
                    placeholder="e.g., Red Watch, Yellow Watch, Blue Watch"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {errors.name ? (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1.5">Common examples: Red Watch, Yellow Watch, Blue Watch, Green Watch</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      disabled={isSubmitting}
                      className="w-16 h-16 border-2 border-gray-300 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#000000"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:bg-red-50/30 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Default color is black (#000000)</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => {
                      setFormData({ ...formData, department: e.target.value });
                      setErrors({ ...errors, department: '' });
                    }}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.department ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Department</option>
                    {departments
                      .filter((dept) => {
                        // Only show departments that belong to the admin's station
                        const deptStationId = typeof dept.stationId === 'string'
                          ? dept.stationId
                          : dept.stationId?._id || dept.stationId?.id || dept.station_id;
                        return deptStationId === user?.stationId;
                      })
                      .map((dept) => (
                        <option key={dept.id || dept._id} value={dept.id || dept._id}>
                          {dept.name || 'Unnamed Department'}
                        </option>
                      ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.department}
                    </p>
                  )}
                </div>

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
                    {editingUnit ? 'Update Unit' : 'Create Unit'}
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

export default UnitsPage;
