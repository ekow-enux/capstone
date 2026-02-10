'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Shield,
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
} from '@tanstack/react-table';
import { useUnitsStore, selectUnits, selectUnitsIsLoading, selectUnitsError, selectUnitsCount, Unit } from '@/lib/stores/units';
import { useDepartmentsStore, selectDepartments } from '@/lib/stores/departments';
import { useUnitAdminsStore, selectUnitAdmins, selectUnitAdminsIsLoading, selectUnitAdminsError, selectUnitAdminsCount } from '@/lib/stores/unitAdmins';
import toast, { Toaster } from 'react-hot-toast';

const UnitsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    tempPassword: '',
    name: '',
    unit_id: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store hooks
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

  const unitAdmins = useUnitAdminsStore(selectUnitAdmins);
  const unitAdminsIsLoading = useUnitAdminsStore(selectUnitAdminsIsLoading);
  const unitAdminsError = useUnitAdminsStore(selectUnitAdminsError);
  const unitAdminsCount = useUnitAdminsStore(selectUnitAdminsCount);
  const fetchUnitAdmins = useUnitAdminsStore((state) => state.fetchUnitAdmins);
  const createUnitAdmin = useUnitAdminsStore((state) => state.createUnitAdmin);
  const updateUnitAdmin = useUnitAdminsStore((state) => state.updateUnitAdmin);
  const deleteUnitAdmin = useUnitAdminsStore((state) => state.deleteUnitAdmin);
  const clearUnitAdminsError = useUnitAdminsStore((state) => state.clearError);

  // Fetch data on mount
  useEffect(() => {
    fetchUnits().catch((err) => {
      console.error('Failed to fetch units:', err);
    });
    fetchDepartments().catch((err) => {
      console.error('Failed to fetch departments:', err);
    });
  }, [fetchUnits, fetchDepartments]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.tempPassword.trim()) {
      newErrors.tempPassword = 'Temporary password is required';
    } else if (formData.tempPassword.length < 6) {
      newErrors.tempPassword = 'Password must be at least 6 characters';
    }

    if (!formData.unit_id) {
      newErrors.unit_id = 'Unit is required';
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
      const unitAdminData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        tempPassword: formData.tempPassword,
        name: formData.name.trim() || undefined,
        unit_id: formData.unit_id,
      };

      await createUnitAdmin(unitAdminData);
      toast.success(`Unit Admin "${formData.username}" created successfully!`, {
        icon: '✅',
        duration: 3000,
      });
      handleCloseModal();
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

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowAddModal(false);
    setEditingUnit(null);
    setErrors({});
    setFormData({
      username: '',
      email: '',
      tempPassword: '',
      name: '',
      unit_id: ''
    });
  };

  // Helper function to get department name
  const getDepartmentName = (department: Unit['department']): string => {
    if (typeof department === 'string') return department;
    return department?.name || 'Unknown Department';
  };

  const columns: ColumnDef<Unit>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Unit Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: row.original.color || '#000000' }}>
              <FolderTree className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.name || '-'}</div>
              <div className="text-xs text-gray-500">{getDepartmentName(row.original.department)}</div>
            </div>
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
                setEditingUnit(row.original);
                setFormData({
                  username: '',
                  email: '',
                  tempPassword: '',
                  name: '',
                  unit_id: row.original.id || row.original._id || ''
                } as any);
                setShowAddModal(true);
              }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this unit?')) {
                  try {
                    await deleteUnit(row.original.id || row.original._id);
                    toast.success('Unit deleted successfully!', {
                      icon: '✅',
                      duration: 3000,
                    });
                  } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to delete unit';
                    toast.error(errorMessage, {
                      icon: '❌',
                      duration: 4000,
                    });
                  }
                }
              }}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [deleteUnit]
  );

  const table = useReactTable({
    data: units,
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
    if (!searchTerm) return units;
    return units.filter(
      unit =>
        (unit.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDepartmentName(unit.department).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, units]);

  const totalUnits = count || units.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Toaster position="top-right" />
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <FolderTree className="w-12 h-12 text-blue-600" />
              Unit Management
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage organizational units and personnel assignments
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border-2 border-blue-200 p-6 rounded-xl hover:border-blue-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FolderTree className="w-6 h-6 text-blue-600" />
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
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-300 focus:outline-none transition-colors"
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
                  username: '',
                  email: '',
                  tempPassword: '',
                  name: '',
                  unit_id: ''
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-600 rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Unit Admin
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
              {filteredData.map((unit, index) => (
                <tr key={unit.id} className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
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
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <FolderTree className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    {editingUnit ? 'Edit Unit Admin' : 'Add New Unit Admin'}
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
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData({ ...formData, username: e.target.value });
                      setErrors({ ...errors, username: '' });
                    }}
                    placeholder="e.g., unit_admin_red"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:bg-blue-50/30'
                    }`}
                  />
                  {errors.username && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors({ ...errors, email: '' });
                    }}
                    placeholder="e.g., admin@red.gov.gh"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:bg-blue-50/30'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:bg-blue-50/30 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Unit *</label>
                  <select
                    value={formData.unit_id}
                    onChange={(e) => {
                      setFormData({ ...formData, unit_id: e.target.value });
                      setErrors({ ...errors, unit_id: '' });
                    }}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.unit_id ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:bg-blue-50/30'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option key={unit.id || unit._id} value={unit.id || unit._id}>
                        {unit.name || 'Unnamed Unit'}
                      </option>
                    ))}
                  </select>
                  {errors.unit_id && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.unit_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Temporary Password *</label>
                  <input
                    type="text"
                    value={formData.tempPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, tempPassword: e.target.value });
                      setErrors({ ...errors, tempPassword: '' });
                    }}
                    placeholder="Enter temporary password"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.tempPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:bg-blue-50/30'
                    }`}
                  />
                  {errors.tempPassword && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.tempPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Department *</label>
                  <select
                    value={formData.unit_id}
                    onChange={(e) => {
                      setFormData({ ...formData, unit_id: e.target.value });
                      setErrors({ ...errors, unit_id: '' });
                    }}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.unit_id ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:bg-blue-50/30'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option key={unit.id || unit._id} value={unit.id || unit._id}>
                        {unit.name || 'Unnamed Unit'}
                      </option>
                    ))}
                  </select>
                  {errors.unit_id && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.unit_id}
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
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
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
