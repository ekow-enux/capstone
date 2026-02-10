'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { useRolesStore, selectRoles, selectRolesIsLoading, selectRolesError, selectRolesCount, Role } from '@/lib/stores/roles';
import toast, { Toaster } from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import FormModal from '@/components/ui/FormModal';
import FormField from '@/components/ui/FormField';
import { SortingState, ColumnFiltersState } from '@tanstack/react-table';

const RolesPage: React.FC = () => {
  const roles = useRolesStore(selectRoles);
  const isLoading = useRolesStore(selectRolesIsLoading);
  const error = useRolesStore(selectRolesError);
  const count = useRolesStore(selectRolesCount);
  const fetchRoles = useRolesStore((state) => state.fetchRoles);
  const createRole = useRolesStore((state) => state.createRole);
  const updateRole = useRolesStore((state) => state.updateRole);
  const deleteRole = useRolesStore((state) => state.deleteRole);
  const clearError = useRolesStore((state) => state.clearError);

  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchRoles().catch((err) => {
      console.error('Failed to fetch roles:', err);
    });
  }, [fetchRoles]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Role name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
      if (editingRole) {
        await updateRole(editingRole.id || editingRole._id, {
          name: formData.name.trim(),
          description: formData.description.trim()
        });
        toast.success(`Role "${formData.name}" updated successfully!`, {
          icon: '✅',
          duration: 3000,
        });
      } else {
        await createRole({
          name: formData.name.trim(),
          description: formData.description.trim()
        });
        toast.success(`Role "${formData.name}" created successfully!`, {
          icon: '✅',
          duration: 3000,
        });
      }
      handleCloseModal();
      await fetchRoles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save role';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteRole(id);
      toast.success('Role deleted successfully!', {
        icon: '✅',
        duration: 3000,
      });
      await fetchRoles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete role';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowAddModal(false);
    setEditingRole(null);
    setErrors({});
    setFormData({
      name: '',
      description: ''
    });
  };

  const transformedRoles = useMemo(() => {
    return roles.map((role) => ({
      ...role,
      id: role.id || role._id,
      _id: role._id || role.id,
    }));
  }, [roles]);

  const columns: ColumnDef<Role>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Role Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="font-semibold text-gray-900">{row.original.name || '-'}</div>
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
          <div className="text-gray-600 max-w-md truncate">{getValue() as string || '-'}</div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingRole(row.original);
                setFormData({
                  name: row.original.name || '',
                  description: row.original.description || ''
                });
                setShowAddModal(true);
              }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Edit Role"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original.id || row.original._id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete Role"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const filteredRoles = useMemo(() => {
    if (!searchTerm) return transformedRoles;
    return transformedRoles.filter(
      role =>
        role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transformedRoles]);

  const totalRoles = count || transformedRoles.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <Shield className="w-12 h-12 text-blue-600" />
              Fire Service Roles
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage fire service roles and permissions
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-blue-200 p-6 rounded-xl hover:border-blue-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Roles</h3>
            <p className="text-3xl font-bold text-gray-900">{totalRoles}</p>
            <p className="text-xs text-gray-500">defined roles</p>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search roles..."
        actions={
          <button
            onClick={() => {
              setEditingRole(null);
              setFormData({ name: '', description: '' });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-600 rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Role
          </button>
        }
      />

      {/* Roles Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Role Structure</h2>
        </div>
        <DataTable
          data={filteredRoles}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={searchTerm ? 'No roles found matching your search' : 'No roles found'}
          searchTerm={searchTerm}
          searchMessage="No roles found matching your search"
          sorting={sorting}
          onSortingChange={setSorting}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          headerClassName="bg-gradient-to-r from-blue-500 to-blue-600"
        />
      </div>

      {/* Add/Edit Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title={editingRole ? 'Edit Role' : 'Add New Role'}
        onSubmit={handleSubmit}
        submitLabel={editingRole ? 'Update Role' : 'Add Role'}
        isSubmitting={isSubmitting}
      >
        <FormField label="Role Name" required error={errors.name}>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setErrors({ ...errors, name: '' });
            }}
            placeholder="e.g., Firefighter"
            disabled={isSubmitting}
            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </FormField>

        <FormField label="Description" required error={errors.description}>
          <textarea
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              setErrors({ ...errors, description: '' });
            }}
            rows={3}
            placeholder="Enter a detailed description of the role"
            disabled={isSubmitting}
            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors resize-none ${
              errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </FormField>
      </FormModal>
    </div>
  );
};

export default RolesPage;

