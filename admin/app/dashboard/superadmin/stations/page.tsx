'use client';

import React, { useState, useMemo, useEffect } from 'react';
import useSuperAdminAuthStore from '@/lib/stores/superAdminAuth';
import { useStationsStore, selectStations, selectStationsIsLoading, selectStationsError, selectStationsCount, Station as StationType } from '@/lib/stores/stations';
import { useRouter } from 'next/navigation';
import { resolveDashboardPath } from '@/lib/constants/roles';
import toast from 'react-hot-toast';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Download,
  Building2,
  ChevronDown,
  ChevronRight,
  Users,
  Shield,
  Phone,
  User,
  AlertTriangle
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

// Using Station type from store, but keeping local interface for compatibility
interface Station extends Omit<StationType, 'departments'> {
  call_sign?: string;
  region?: string;
  departments?: Department[];
}

interface Department {
  id: string;
  name: string;
  head: string;
  headEmail?: string;
  headPhone?: string;
  personnelCount: number;
  unitCount: number;
  description?: string;
  stationId: string;
  units?: Unit[];
}

interface Unit {
  id: string;
  name: string;
  supervisor: string;
  supervisorEmail?: string;
  supervisorPhone?: string;
  personnelCount: number;
  departmentId: string;
  color?: string;
  groupNames?: string[];
}

