'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
import { useFirePersonnelStore, selectFirePersonnel, selectFirePersonnelIsLoading, selectFirePersonnelError, selectFirePersonnelCount } from '@/lib/stores/firePersonnel';
import { useRanksStore, selectRanks } from '@/lib/stores/ranks';
import { useUnitsStore, selectUnits } from '@/lib/stores/units';
import { useDepartmentsStore, selectDepartments } from '@/lib/stores/departments';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import { useRolesStore, selectRoles } from '@/lib/stores/roles';
import { 
  Flame,
  User,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Shield,
  AlertTriangle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Download,
  Plus,
  TrendingUp,
  X,
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
import Link from 'next/link';

// Using FirePersonnel from store, extending with computed fields for display
type FirePersonnelDisplay = import('@/lib/stores/firePersonnel').FirePersonnel & {
  rankName?: string;
  departmentName?: string;
  unitName?: string;
  stationName?: string;
};

const FirePersonnelPage: React.FC = () => {
  const user = useStationAdminAuthStore((state) => state.user);
  
  const firePersonnel = useFirePersonnelStore(selectFirePersonnel);
  const isLoading = useFirePersonnelStore(selectFirePersonnelIsLoading);
  const error = useFirePersonnelStore(selectFirePersonnelError);
  const count = useFirePersonnelStore(selectFirePersonnelCount);
  const fetchFirePersonnel = useFirePersonnelStore((state) => state.fetchFirePersonnel);
  const createFirePersonnel = useFirePersonnelStore((state) => state.createFirePersonnel);
  const clearError = useFirePersonnelStore((state) => state.clearError);

  const ranks = useRanksStore(selectRanks);
  const fetchRanks = useRanksStore((state) => state.fetchRanks);
  
  const units = useUnitsStore(selectUnits);
  const isLoadingUnits = useUnitsStore((state) => state.isLoading);
  const fetchUnits = useUnitsStore((state) => state.fetchUnits);
  
  const departments = useDepartmentsStore(selectDepartments);
  const isLoadingDepartments = useDepartmentsStore((state) => state.isLoading);
  const departmentsError = useDepartmentsStore((state) => state.error);
  const fetchDepartments = useDepartmentsStore((state) => state.fetchDepartments);

  const stations = useStationsStore(selectStations);
  const fetchStations = useStationsStore((state) => state.fetchStations);

  const roles = useRolesStore(selectRoles);
  const isLoadingRoles = useRolesStore((state) => state.isLoading);
  const fetchRoles = useRolesStore((state) => state.fetchRoles);

  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedUser, setSelectedUser] = useState<FirePersonnelDisplay | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get Admin's station ID
  const adminStationId = user?.stationId || '';

  const [formData, setFormData] = useState({
    serviceNumber: '',
    name: '',
    rank: '', // rankId
    department: '', // departmentId
    unit: '', // unitId (optional)
    role: '', // roleId (optional)
    station_id: adminStationId, // Pre-filled with admin's station
    tempPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch data on mount
  // Departments and units are fetched for the admin's assigned station only
  useEffect(() => {
    if (adminStationId) {
      // Fetch fire personnel for admin's station
      fetchFirePersonnel(adminStationId).catch((err) => {
        console.error('Failed to fetch fire personnel:', err);
        toast.error('Failed to load fire personnel', { icon: '⚠️' });
      });
      
      // Fetch departments for admin's station only
      fetchDepartments(adminStationId).catch((err) => {
        console.error('Failed to fetch departments:', err);
        toast.error('Failed to load departments', { icon: '⚠️' });
      });
      
      // Fetch units for admin's station (explicitly pass stationId)
      fetchUnits(undefined, adminStationId).catch((err) => {
        console.error('Failed to fetch units:', err);
        toast.error('Failed to load units', { icon: '⚠️' });
      });
      
      // Fetch roles (global, not station-specific)
      fetchRoles().catch((err) => {
        console.error('Failed to fetch roles:', err);
      });
    }
    
    // Fetch ranks (global, not station-specific)
    fetchRanks().catch((err) => {
      console.error('Failed to fetch ranks:', err);
    });
    
    // Fetch stations if not already loaded
    if (stations.length === 0) {
      fetchStations().catch((err) => {
        console.error('Failed to fetch stations:', err);
      });
    }
  }, [adminStationId, fetchFirePersonnel, fetchDepartments, fetchRanks, fetchStations, stations.length, fetchUnits]);

  // Show error toast for departments if there's an error
  useEffect(() => {
    if (departmentsError) {
      toast.error(departmentsError, { icon: '⚠️' });
    }
  }, [departmentsError]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Update station_id when adminStationId changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, station_id: adminStationId }));
  }, [adminStationId]);

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

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    // Unit is optional - no validation required

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
      // Prepare data - include department (required) and unit (optional)
      interface CreatePersonnelData {
        serviceNumber: string;
        name: string;
        rank: string;
        department: string;
        role?: string;
        station_id: string;
        tempPassword: string;
        unit?: string;
      }
      const personnelData: CreatePersonnelData = {
        serviceNumber: formData.serviceNumber.trim(),
        name: formData.name.trim(),
        rank: formData.rank, // rankId
        department: formData.department, // departmentId (required)
        role: formData.role || undefined, // roleId (optional)
        station_id: formData.station_id, // Pre-filled with admin's station
        tempPassword: formData.tempPassword,
        ...(formData.unit && selectedDepartmentHasUnits && { unit: formData.unit }), // unitId
      };
      
      await createFirePersonnel(personnelData);
      toast.success(`Officer "${formData.name}" created successfully!`, {
        icon: '✅',
        duration: 3000,
      });
      handleCloseModal();
      // Refresh fire personnel list, departments, and units
      if (adminStationId) {
        await Promise.all([
          fetchFirePersonnel(adminStationId),
          fetchDepartments(adminStationId), // Refresh departments
          fetchUnits(undefined, adminStationId) // Refresh units for admin's station
        ]);
      }
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
      role: '',
      station_id: adminStationId,
      tempPassword: ''
    });
  };

  // Handle department change - clear unit selection when department changes
  const handleDepartmentChange = (departmentId: string) => {
    setFormData({ 
      ...formData, 
      department: departmentId,
      unit: '' // Clear unit when department changes
    });
    setErrors({ ...errors, department: '', unit: '' });
    
    // Refresh units when department changes to get updated list for the selected department and station
    if (departmentId && adminStationId) {
      fetchUnits(departmentId, adminStationId).catch((err) => {
        console.error('Failed to refresh units after department change:', err);
      });
    }
  };

  // Get rank name helper
  const getRankName = (rankId?: string): string => {
    if (!rankId) return '-';
    const rank = ranks.find(r => (r.id || r._id) === rankId);
    return rank?.name || rank?.initials || '-';
  };

  // Get unit name helper
  const getUnitName = (unitId?: string): string => {
    if (!unitId) return '-';
    const unit = units.find(u => (u.id || u._id) === unitId);
    return unit?.name || '-';
  };

  // Get department name helper
  const getDepartmentName = (departmentId?: string): string => {
    if (!departmentId) return '-';
    const department = departments.find(d => (d.id || d._id) === departmentId);
    return department?.name || '-';
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

  // Get admin's station name for display
  const adminStationName = useMemo(() => {
    return getStationName(adminStationId);
  }, [adminStationId, stations]);

  // Get departments for admin's station only
  // This ensures only departments belonging to the admin's assigned station are shown
  const stationDepartments = useMemo(() => {
    if (!adminStationId) {
      console.log('No adminStationId, returning empty departments');
      return [];
    }
    
    console.log('Filtering departments:', {
      adminStationId,
      totalDepartments: departments.length,
      departments: departments.map(d => ({
        id: d.id || d._id,
        name: d.name,
        stationId: d.stationId,
        station_id: d.station_id
      }))
    });
    
    // Filter departments to only show those belonging to the admin's station
    // Handle different stationId formats
    const filtered = departments.filter(dept => {
      // Handle different stationId formats
      let deptStationId: string | undefined;
      
      if (typeof dept.stationId === 'string') {
        deptStationId = dept.stationId;
      } else if (typeof dept.station_id === 'string') {
        deptStationId = dept.station_id;
      } else if (dept.stationId && typeof dept.stationId === 'object') {
        deptStationId = dept.stationId._id || dept.stationId.id;
      } else if (dept.station_id && typeof dept.station_id === 'object') {
        deptStationId = dept.station_id._id || dept.station_id.id;
      }
      
      const matches = String(deptStationId || '').trim() === String(adminStationId).trim();
      
      console.log('Department filter check:', {
        deptName: dept.name,
        deptStationId,
        adminStationId,
        matches
      });
      
      return matches;
    });
    
    console.log('Filtered departments result:', {
      filteredCount: filtered.length,
      filtered: filtered.map(d => ({ id: d.id || d._id, name: d.name }))
    });
    
    return filtered;
  }, [departments, adminStationId]);

  // Filter units based on selected department and admin's station
  // Ensures units only belong to departments under the admin's assigned station
  const filteredUnits = useMemo(() => {
    if (!adminStationId) return [];
    
    // Get department IDs for the admin's station
    const stationDepartmentIds = stationDepartments.map(dept => dept.id || dept._id);
    
    // First filter: Only show units belonging to departments under admin's station
    // This ensures units are scoped to the admin's station
    let availableUnits = units.filter(unit => {
      // Handle different unit department formats
      let unitDeptId: string | undefined;
      
      if (typeof unit.department === 'string') {
        unitDeptId = unit.department;
      } else if (unit.department && typeof unit.department === 'object') {
        unitDeptId = unit.department._id || unit.department.id;
      } else {
        unitDeptId = unit.departmentId;
      }
      
      // Only include units from departments that belong to admin's station
      return unitDeptId && stationDepartmentIds.includes(unitDeptId);
    });

    // Second filter: If a department is selected, show only units from that department
    if (formData.department) {
      availableUnits = availableUnits.filter(unit => {
        // Handle different unit department formats
        let unitDeptId: string | undefined;
        
        if (typeof unit.department === 'string') {
          unitDeptId = unit.department;
        } else if (unit.department && typeof unit.department === 'object') {
          unitDeptId = unit.department._id || unit.department.id;
        } else {
          unitDeptId = unit.departmentId;
        }
        
        return unitDeptId === formData.department;
      });
    }

    return availableUnits;
  }, [units, stationDepartments, adminStationId, formData.department]);

  // Check if selected department has units
  const selectedDepartmentHasUnits = useMemo(() => {
    if (!formData.department) return false;
    return filteredUnits.length > 0;
  }, [formData.department, filteredUnits]);

  // Transform fire personnel to match table format
  const transformedPersonnel = useMemo(() => {
    return firePersonnel
      .filter(personnel => {
        const personnelStationId = extractStationId(personnel.stationId) || extractStationId(personnel.station_id);
        return personnelStationId === adminStationId;
      })
      .map((personnel) => {
        const stationIdStr = extractStationId(personnel.stationId) || extractStationId(personnel.station_id);
        return {
        ...personnel,
        id: personnel.id || personnel._id,
        rankName: getRankName(personnel.rankId),
        departmentName: getDepartmentName(personnel.departmentId),
        unitName: getUnitName(personnel.unitId),
          stationName: getStationName(stationIdStr),
        };
      });
  }, [firePersonnel, adminStationId, ranks, units, departments, stations]);

  const columns: ColumnDef<FirePersonnelDisplay>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Personal Info',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
              {(row.original.name || '').split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.name || '-'}</div>
              <div className="text-xs text-gray-500">{row.original.serviceNumber || '-'}</div>
              {row.original.email && (
                <div className="text-xs text-gray-500">{row.original.email}</div>
              )}
              {row.original.phone && (
                <div className="text-xs text-gray-500">{row.original.phone}</div>
              )}
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
        accessorKey: 'departmentName',
        header: 'Department',
        cell: ({ row }) => (
          <div className="text-gray-900 font-medium">{row.original.departmentName || '-'}</div>
        ),
      },
      {
        accessorKey: 'unitName',
        header: 'Unit',
        cell: ({ row }) => (
          <div className="text-gray-600">{row.original.unitName || '-'}</div>
        ),
      },
      {
        accessorKey: 'stationName',
        header: 'Station',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="text-gray-900 font-medium">{row.original.stationName || '-'}</span>
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
                setSelectedUser(row.original);
                setShowModal(true);
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
              <Trash2 className="w-4 h-4" />
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
          personnel.unitName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchTerm, transformedPersonnel]);

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
              Fire Personnel
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage fire service personnel profiles and incident reports
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

      {/* Controls */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search personnel..."
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
                // Refresh ranks, departments, and units when opening the modal
                if (adminStationId) {
                  // Fetch ranks (global, not station-specific)
                  fetchRanks().catch(err => console.error('Failed to refresh ranks:', err));
                  // Fetch departments for admin's station
                  fetchDepartments(adminStationId).catch(err => console.error('Failed to refresh departments:', err));
                  // Fetch units for admin's station
                  fetchUnits(undefined, adminStationId).catch(err => console.error('Failed to refresh units:', err));
                } else {
                  // Still fetch ranks even if no stationId
                  fetchRanks().catch(err => console.error('Failed to refresh ranks:', err));
                }
                setShowAddModal(true);
              }}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading fire personnel...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
            <Flame className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No personnel found matching your search' : 'No fire personnel found'}
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
        )}

        {/* Pagination */}
        {!isLoading && filteredData.length > 0 && (
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
        )}
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
                    {selectedUser.serviceNumber && (
                      <p className="text-sm text-gray-500">Service #: {selectedUser.serviceNumber}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedUser.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{selectedUser.email}</span>
                    </div>
                  )}
                  {selectedUser.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{selectedUser.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <span className="text-gray-900 font-medium">{selectedUser.stationName || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-900 font-medium">{selectedUser.departmentName || '-'}</span>
                  </div>
                  {selectedUser.unitName && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-800" />
                      <span className="text-gray-900 font-medium">Unit: {selectedUser.unitName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Personnel Modal */}
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
                    <p className="text-sm text-gray-600 mt-1">Fill in the officer details below. Department assignment is required, unit is optional.</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                          errors.serviceNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                          errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      <label className="block text-sm font-bold text-gray-900 mb-2.5">Department *</label>
                      {isLoadingDepartments ? (
                        <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          <span className="text-sm text-gray-500">Loading departments...</span>
                        </div>
                      ) : (
                        <>
                          <select
                            value={formData.department}
                            onChange={(e) => handleDepartmentChange(e.target.value)}
                            disabled={isSubmitting || stationDepartments.length === 0}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                              errors.department ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                            } ${isSubmitting || stationDepartments.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <option value="">Select Department</option>
                            {stationDepartments.length > 0 ? (
                              stationDepartments.map((dept) => (
                                <option key={dept.id || dept._id} value={dept.id || dept._id}>
                                  {dept.name || 'Unnamed Department'}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>No departments available</option>
                            )}
                          </select>
                          {errors.department && (
                            <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {errors.department}
                            </p>
                          )}
                          {stationDepartments.length === 0 && !isLoadingDepartments && adminStationId && (
                            <div className="text-xs text-yellow-600 mt-1.5 space-y-1">
                              <p className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                No departments available for your station.
                              </p>
                              <Link 
                                href="/dashboard/admin/departments"
                                className="text-blue-600 hover:text-blue-800 underline font-semibold flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Create departments here
                              </Link>
                              {departments.length > 0 && (
                                <p className="text-gray-500 mt-1">
                                  Debug: Found {departments.length} department(s) in store, but none match stationId: {adminStationId}
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {formData.department && !selectedDepartmentHasUnits && !isLoadingUnits && (
                      <div className="col-span-1 md:col-span-2">
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-yellow-800 text-sm">
                              The selected department has no units. You can proceed without selecting a unit.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDepartmentHasUnits && (
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2.5">Unit</label>
                        {isLoadingUnits ? (
                          <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            <span className="text-sm text-gray-500">Loading units...</span>
                          </div>
                        ) : (
                          <>
                            <select
                              value={formData.unit}
                              onChange={(e) => {
                                setFormData({ ...formData, unit: e.target.value });
                                setErrors({ ...errors, unit: '' });
                              }}
                              disabled={isSubmitting || filteredUnits.length === 0}
                              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                                errors.unit ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                              } ${isSubmitting || filteredUnits.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <option value="">Select Unit (Optional)</option>
                              {filteredUnits.length > 0 ? (
                                filteredUnits.map((unit) => (
                                  <option key={unit.id || unit._id} value={unit.id || unit._id}>
                                    {unit.name || 'Unnamed Unit'}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>No units available</option>
                              )}
                            </select>
                            {errors.unit && (
                              <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {errors.unit}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Fields Section */}
                <div className="bg-yellow-50/50 border-2 border-yellow-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-yellow-600" />
                    <h3 className="text-lg font-bold text-yellow-900">Optional Information</h3>
                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md font-semibold">Optional</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">Role</label>
                      {isLoadingRoles ? (
                        <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          <span className="text-sm text-gray-500">Loading roles...</span>
                        </div>
                      ) : (
                        <>
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            disabled={isSubmitting || roles.length === 0}
                            className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:bg-red-50/30 focus:outline-none transition-all duration-200 ${
                              isSubmitting || roles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="">Select Role (Optional)</option>
                            {roles.length > 0 ? (
                              roles.map((role) => (
                                <option key={role.id || role._id} value={role.id || role._id}>
                                  {role.name || 'Unnamed Role'}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>No roles available</option>
                            )}
                          </select>
                          <p className="text-xs text-gray-500 mt-1.5">
                            Role assignment is optional
                          </p>
                        </>
                      )}
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
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-red-800 text-sm space-y-1">
                      <p>
                        <strong>Note:</strong> Station Admin can assign department (required) and unit (optional). Role is optional.
                      </p>
                      <p className="text-xs text-red-700">
                        Station is automatically assigned to: <strong>{adminStationName}</strong>
                      </p>
                    </div>
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

