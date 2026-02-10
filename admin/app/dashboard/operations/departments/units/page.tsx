'use client';

import React, { useState, useMemo } from 'react';
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
  Edit,
  Trash2,
  FolderTree,
  Users,
  X,
  AlertTriangle,
  Save,
  Tag,
  Layers
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';

interface Unit {
  id: string;
  name: string;
  color: string;
  department: string;
  groupNames: string[];
  personnelCount: number;
  createdAt?: string;
  updatedAt?: string;
}

// Mock department mapping
const getDepartmentName = (departmentId?: string): string => {
  const departments: Record<string, string> = {
    'dept-1': 'Fire Suppression',
    'dept-2': 'Emergency Medical Services',
    'dept-3': 'Rescue Operations',
    'dept-4': 'Prevention & Safety',
    'dept-5': 'Training & Development',
  };
  return departments[departmentId || ''] || 'Operations Department';
};

interface Group {
  id: string;
  name: string;
  unitId?: string; // Optional: which unit it belongs to
  createdAt?: string;
}

const OperationsUnitsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedUnitForGroup, setSelectedUnitForGroup] = useState<Unit | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const user = useAuthStore((state) => state.user);
  
  const userDepartmentName = getDepartmentName(user?.departmentId);

  // Department-level groups (can be assigned to any unit in the department)
  const [departmentGroups, setDepartmentGroups] = useState<Group[]>([
    { id: 'g1', name: 'Group 1', createdAt: '2024-01-01' },
    { id: 'g2', name: 'Group 2', createdAt: '2024-01-01' },
    { id: 'g3', name: 'Group 3', createdAt: '2024-01-01' },
    { id: 'g4', name: 'Group 4', createdAt: '2024-01-01' },
    { id: 'g5', name: 'Group 5', createdAt: '2024-01-01' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
    selectedGroups: [] as string[]
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Units for this department only
  const [units, setUnits] = useState<Unit[]>([
    {
      id: '1',
      name: 'Unit A',
      color: '#FF0000',
      department: userDepartmentName,
      groupNames: ['Group 1', 'Group 2'],
      personnelCount: 12,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Unit B',
      color: '#00FF00',
      department: userDepartmentName,
      groupNames: ['Group 3'],
      personnelCount: 8,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'Unit C',
      color: '#0000FF',
      department: userDepartmentName,
      groupNames: ['Group 4', 'Group 5'],
      personnelCount: 10,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]);

  // Get available groups for selection
  const availableGroups = departmentGroups.map(g => g.name);

  // Add new group to department
  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    
    // Check if group already exists
    if (departmentGroups.some(g => g.name.toLowerCase() === newGroupName.trim().toLowerCase())) {
      setErrors({ groupName: 'Group with this name already exists' });
      return;
    }

    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: newGroupName.trim(),
      createdAt: new Date().toISOString()
    };

    setDepartmentGroups([...departmentGroups, newGroup]);
    setNewGroupName('');
    setErrors({});
  };

  // Delete group from department
  const handleDeleteGroup = (groupId: string) => {
    const group = departmentGroups.find(g => g.id === groupId);
    if (!group) return;

    // Remove group from all units that have it
    setUnits(units.map(unit => ({
      ...unit,
      groupNames: unit.groupNames.filter(g => g !== group.name)
    })));

    // Remove group from department
    setDepartmentGroups(departmentGroups.filter(g => g.id !== groupId));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Unit name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editingUnit) {
      const groupNames = formData.selectedGroups.map(id => 
        departmentGroups.find(g => g.id === id)?.name || ''
      ).filter(name => name.length > 0);
      
      setUnits(units.map(unit =>
        unit.id === editingUnit.id
          ? {
              ...unit,
              name: formData.name.trim(),
              color: formData.color,
              groupNames: groupNames,
              updatedAt: new Date().toISOString()
            }
          : unit
      ));
    } else {
      const groupNames = formData.selectedGroups.map(id => 
        departmentGroups.find(g => g.id === id)?.name || ''
      ).filter(name => name.length > 0);
      
      const newUnit: Unit = {
        id: (units.length + 1).toString(),
        name: formData.name.trim(),
        color: formData.color,
        department: userDepartmentName,
        groupNames: groupNames,
        personnelCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUnits([...units, newUnit]);
    }

    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingUnit(null);
    setShowGroupModal(false);
    setSelectedUnitForGroup(null);
    setErrors({});
    setFormData({
      name: '',
      color: '#000000',
      selectedGroups: []
    });
  };

  // Toggle group selection for unit
  const toggleGroupSelection = (groupId: string) => {
    setFormData({
      ...formData,
      selectedGroups: formData.selectedGroups.includes(groupId)
        ? formData.selectedGroups.filter(id => id !== groupId)
        : [...formData.selectedGroups, groupId]
    });
  };

  const columns: ColumnDef<Unit>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Unit Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: row.original.color }}
            >
              {row.original.name.charAt(0)}
            </div>
            <div className="font-semibold text-gray-900">{row.original.name}</div>
          </div>
        ),
      },
      {
        accessorKey: 'groupNames',
        header: 'Groups',
        cell: ({ row }) => {
          const groups = row.original.groupNames;
          return (
            <div className="flex flex-wrap gap-2 items-center">
              {groups.length > 0 ? (
                groups.map((group, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200"
                  >
                    {group}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs italic">No groups assigned</span>
              )}
              <button
                onClick={() => {
                  setSelectedUnitForGroup(row.original);
                  setFormData({
                    name: row.original.name,
                    color: row.original.color,
                    selectedGroups: row.original.groupNames.map(gName => 
                      departmentGroups.find(g => g.name === gName)?.id || ''
                    ).filter(id => id.length > 0)
                  });
                  setShowGroupModal(true);
                }}
                className="ml-2 p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Manage Groups"
              >
                <Tag className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: 'personnelCount',
        header: 'Personnel',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-gray-900">{getValue() as number}</span>
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
                  name: row.original.name,
                  color: row.original.color,
                  selectedGroups: row.original.groupNames.map(gName => 
                    departmentGroups.find(g => g.name === gName)?.id || ''
                  ).filter(id => id.length > 0)
                });
                setShowAddModal(true);
              }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Edit Unit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [units, departmentGroups]
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
        unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.groupNames.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, units]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <FolderTree className="w-12 h-12 text-red-600" />
              Manage Units - {userDepartmentName}
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage units and groups within your department
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setNewGroupName('');
                setErrors({});
                // Open group creation (will show modal)
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-600 rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Tag className="w-5 h-5" />
              Manage Groups
            </button>
            <button
              onClick={() => {
                setEditingUnit(null);
                setFormData({
                  name: '',
                  color: '#000000',
                  selectedGroups: []
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

      {/* Controls */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <FolderTree className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Department Units</h2>
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
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No units found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">
                  {editingUnit ? 'Edit Unit' : 'Add New Unit'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: '' });
                    }}
                    placeholder="e.g., Unit D"
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                      errors.name ? 'border-red-300' : 'border-gray-200 focus:border-red-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-12 border-2 border-gray-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Assign Groups</label>
                  {departmentGroups.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-2">No groups available. Create groups first.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          // Will open group management
                        }}
                        className="text-sm text-yellow-700 hover:text-yellow-800 underline font-semibold"
                      >
                        Create Groups
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto border-2 border-gray-200 rounded-lg p-4">
                      {departmentGroups.map((group) => (
                        <label
                          key={group.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedGroups.includes(group.id)}
                            onChange={() => toggleGroupSelection(group.id)}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <span className="flex-1 text-sm font-medium text-gray-900">{group.name}</span>
                          {units.some(u => u.groupNames.includes(group.name)) && (
                            <span className="text-xs text-gray-500">({units.filter(u => u.groupNames.includes(group.name)).length} unit(s))</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Select groups to assign to this unit</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-semibold"
                  >
                    {editingUnit ? 'Update Unit' : 'Create Unit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manage Groups Modal */}
      {showGroupModal && selectedUnitForGroup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">
                  Manage Groups for {selectedUnitForGroup.name}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Add New Group Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Create New Group</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => {
                      setNewGroupName(e.target.value);
                      setErrors({ ...errors, groupName: '' });
                    }}
                    placeholder="Enter group name"
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-300 focus:outline-none"
                  />
                  <button
                    onClick={handleAddGroup}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {errors.groupName && (
                  <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.groupName}
                  </p>
                )}
              </div>

              {/* Assign Groups to Unit */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Assign Groups to Unit</h3>
                {departmentGroups.length === 0 ? (
                  <p className="text-gray-500 text-sm">No groups available. Create groups first.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto border-2 border-gray-200 rounded-lg p-4">
                    {departmentGroups.map((group) => (
                      <label
                        key={group.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedGroups.includes(group.id)}
                          onChange={() => toggleGroupSelection(group.id)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="flex-1 text-sm font-medium text-gray-900">{group.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group.id);
                          }}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const groupNames = formData.selectedGroups.map(id => 
                      departmentGroups.find(g => g.id === id)?.name || ''
                    ).filter(name => name.length > 0);
                    
                    setUnits(units.map(unit =>
                      unit.id === selectedUnitForGroup.id
                        ? { ...unit, groupNames: groupNames, updatedAt: new Date().toISOString() }
                        : unit
                    ));
                    handleCloseModal();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-semibold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Groups Management Section */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Layers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Department Groups</h2>
              <p className="text-sm text-gray-600">Manage groups available for assignment to units</p>
            </div>
          </div>
          <button
            onClick={() => {
              setNewGroupName('');
              setErrors({});
              // Will show create group section
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Group
          </button>
        </div>

        {/* Add New Group Inline */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => {
                setNewGroupName(e.target.value);
                setErrors({ ...errors, groupName: '' });
              }}
              placeholder="Enter new group name"
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-300 focus:outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddGroup();
                }
              }}
            />
            <button
              onClick={handleAddGroup}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          </div>
          {errors.groupName && (
            <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errors.groupName}
            </p>
          )}
        </div>

        {/* Groups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {departmentGroups.map((group) => {
            const assignedUnits = units.filter(u => u.groupNames.includes(group.name));
            return (
              <div
                key={group.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-gray-900">{group.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500">
                      Assigned to {assignedUnits.length} unit(s)
                    </p>
                    {assignedUnits.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {assignedUnits.map(unit => (
                          <span key={unit.id} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {unit.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-2"
                    title="Delete Group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {departmentGroups.length === 0 && (
          <div className="text-center py-12">
            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No groups created yet</p>
            <p className="text-gray-400 text-sm mt-1">Create groups to assign them to units</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationsUnitsPage;