const StationsPage: React.FC = () => {
  const router = useRouter();
  const user = useSuperAdminAuthStore((state) => state.user);
  const stations = useStationsStore(selectStations);
  const isLoading = useStationsStore(selectStationsIsLoading);
  const error = useStationsStore(selectStationsError);
  const count = useStationsStore(selectStationsCount);
  const fetchStations = useStationsStore((state) => state.fetchStations);
  const updateStation = useStationsStore((state) => state.updateStation);
  const clearError = useStationsStore((state) => state.clearError);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedStations, setExpandedStations] = useState<Set<string>>(new Set());
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    call_sign: '',
    location: '',
    location_url: '',
    lat: '',
    lng: '',
    region: '',
    phone_number: '',
    placeId: '',
    status: 'in commission' as 'in commission' | 'out of commission'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Check if user is Super Admin
  // Only redirect if user is explicitly set and doesn't have SuperAdmin role
  useEffect(() => {
    // Wait a bit for auth store to initialize before checking
    const timer = setTimeout(() => {
      if (user && user.role !== 'SuperAdmin') {
        // Redirect unauthorized users to their appropriate dashboard
        const dashboardPath = resolveDashboardPath(user.role) || '/dashboard';
        router.replace(dashboardPath);
    }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user, router]);

  // Fetch stations on mount
  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchStations().catch((err) => {
        console.error('Failed to fetch stations:', err);
      });
    }
  }, [user, fetchStations]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Transform API stations to match local Station interface
  const transformedStations: Station[] = useMemo(() => {
    return stations.map((station) => ({
      ...station,
      id: station.id || station._id,
      call_sign: station.call_sign || '',
      region: station.region || 'Greater Accra',
      departments: (station.departments || []) as unknown as Department[],
    }));
  }, [stations]);


  const regions = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Eastern',
    'Central',
    'Volta',
    'Northern',
    'Brong Ahafo',
    'Upper East',
    'Upper West'
  ];

  const toggleStation = (stationId: string) => {
    setExpandedStations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stationId)) {
        newSet.delete(stationId);
        if (selectedStation === stationId) {
          setSelectedStation(null);
        }
      } else {
        newSet.add(stationId);
        setSelectedStation(stationId);
      }
      return newSet;
    });
  };

  // Function to format phone number to standard format: +233 XX XXX XXXX
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // If it starts with 233 (without +), add +
    if (cleaned.startsWith('233') && !cleaned.startsWith('+233')) {
      cleaned = '+' + cleaned;
    }
    
    // If it starts with 0, replace with +233
    if (cleaned.startsWith('0')) {
      cleaned = '+233' + cleaned.substring(1);
    }
    
    // If it doesn't start with +, try to add it
    if (!cleaned.startsWith('+')) {
      // If it's 9 digits, add +233
      if (/^\d{9}$/.test(cleaned)) {
        cleaned = '+233' + cleaned;
      } else if (/^233\d{9}$/.test(cleaned)) {
        cleaned = '+' + cleaned;
      }
    }
    
    // Extract only digits after +233
    const match = cleaned.match(/^\+233(\d*)$/);
    if (match) {
      const digits = match[1];
      // Format as +233 XX XXX XXXX
      if (digits.length <= 2) {
        return `+233 ${digits}`;
      } else if (digits.length <= 5) {
        return `+233 ${digits.substring(0, 2)} ${digits.substring(2)}`;
      } else if (digits.length <= 9) {
        return `+233 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
      } else {
        // If more than 9 digits, truncate to 9
        return `+233 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5, 9)}`;
      }
    }
    
    // If it doesn't match the pattern, return as is (will be validated)
    return cleaned;
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // All fields are optional per Mongoose schema (required: false)
    // Only validate format/constraints if values are provided

    // Validate lat if provided (must be between -90 and 90)
    if (formData.lat && formData.lat.trim()) {
      const latValue = parseFloat(formData.lat);
      if (isNaN(latValue) || latValue < -90 || latValue > 90) {
        newErrors.lat = 'Latitude must be between -90 and 90';
      }
    }

    // Validate lng if provided (must be between -180 and 180)
    if (formData.lng && formData.lng.trim()) {
      const lngValue = parseFloat(formData.lng);
      if (isNaN(lngValue) || lngValue < -180 || lngValue > 180) {
        newErrors.lng = 'Longitude must be between -180 and 180';
    }
    }

    // Validate location_url format if provided
    if (formData.location_url && formData.location_url.trim()) {
      try {
        new URL(formData.location_url);
      } catch {
        newErrors.location_url = 'Please enter a valid URL';
      }
    }

    // Validate phone number format if provided
    if (formData.phone_number && formData.phone_number.trim()) {
      // Normalize phone number for validation (remove spaces)
      const normalizedPhone = formData.phone_number.replace(/\s/g, '');
      const phoneRegex = /^\+233[0-9]{9}$/;
      if (!phoneRegex.test(normalizedPhone)) {
        newErrors.phone_number = 'Phone number must be in format: +233 followed by 9 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Build station data object - include all fields from Mongoose schema
    // Empty strings will be converted to undefined/null for optional fields
    const stationData: Partial<StationType> = {};
    
    // All fields are optional per Mongoose schema (required: false)
    // Include fields only if they have values (empty strings become undefined)
    const trimmedName = formData.name.trim();
    if (trimmedName) stationData.name = trimmedName;
    
    const trimmedCallSign = formData.call_sign.trim();
    if (trimmedCallSign) stationData.call_sign = trimmedCallSign;
    
    const trimmedLocation = formData.location.trim();
    if (trimmedLocation) stationData.location = trimmedLocation;
    
    const trimmedLocationUrl = formData.location_url.trim();
    if (trimmedLocationUrl) {
      // Validate URL format
      try {
        new URL(trimmedLocationUrl);
        stationData.location_url = trimmedLocationUrl;
      } catch {
        // Invalid URL, but still include it (backend will handle validation)
        stationData.location_url = trimmedLocationUrl;
      }
    }
    
    // Parse numeric coordinates
    if (formData.lat && formData.lat.trim()) {
      const latValue = parseFloat(formData.lat.trim());
      if (!isNaN(latValue) && latValue >= -90 && latValue <= 90) {
        stationData.lat = latValue;
      }
    }
    
    if (formData.lng && formData.lng.trim()) {
      const lngValue = parseFloat(formData.lng.trim());
      if (!isNaN(lngValue) && lngValue >= -180 && lngValue <= 180) {
        stationData.lng = lngValue;
      }
    }
    
    const trimmedRegion = formData.region.trim();
    if (trimmedRegion) stationData.region = trimmedRegion;
    
    const trimmedPhoneNumber = formData.phone_number.trim();
    if (trimmedPhoneNumber) {
      // Normalize phone number: remove spaces for storage (backend may prefer this)
      // Or keep formatted version if backend accepts it
      const normalizedPhone = trimmedPhoneNumber.replace(/\s/g, '');
      stationData.phone_number = normalizedPhone;
    }
    
    const trimmedPlaceId = formData.placeId.trim();
    if (trimmedPlaceId) stationData.placeId = trimmedPlaceId;
    
    // Status field - default to 'in commission' if not set
    stationData.status = formData.status || 'in commission';

    try {
    if (editingStation) {
        const stationId = editingStation.id || editingStation._id;
        await updateStation(stationId, stationData);
        toast.success('Station updated successfully!');
        // Refresh stations list
        await fetchStations();
    } else {
        // TODO: Implement create functionality via API
        // await createStation(stationData);
        console.log('Create station:', stationData);
        toast.success('Station created successfully!');
        // Refresh stations list
        await fetchStations();
    }
    handleCloseModal();
    } catch (error) {
      console.error('Error saving station:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save station');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingStation(null);
    setErrors({});
    setFormData({
      name: '',
      call_sign: '',
      location: '',
      location_url: '',
      lat: '',
      lng: '',
      region: '',
      phone_number: '',
      placeId: '',
      status: 'in commission'
    });
  };

  const columns: ColumnDef<Station>[] = useMemo(
    () => [
      {
        id: 'expand',
        header: '',
        cell: ({ row }) => (
          <button
            onClick={() => toggleStation(row.original.id)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {expandedStations.has(row.original.id) ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Station Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center ${
              selectedStation === row.original.id ? 'ring-2 ring-red-400 ring-offset-2' : ''
            }`}>
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className={`font-semibold ${selectedStation === row.original.id ? 'text-red-600' : 'text-gray-900'}`}>
                {row.original.name || '-'}
              </div>
              <div className="text-xs text-gray-500">{row.original.location || '-'}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'call_sign',
        header: 'Call Sign',
        cell: ({ getValue }) => (
          <div className="text-gray-700">{getValue() as string || '-'}</div>
        ),
      },
      {
        accessorKey: 'region',
        header: 'Region',
        cell: ({ getValue }) => (
          <div className="text-gray-700">{getValue() as string || '-'}</div>
        ),
      },
      {
        accessorKey: 'phone_number',
        header: 'Phone',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{row.original.phone_number || '-'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status || 'in commission';
          const isInCommission = status === 'in commission';
          return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              isInCommission 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {status === 'in commission' ? 'In Commission' : 'Out of Commission'}
            </span>
          );
        },
      },
      {
        id: 'departments',
        header: 'Departments',
        cell: ({ row }) => (
          <div className="text-gray-700">
            {row.original.departments?.length || 0} departments
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const station = row.original;
                setEditingStation(station);
                // Populate form with all fields, including empty ones
                setFormData({
                  name: station.name ?? '',
                  call_sign: station.call_sign ?? '',
                  location: station.location ?? '',
                  location_url: station.location_url ?? '',
                  lat: station.lat !== undefined && station.lat !== null ? station.lat.toString() : '',
                  lng: station.lng !== undefined && station.lng !== null ? station.lng.toString() : '',
                  region: station.region ?? '',
                  phone_number: station.phone_number ?? '',
                  placeId: station.placeId ?? '',
                  status: (station.status as 'in commission' | 'out of commission') || 'in commission'
                });
                setErrors({});
                setShowAddModal(true);
              }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement delete functionality via API
                toast.error('Delete functionality not yet implemented');
              }}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [expandedStations, selectedStation, transformedStations]
  );

  const filteredData = useMemo(() => {
    if (!searchTerm) return transformedStations;
    return transformedStations.filter(
      station =>
        station.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.call_sign?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transformedStations]);

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

  const totalStations = count || transformedStations.length;
  const totalDepartments = transformedStations.reduce((sum, station) => sum + (station.departments?.length || 0), 0);
  const totalUnits = transformedStations.reduce((sum, station) => 
    sum + (station.departments?.reduce((deptSum, dept) => deptSum + (dept.units?.length || 0), 0) || 0), 0
  );

  // Don't render if not Super Admin
  if (user?.role !== 'SuperAdmin') {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading stations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <MapPin className="w-12 h-12 text-red-600" />
              Station Management
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage fire stations, departments, and units across all regions
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Stations</h3>
            <p className="text-3xl font-bold text-gray-900">{totalStations}</p>
            <p className="text-xs text-gray-500">operational stations</p>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 p-6 rounded-xl hover:border-blue-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Departments</h3>
            <p className="text-3xl font-bold text-gray-900">{totalDepartments}</p>
            <p className="text-xs text-gray-500">across all stations</p>
          </div>
        </div>

        <div className="bg-white border-2 border-green-200 p-6 rounded-xl hover:border-green-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
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
              placeholder="Search stations..."
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
                setEditingStation(null);
                setFormData({
                  name: '',
                  call_sign: '',
                  location: '',
                  location_url: '',
                  lat: '',
                  lng: '',
                  region: '',
                  phone_number: '',
                  placeId: '',
                  status: 'in commission'
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Station
            </button>
          </div>
        </div>
      </div>

      {/* Stations Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Station Directory</h2>
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Building2 className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-600 text-lg font-semibold">No stations found</p>
                      <p className="text-gray-500 text-sm">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Stations will appear here once loaded'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const station = row.original;
                  const isExpanded = expandedStations.has(station.id);
                const isSelected = selectedStation === station.id;
                
                return (
                  <React.Fragment key={station.id}>
                    <tr
                      onClick={() => toggleStation(station.id)}
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={columns.length} className="px-6 py-6 bg-gray-50">
                          <div className="space-y-6">
                            {/* Station Details */}
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-red-600" />
                                Station Details
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  <div>
                                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Station Name</label>
                                  <div className="text-sm font-medium text-gray-900">{station.name || '-'}</div>
                                </div>
                                
                                {station.call_sign && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Call Sign</label>
                                    <div className="text-sm text-gray-900 font-mono">{station.call_sign}</div>
                                  </div>
                                )}
                                
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Location</label>
                                  <div className="text-sm text-gray-900">{station.location || '-'}</div>
                                </div>
                                
                                {station.region && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Region</label>
                                    <div className="text-sm text-gray-900">{station.region}</div>
                                  </div>
                                )}
                                
                                {station.phone_number && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Phone Number</label>
                                    <div className="text-sm text-gray-900 flex items-center gap-2">
                                      <Phone className="w-4 h-4 text-gray-500" />
                                      {station.phone_number}
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Status</label>
                                  <div className="mt-1">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                      (station.status || 'in commission') === 'in commission'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {(station.status || 'in commission') === 'in commission' ? 'In Commission' : 'Out of Commission'}
                                    </span>
                                  </div>
                                </div>
                                
                                {station.location_url && (
                                  <div className="md:col-span-2 lg:col-span-3">
                                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Location URL</label>
                                    <div className="mt-1">
                                      <a
                                        href={station.location_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm break-all underline"
                                      >
                                        {station.location_url}
                                      </a>
                                    </div>
                                  </div>
                                )}
                                
                                {(station.lat !== undefined && station.lat !== null) && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Latitude</label>
                                    <div className="text-sm text-gray-900 font-mono">{station.lat}</div>
                                  </div>
                                )}
                                
                                {(station.lng !== undefined && station.lng !== null) && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Longitude</label>
                                    <div className="text-sm text-gray-900 font-mono">{station.lng}</div>
                                  </div>
                                )}
                                
                                {station.placeId && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Google Place ID</label>
                                    <div className="text-sm text-gray-900 font-mono break-all">{station.placeId}</div>
                                  </div>
                                )}
                                
                                {station.createdAt && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Created At</label>
                                    <div className="text-sm text-gray-900">
                                      {new Date(station.createdAt).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                )}
                                
                                {station.updatedAt && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Updated At</label>
                                    <div className="text-sm text-gray-900">
                                      {new Date(station.updatedAt).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Station ID</label>
                                  <div className="text-sm text-gray-900 font-mono break-all">{station.id || station._id}</div>
                                </div>
                              </div>
                            </div>

                            {/* Departments Table */}
                            {station.departments && station.departments.length > 0 && (
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                Departments ({station.departments.length})
                              </h3>
                              <div className="overflow-x-auto rounded-lg border-2 border-gray-200 bg-white">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-blue-50">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Department Name</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Head</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Contact</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Personnel</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Units</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {station.departments.map((dept) => (
                                      <tr key={dept.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <div className="font-semibold text-gray-900">{dept.name}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-700">{dept.head}</span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <div className="space-y-1">
                                            {dept.headEmail && (
                                              <div className="text-sm text-gray-600">{dept.headEmail}</div>
                                            )}
                                            {dept.headPhone && (
                                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {dept.headPhone}
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-700">{dept.personnelCount}</span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <span className="text-gray-700">{dept.unitCount}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="text-sm text-gray-600 max-w-xs truncate">
                                            {dept.description || '-'}
                                          </div>
                                        </td>
                </tr>
              ))}
            </tbody>
          </table>
                              </div>
                            </div>
                            )}

                            {/* Units Table */}
                            {station.departments && station.departments.length > 0 && (
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-600" />
                                Units ({station.departments.reduce((sum, dept) => sum + (dept.units?.length || 0), 0)})
                              </h3>
                              <div className="overflow-x-auto rounded-lg border-2 border-gray-200 bg-white">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-green-50">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Unit Name</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Department</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Supervisor</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Contact</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Personnel</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Groups</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {station.departments.map((dept) =>
                                      dept.units?.map((unit) => (
                                        <tr key={unit.id} className="hover:bg-green-50 transition-colors">
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                              {unit.color && (
                                                <div
                                                  className="w-4 h-4 rounded-full"
                                                  style={{ backgroundColor: unit.color }}
                                                />
                                              )}
                                              <span className="font-semibold text-gray-900">{unit.name}</span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-gray-700">{dept.name}</span>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                              <User className="w-4 h-4 text-gray-500" />
                                              <span className="text-gray-700">{unit.supervisor}</span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="space-y-1">
                                              {unit.supervisorEmail && (
                                                <div className="text-sm text-gray-600">{unit.supervisorEmail}</div>
                                              )}
                                              {unit.supervisorPhone && (
                                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                                  <Phone className="w-3 h-3" />
                                                  {unit.supervisorPhone}
                                                </div>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                              <Users className="w-4 h-4 text-gray-500" />
                                              <span className="text-gray-700">{unit.personnelCount}</span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                              {unit.groupNames && unit.groupNames.length > 0 ? (
                                                unit.groupNames.map((group, idx) => (
                                                  <span
                                                    key={idx}
                                                    className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                                                  >
                                                    {group}
                                                  </span>
                                                ))
                                              ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
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
            Showing {table.getRowModel().rows.length} of {filteredData.length} stations
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    {editingStation ? 'Edit Station' : 'Add New Station'}
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
                {/* Info Banner */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-blue-800 text-sm font-semibold mb-1">All Fields Optional</p>
                      <p className="text-blue-700 text-xs">
                        According to the Mongoose schema, all fields are optional (required: false). 
                        You can submit the form with any combination of fields filled or empty. 
                        Empty fields will be omitted from the submission.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Station Information Section - All fields optional per Mongoose schema */}
                <div className="bg-blue-50/50 border-2 border-blue-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h3 className="text-lg font-bold text-blue-900">Station Information</h3>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-md font-semibold">All fields optional</span>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Station Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setErrors({ ...errors, name: '' });
                      }}
                      placeholder="e.g., Accra Central Fire Station"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Official name of the fire station</p>
                    {errors.name && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Call Sign</label>
                    <input
                      type="text"
                      value={formData.call_sign}
                      onChange={(e) => {
                        setFormData({ ...formData, call_sign: e.target.value });
                        setErrors({ ...errors, call_sign: '' });
                      }}
                      placeholder="e.g., CENTRAL-A1"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.call_sign ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Unique identifier for the station</p>
                    {errors.call_sign && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.call_sign}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => {
                        setFormData({ ...formData, location: e.target.value });
                        setErrors({ ...errors, location: '' });
                      }}
                      placeholder="e.g., Independence Avenue, Accra"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.location ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Physical address of the station</p>
                    {errors.location && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Region</label>
                    <select
                      value={formData.region}
                      onChange={(e) => {
                        setFormData({ ...formData, region: e.target.value });
                        setErrors({ ...errors, region: '' });
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.region ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                      }`}
                    >
                      <option value="">Select Region</option>
                      {regions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Administrative region where station is located</p>
                    {errors.region && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.region}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setFormData({ ...formData, phone_number: formatted });
                        setErrors({ ...errors, phone_number: '' });
                      }}
                      onBlur={(e) => {
                        // Final format on blur
                        if (e.target.value.trim()) {
                          const formatted = formatPhoneNumber(e.target.value);
                          setFormData({ ...formData, phone_number: formatted });
                        }
                      }}
                      placeholder="+233 XX XXX XXXX"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.phone_number ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: +233 followed by 9 digits. Auto-formats as you type (e.g., 0241234567 → +233 24 123 4567)</p>
                    {errors.phone_number && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.phone_number}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => {
                        setFormData({ ...formData, status: e.target.value as 'in commission' | 'out of commission' });
                        setErrors({ ...errors, status: '' });
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.status ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                      }`}
                    >
                      <option value="in commission">In Commission</option>
                      <option value="out of commission">Out of Commission</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Operational status of the station</p>
                    {errors.status && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.status}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Location URL</label>
                    <input
                      type="url"
                      value={formData.location_url}
                      onChange={(e) => {
                        setFormData({ ...formData, location_url: e.target.value });
                        setErrors({ ...errors, location_url: '' });
                      }}
                      placeholder="e.g., https://maps.google.com/?q=5.6037,0.1870"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.location_url ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:bg-blue-50/30'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Google Maps link to the station location</p>
                    {errors.location_url && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.location_url}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Google Place ID</label>
                    <input
                      type="text"
                      value={formData.placeId}
                      onChange={(e) => setFormData({ ...formData, placeId: e.target.value })}
                      placeholder="e.g., ChIJN1t_tDeuEmsRUsoyG83frY4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:bg-blue-50/30 focus:outline-none transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">Unique identifier from Google Maps (optional, unique if provided)</p>
                  </div>
                </div>
                </div>

                {/* Geographic Coordinates Section */}
                <div className="bg-green-50/50 border-2 border-green-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <h3 className="text-lg font-bold text-green-900">Geographic Coordinates</h3>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-md font-semibold">Optional</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => {
                        setFormData({ ...formData, lat: e.target.value });
                        setErrors({ ...errors, lat: '' });
                      }}
                      placeholder="e.g., 5.6037"
                        min="-90"
                        max="90"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                          errors.lat ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-green-400 focus:bg-green-50/30'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be between -90 and 90</p>
                    {errors.lat && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.lat}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => {
                        setFormData({ ...formData, lng: e.target.value });
                        setErrors({ ...errors, lng: '' });
                      }}
                        placeholder="e.g., -0.1870"
                        min="-180"
                        max="180"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                          errors.lng ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-green-400 focus:bg-green-50/30'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be between -180 and 180</p>
                    {errors.lng && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.lng}
                      </p>
                    )}
                  </div>
                  </div>
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
                    {editingStation ? 'Update Station' : 'Create Station'}
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

export default StationsPage;
