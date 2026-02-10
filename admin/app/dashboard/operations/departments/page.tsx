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
  Building2,
  Users,
  X,
  AlertTriangle,
  Save,
  FolderTree
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';

interface Department {
  id: string;
  name: string;
  description: string;
  unitCount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Unit {
  id: string;
  name: string;
  color: string;
  department: string;
  groupNames: string[];
  personnelCount: number;
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

const OperationsDepartmentPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const user = useAuthStore((state) => state.user);
  
  const userDepartmentName = getDepartmentName(user?.departmentId);

  // Current department data (only their own department)
  const [department, setDepartment] = useState<Department>({
    id: user?.departmentId || '1',
    name: userDepartmentName,
    description: 'Primary firefighting operations and emergency response',
    unitCount: 3,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  });

  // Units for this department
  const [units, setUnits] = useState<Unit[]>([
    {
      id: '1',
      name: 'Unit A',
      color: '#FF0000',
      department: userDepartmentName,
      groupNames: ['Group 1', 'Group 2'],
      personnelCount: 12,
    },
    {
      id: '2',
      name: 'Unit B',
      color: '#00FF00',
      department: userDepartmentName,
      groupNames: ['Group 3'],
      personnelCount: 8,
    },
    {
      id: '3',
      name: 'Unit C',
      color: '#0000FF',
      department: userDepartmentName,
      groupNames: ['Group 4', 'Group 5'],
      personnelCount: 10,
    },
  ]);

  const [formData, setFormData] = useState({
    name: department.name,
    description: department.description
  });

  const [unitFormData, setUnitFormData] = useState({
    name: '',
    color: '#000000',
    groupNames: '',
    addExisting: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Available units that could be added (in production, this would come from API)
  const availableUnits: Unit[] = [
    {
      id: '4',
      name: 'Rescue Unit',
      color: '#FFFF00',
      department: 'Other Department',
      groupNames: ['RES-1'],
      personnelCount: 6,
    },
    {
      id: '5',
      name: 'Medical Unit',
      color: '#FF00FF',
      department: 'Other Department',
      groupNames: ['MED-1'],
      personnelCount: 4,
    }
  ];

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUnitForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!unitFormData.name.trim()) {
      newErrors.name = 'Unit name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setDepartment({
      ...department,
      name: formData.name.trim(),
      description: formData.description.trim(),
      updatedAt: new Date().toISOString()
    });
    setShowEditModal(false);
    setErrors({});
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUnitForm()) {
      return;
    }

    if (unitFormData.addExisting) {
      // Add existing unit
      const existingUnit = availableUnits.find(u => u.name === unitFormData.name);
      if (existingUnit) {
        const updatedUnit = {
          ...existingUnit,
          department: userDepartmentName
        };
        setUnits([...units, updatedUnit]);
        setDepartment({
          ...department,
          unitCount: department.unitCount + 1
        });
      }
    } else {
      // Create new unit
      const groupNames = unitFormData.groupNames
        .split(',')
        .map(g => g.trim())
        .filter(g => g.length > 0);
      
      const newUnit: Unit = {
        id: (units.length + 1).toString(),
        name: unitFormData.name.trim(),
        color: unitFormData.color,
        department: userDepartmentName,
        groupNames: groupNames,
        personnelCount: 0,
      };
      setUnits([...units, newUnit]);
      setDepartment({
        ...department,
        unitCount: department.unitCount + 1
      });
    }

    setShowAddUnitModal(false);
    setErrors({});
    setUnitFormData({
      name: '',
      color: '#000000',
      groupNames: '',
      addExisting: false
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setFormData({
      name: department.name,
      description: department.description
    });
    setErrors({});
  };

  const handleCloseUnitModal = () => {
    setShowAddUnitModal(false);
    setUnitFormData({
      name: '',
      color: '#000000',
      groupNames: '',
      addExisting: false
    });
    setErrors({});
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <Building2 className="w-12 h-12 text-red-600" />
              Department Management
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage your department details and units
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFormData({
                  name: department.name,
                  description: department.description
                });
                setShowEditModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm"
            >
              <Edit className="w-5 h-5" />
              Edit Department
            </button>
            <button
              onClick={() => setShowAddUnitModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Unit
            </button>
          </div>
        </div>
      </div>

      {/* Department Details Card */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Department Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Department Name</label>
            <p className="text-lg font-bold text-gray-900">{department.name}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Count</label>
            <p className="text-lg font-bold text-gray-900">{department.unitCount} units</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <p className="text-gray-600">{department.description}</p>
          </div>
          {department.createdAt && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Created At</label>
              <p className="text-gray-600">{new Date(department.createdAt).toLocaleDateString()}</p>
            </div>
          )}
          {department.updatedAt && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Last Updated</label>
              <p className="text-gray-600">{new Date(department.updatedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Units Section */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 p-2 rounded-lg">
              <FolderTree className="w-6 h-6 text-gray-700" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Department Units</h2>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units
            .filter(unit => 
              unit.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((unit) => (
              <div
                key={unit.id}
                className="border-2 border-gray-200 rounded-xl p-4 hover:border-red-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: unit.color }}
                    >
                      {unit.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{unit.name}</h3>
                      <p className="text-xs text-gray-500">{unit.personnelCount} personnel</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Groups</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {unit.groupNames.map((group, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {units.filter(unit => 
          unit.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).length === 0 && (
          <div className="text-center py-12">
            <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No units found</p>
          </div>
        )}
      </div>

      {/* Edit Department Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">Edit Department</h2>
                <button
                  onClick={handleCloseEditModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateDepartment} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: '' });
                    }}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      setErrors({ ...errors, description: '' });
                    }}
                    rows={4}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                      errors.description ? 'border-red-300' : 'border-gray-200 focus:border-red-300'
                    }`}
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
                    onClick={handleCloseEditModal}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-semibold flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">Add Unit to Department</h2>
                <button
                  onClick={handleCloseUnitModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddUnit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={unitFormData.addExisting}
                      onChange={(e) => setUnitFormData({ ...unitFormData, addExisting: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-700">Add existing unit</span>
                  </label>
                </div>

                {unitFormData.addExisting ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Unit *</label>
                    <select
                      value={unitFormData.name}
                      onChange={(e) => {
                        setUnitFormData({ ...unitFormData, name: e.target.value });
                        setErrors({ ...errors, name: '' });
                      }}
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.name ? 'border-red-300' : 'border-gray-200 focus:border-red-300'
                      }`}
                    >
                      <option value="">Select a unit...</option>
                      {availableUnits.map(unit => (
                        <option key={unit.id} value={unit.name}>{unit.name}</option>
                      ))}
                    </select>
                    {errors.name && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Name *</label>
                      <input
                        type="text"
                        value={unitFormData.name}
                        onChange={(e) => {
                          setUnitFormData({ ...unitFormData, name: e.target.value });
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
                        value={unitFormData.color}
                        onChange={(e) => setUnitFormData({ ...unitFormData, color: e.target.value })}
                        className="w-full h-12 border-2 border-gray-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Group Names (comma separated)</label>
                      <input
                        type="text"
                        value={unitFormData.groupNames}
                        onChange={(e) => setUnitFormData({ ...unitFormData, groupNames: e.target.value })}
                        placeholder="e.g., Group 1, Group 2"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate multiple groups with commas</p>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseUnitModal}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {unitFormData.addExisting ? 'Add Unit' : 'Create Unit'}
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

export default OperationsDepartmentPage;




