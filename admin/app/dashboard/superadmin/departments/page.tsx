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
import { useDepartmentAdminsStore, selectDepartmentAdmins, selectDepartmentAdminsIsLoading, selectDepartmentAdminsError, selectDepartmentAdminsCount } from '@/lib/stores/departmentAdmins';
import toast, { Toaster } from 'react-hot-toast';

const DepartmentManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    tempPassword: '',
    name: '',
    department_id: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store hooks
  const departments = useDepartmentsStore(selectDepartments);
  const isLoading = useDepartmentsStore(selectDepartmentsIsLoading);
  const error = useDepartmentsStore(selectDepartmentsError);
  const count = useDepartmentsStore(selectDepartmentsCount);
  const fetchDepartments = useDepartmentsStore((state) => state.fetchDepartments);
  const createDepartment = useDepartmentsStore((state) => state.createDepartment);
  const updateDepartment = useDepartmentsStore((state) => state.updateDepartment);
  const deleteDepartment = useDepartmentsStore((state) => state.deleteDepartment);
  const clearError = useDepartmentsStore((state) => state.clearError);

  const departmentAdmins = useDepartmentAdminsStore(selectDepartmentAdmins);
  const departmentAdminsIsLoading = useDepartmentAdminsStore(selectDepartmentAdminsIsLoading);
  const departmentAdminsError = useDepartmentAdminsStore(selectDepartmentAdminsError);
  const departmentAdminsCount = useDepartmentAdminsStore(selectDepartmentAdminsCount);
  const fetchDepartmentAdmins = useDepartmentAdminsStore((state) => state.fetchDepartmentAdmins);
  const createDepartmentAdmin = useDepartmentAdminsStore((state) => state.createDepartmentAdmin);
  const updateDepartmentAdmin = useDepartmentAdminsStore((state) => state.updateDepartmentAdmin);
  const deleteDepartmentAdmin = useDepartmentAdminsStore((state) => state.deleteDepartmentAdmin);
  const clearDepartmentAdminsError = useDepartmentAdminsStore((state) => state.clearError);

  // Fetch data on mount
  useEffect(() => {
    fetchDepartments().catch((err) => {
      console.error('Failed to fetch departments:', err);
    });
  }, [fetchDepartments]);

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

    if (!formData.department_id) {
      newErrors.department_id = 'Department is required';
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
      const departmentAdminData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        tempPassword: formData.tempPassword,
        name: formData.name.trim() || undefined,
        department_id: formData.department_id,
      };

      await createDepartmentAdmin(departmentAdminData);
      toast.success(`Department Admin "${formData.username}" created successfully!`, {
        icon: '✅',
        duration: 3000,
      });

      handleCloseModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create department admin';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingDepartment(null);
    setErrors({});
    setFormData({
      username: '',
      email: '',
      tempPassword: '',
      name: '',
      department_id: ''
    });
  };

  const columns: ColumnDef<Department>[] = useMemo(
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
              <div className="font-semibold text-gray-900">{row.getValue('name')}</div>
              <div className="text-xs text-gray-500">{row.original.description}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'unitCount',
        header: 'Units',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
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
                setFormData({
                  username: '',
                  email: '',
                  tempPassword: '',
                  name: '',
                  department_id: row.original.id || row.original._id || ''
                } as any);
                setShowAddModal(true);
              }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this department?')) {
                  try {
                    await deleteDepartment(row.original.id || row.original._id);
                    toast.success('Department deleted successfully!', {
                      icon: '✅',
                      duration: 3000,
                    });
                  } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to delete department';
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
    [departments]
  );

  const table = useReactTable({
    data: departments,
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
    if (!searchTerm) return departments;
    return departments.filter(
      dept =>
        (dept.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, departments]);

  const totalDepartments = count || departments.length;
  const totalUnits = departments.reduce((sum, d) => sum + (d.unitCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Toaster position="top-right" />
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
                  username: '',
                  email: '',
                  tempPassword: '',
                  name: '',
                  department_id: ''
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Department Admin
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
              {filteredData.map((dept, index) => (
                <tr key={dept.id} className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
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
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    {editingDepartment ? 'Edit Department Admin' : 'Add New Department Admin'}
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
                    placeholder="e.g., dept_admin_fire"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
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
                    placeholder="e.g., admin@fire.gov.gh"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:bg-red-50/30 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Department *</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => {
                      setFormData({ ...formData, department_id: e.target.value });
                      setErrors({ ...errors, department_id: '' });
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.department_id ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id || dept._id} value={dept.id || dept._id}>
                        {dept.name || 'Unnamed Department'}
                      </option>
                    ))}
                  </select>
                  {errors.department_id && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.department_id}
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
                      errors.tempPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                    }`}
                  />
                  {errors.tempPassword && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.tempPassword}
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
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    {editingDepartment ? 'Update Department Admin' : 'Create Department Admin'}
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

export default DepartmentManagementPage;
