'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Badge,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Users,
  Download,
  AlertTriangle,
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
import { useRanksStore, selectRanks, selectRanksIsLoading, selectRanksError, selectRanksCount, Rank } from '@/lib/stores/ranks';
import toast, { Toaster } from 'react-hot-toast';

interface RanksPageProps {
  showGenderField?: boolean; // Admin shows gender, superadmin doesn't
}

const RanksPage: React.FC<RanksPageProps> = ({ showGenderField = false }) => {
  const ranks = useRanksStore(selectRanks);
  const isLoading = useRanksStore(selectRanksIsLoading);
  const error = useRanksStore(selectRanksError);
  const count = useRanksStore(selectRanksCount);
  const fetchRanks = useRanksStore((state) => state.fetchRanks);
  const createRank = useRanksStore((state) => state.createRank);
  const updateRank = useRanksStore((state) => state.updateRank);
  const deleteRank = useRanksStore((state) => state.deleteRank);
  const clearError = useRanksStore((state) => state.clearError);

  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    initials: '',
    level: showGenderField ? '0' : '',
    group: showGenderField ? '' as 'junior' | 'senior' | '' : 'junior' as 'junior' | 'senior',
    gender: '' as 'male' | 'female' | '',
    description: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch ranks on mount
  useEffect(() => {
    fetchRanks().catch((err) => {
      console.error('Failed to fetch ranks:', err);
    });
  }, [fetchRanks]);

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
      newErrors.name = 'Rank name is required';
    }

    if (!formData.initials.trim()) {
      newErrors.initials = 'Rank initials is required';
    } else if (formData.initials.trim().length < 2) {
      newErrors.initials = 'Initials must be at least 2 characters';
    }

    if (!formData.level.trim()) {
      newErrors.level = 'Level is required';
    } else if (isNaN(parseInt(formData.level)) || parseInt(formData.level) < 0) {
      newErrors.level = 'Level must be a non-negative number';
    }

    if (!formData.group) {
      newErrors.group = 'Rank group is required';
    }

    // Gender validation: required only for junior ranks when showGenderField is true
    if (showGenderField && formData.group === 'junior' && !formData.gender) {
      newErrors.gender = 'Gender is required for junior ranks';
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
      const rankData = {
        name: formData.name.trim(),
        initials: formData.initials.trim(),
        level: formData.level ? parseInt(formData.level) : (showGenderField ? 0 : undefined),
        group: formData.group as 'junior' | 'senior',
        gender: showGenderField && formData.group === 'junior' ? (formData.gender as 'male' | 'female' | null) : null,
        description: formData.description.trim()
      };

      if (editingRank) {
        await updateRank(editingRank.id || editingRank._id, rankData);
        toast.success(`Rank "${formData.name}" updated successfully!`, {
          icon: '✅',
          duration: 3000,
        });
      } else {
        await createRank(rankData);
        toast.success(`Rank "${formData.name}" created successfully!`, {
          icon: '✅',
          duration: 3000,
        });
      }
      handleCloseModal();
      await fetchRanks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save rank';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rank? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteRank(id);
      toast.success('Rank deleted successfully!', {
        icon: '✅',
        duration: 3000,
      });
      await fetchRanks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete rank';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowAddModal(false);
    setEditingRank(null);
    setErrors({});
    setFormData({
      name: '',
      initials: '',
      level: showGenderField ? '0' : '',
      group: showGenderField ? '' as 'junior' | 'senior' | '' : 'junior' as 'junior' | 'senior',
      gender: '' as 'male' | 'female' | '',
      description: ''
    });
  };

  // Transform ranks to match table format
  const transformedRanks = useMemo(() => {
    return ranks.map((rank) => ({
      ...rank,
      id: rank.id || rank._id,
      _id: rank._id || rank.id,
    }));
  }, [ranks]);

  const columns: ColumnDef<Rank>[] = useMemo(
    () => {
      const baseColumns: ColumnDef<Rank>[] = [
        {
          accessorKey: 'name',
          header: 'Rank Name',
          cell: ({ row }) => (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Badge className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{row.original.name || '-'}</div>
                <div className="text-xs text-gray-500">{row.original.initials || '-'}</div>
              </div>
            </div>
          ),
        },
        {
          accessorKey: 'level',
          header: 'Level',
          cell: ({ getValue }) => (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-bold rounded-full">
                {getValue() as number ?? 0}
              </span>
            </div>
          ),
        },
      ];

      if (showGenderField) {
        baseColumns.push(
          {
            accessorKey: 'group',
            header: 'Group',
            cell: ({ getValue }) => {
              const group = getValue() as string;
              return (
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  group === 'senior' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {group ? group.charAt(0).toUpperCase() + group.slice(1) : '-'}
                </span>
              );
            },
          },
          {
            accessorKey: 'gender',
            header: 'Gender',
            cell: ({ row }) => {
              const gender = row.original.gender;
              const group = row.original.group;
              if (group === 'senior') {
                return <span className="text-gray-400 text-sm">-</span>;
              }
              return (
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  gender === 'male' 
                    ? 'bg-blue-100 text-blue-800' 
                    : gender === 'female'
                    ? 'bg-pink-100 text-pink-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : '-'}
                </span>
              );
            },
          }
        );
      }

      baseColumns.push(
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
                  setEditingRank(row.original);
                  setFormData({
                    name: row.original.name || '',
                    initials: row.original.initials || '',
                    level: row.original.level?.toString() || (showGenderField ? '0' : ''),
                    group: (row.original.group as 'junior' | 'senior') || (showGenderField ? '' : 'junior'),
                    gender: (row.original.gender as 'male' | 'female' | '') || '',
                    description: row.original.description || ''
                  });
                  setShowAddModal(true);
                }}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                title="Edit Rank"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(row.original.id || row.original._id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Delete Rank"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ),
        }
      );

      return baseColumns;
    },
    [showGenderField]
  );

  // Apply search filter
  const filteredRanks = useMemo(() => {
    if (!searchTerm) return transformedRanks;
    return transformedRanks.filter(
      rank =>
        rank.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rank.initials?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rank.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (showGenderField && rank.group?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (showGenderField && rank.gender?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, transformedRanks, showGenderField]);

  const table = useReactTable({
    data: filteredRanks,
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

  const totalRanks = count || transformedRanks.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <Badge className="w-12 h-12 text-red-600" />
              Fire Service Ranks
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage fire service ranks and hierarchies
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Badge className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Ranks</h3>
            <p className="text-3xl font-bold text-gray-900">{totalRanks}</p>
            <p className="text-xs text-gray-500">defined ranks</p>
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
                placeholder="Search ranks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export
            </button>
            <button
              onClick={() => {
                setEditingRank(null);
                setFormData({
                  name: '',
                  initials: '',
                  level: showGenderField ? '0' : '',
                  group: showGenderField ? '' as 'junior' | 'senior' | '' : 'junior' as 'junior' | 'senior',
                  gender: '' as 'male' | 'female' | '',
                  description: ''
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Rank
            </button>
          </div>
        </div>
      </div>

      {/* Ranks Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Badge className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Rank Structure</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading ranks...</span>
          </div>
        ) : filteredRanks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
            <Badge className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No ranks found matching your search' : 'No ranks found'}
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
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">
                  {editingRank ? 'Edit Rank' : 'Add New Rank'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rank Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: '' });
                    }}
                    placeholder="e.g., Chief Fire Officer"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rank Initials *</label>
                  <input
                    type="text"
                    value={formData.initials}
                    onChange={(e) => {
                      setFormData({ ...formData, initials: e.target.value.toUpperCase() });
                      setErrors({ ...errors, initials: '' });
                    }}
                    placeholder="e.g., CFO"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                      errors.initials ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {errors.initials ? (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.initials}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Automatically converts to uppercase</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
                  <input
                    type="number"
                    value={formData.level}
                    onChange={(e) => {
                      setFormData({ ...formData, level: e.target.value });
                      setErrors({ ...errors, level: '' });
                    }}
                    placeholder="e.g., 1 (default: 0)"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                      errors.level ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {errors.level ? (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.level}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Lower number = higher rank (default: 0)</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rank Group *</label>
                  <select
                    value={formData.group}
                    onChange={(e) => {
                      const newGroup = e.target.value as 'junior' | 'senior' | '';
                      setFormData({ 
                        ...formData, 
                        group: newGroup,
                        gender: showGenderField && newGroup === 'senior' ? '' as 'male' | 'female' | '' : formData.gender
                      });
                      setErrors({ ...errors, group: '', gender: '' });
                    }}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                      errors.group ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {showGenderField && <option value="">Select Group</option>}
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                  </select>
                  {errors.group && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.group}
                    </p>
                  )}
                  {showGenderField && (
                    <p className="text-xs text-gray-500 mt-1">Select whether this is a junior or senior rank</p>
                  )}
                </div>

                {showGenderField && (formData.group === 'junior' || editingRank?.group === 'junior') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => {
                        setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | '' });
                        setErrors({ ...errors, gender: '' });
                      }}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.gender ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-300'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.gender}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Gender is required for junior ranks only</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      setErrors({ ...errors, description: '' });
                    }}
                    rows={3}
                    placeholder="Enter a detailed description of the rank"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors resize-none ${
                      errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingRank ? 'Update Rank' : 'Add Rank'}
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

export default RanksPage;

