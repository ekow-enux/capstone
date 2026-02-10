'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { 
  Building2, 
  MapPin,
  Search,
  Navigation,
  Flag,
  Droplets,
  Shield,
  Hospital,
  Car,
  School,
  ShoppingBag,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  X,
  Download,
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
  Row,
} from '@tanstack/react-table';

// Unified interfaces that work for both admin and unit dashboards
export interface LocationData {
  id: string;
  name?: string;
  address?: string;
  location?: string; // For landmarks/places of importance
  coordinates: string;
  lat?: number;
  lng?: number;
  type: string;
  distance?: string;
  accessibility?: 'Easy' | 'Moderate' | 'Difficult';
  notes?: string;
  description?: string;
  proximityToStation?: string;
  contact?: string;
  phone?: string;
  // For hydrants
  number?: string;
  status?: 'Operational' | 'Under Maintenance' | 'Out of Service';
  waterPressure?: string;
  lastInspection?: string;
  nextInspection?: string;
}

export interface OutlookPageConfig {
  mode: 'admin' | 'unit';
  showServicesTab?: boolean;
  enableAddEdit?: boolean;
  useLocalStorage?: boolean;
  storageKey?: string;
  title?: string;
  description?: string;
  initialLocations?: LocationData[];
  initialLandmarks?: LocationData[];
  initialServices?: LocationData[];
  initialHydrants?: LocationData[];
}

interface OutlookPageProps {
  config: OutlookPageConfig;
}

const OutlookPage: React.FC<OutlookPageProps> = ({ config }) => {
  const {
    mode,
    showServicesTab = false,
    enableAddEdit = false,
    useLocalStorage = false,
    storageKey = 'outlook-data',
    title = 'Station Outlook',
    description = 'District locations, landmarks, and fire hydrant information',
    initialLocations = [],
    initialLandmarks = [],
    initialServices = [],
    initialHydrants = [],
  } = config;

  // Determine tab type based on mode - use union type to allow all possible tabs
  type TabType = 'locations' | 'landmarks' | 'hydrants' | 'jurisdiction' | 'importance' | 'services';

  const [activeTab, setActiveTab] = useState<TabType>(
    (mode === 'admin' ? 'locations' : 'jurisdiction')
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LocationData | null>(null);
  const [formData, setFormData] = useState<Partial<LocationData>>({});

  // State for storing data
  const [locationsState, setLocationsState] = useState<LocationData[]>(initialLocations);
  const [landmarksState, setLandmarksState] = useState<LocationData[]>(initialLandmarks);
  const [servicesState, setServicesState] = useState<LocationData[]>(initialServices);
  const [hydrantsState, setHydrantsState] = useState<LocationData[]>(initialHydrants);

  // Load from localStorage if enabled
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.locations) setLocationsState(data.locations);
          if (data.landmarks) setLandmarksState(data.landmarks);
          if (data.services) setServicesState(data.services);
          if (data.hydrants) setHydrantsState(data.hydrants);
        } catch (e) {
          console.error('Failed to load saved data:', e);
        }
      }
    }
  }, [useLocalStorage, storageKey]);

  // Save to localStorage if enabled
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined') {
      const data = {
        locations: locationsState,
        landmarks: landmarksState,
        services: servicesState,
        hydrants: hydrantsState,
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  }, [useLocalStorage, storageKey, locationsState, landmarksState, servicesState, hydrantsState]);

  // Filter data based on active tab and search
  const filteredData = useMemo(() => {
    let data: LocationData[] = [];
    
    const tabKey = mode === 'admin' 
      ? (activeTab === 'locations' ? 'locations' : activeTab === 'landmarks' ? 'landmarks' : 'hydrants')
      : (activeTab === 'jurisdiction' ? 'locations' : activeTab === 'importance' ? 'landmarks' : activeTab === 'services' ? 'services' : 'hydrants');

    switch (tabKey) {
      case 'locations':
        data = locationsState;
        break;
      case 'landmarks':
        data = landmarksState;
        break;
      case 'services':
        data = servicesState;
        break;
      case 'hydrants':
        data = hydrantsState;
        break;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter(item => {
        const name = (item.name || item.number || '').toLowerCase();
        const location = item.location?.toLowerCase() || '';
        const address = item.address?.toLowerCase() || '';
        const coordinates = item.coordinates?.toLowerCase() || '';
        const number = item.number?.toLowerCase() || '';
        
        return name.includes(searchLower) ||
          location.includes(searchLower) ||
          address.includes(searchLower) ||
          coordinates.includes(searchLower) ||
          number.includes(searchLower);
      });
    }

    return data;
  }, [activeTab, searchTerm, locationsState, landmarksState, servicesState, hydrantsState, mode]);

  // Get Google Maps URL
  const getGoogleMapsUrl = (lat?: number, lng?: number, coordinates?: string) => {
    if (lat && lng) {
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }
    if (coordinates) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`;
    }
    return null;
  };

  // Column definitions
  const getLocationColumns = (): ColumnDef<LocationData>[] => [
    {
      accessorKey: 'name',
      header: mode === 'admin' ? 'Location Name' : 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="font-medium">{row.original.name || row.original.number || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: mode === 'admin' ? 'address' : 'address',
      header: mode === 'admin' ? 'Address' : 'Address',
      cell: ({ row }) => <span>{row.original.address || row.original.location}</span>,
    },
    {
      accessorKey: 'coordinates',
      header: 'Coordinates',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{row.original.coordinates}</span>
          {getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) && (
            <a
              href={getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type;
        const typeColors: Record<string, string> = {
          Commercial: 'bg-blue-100 text-blue-800',
          Residential: 'bg-green-100 text-green-800',
          Industrial: 'bg-orange-100 text-orange-800',
          Public: 'bg-purple-100 text-purple-800',
          Educational: 'bg-yellow-100 text-yellow-800',
          Other: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[type] || typeColors.Other}`}>
            {type}
          </span>
        );
      },
    },
    ...(mode === 'admin' ? [{
      accessorKey: 'accessibility',
      header: 'Accessibility',
      cell: ({ row }: { row: Row<LocationData> }) => {
        const accessibility = row.original.accessibility;
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            accessibility === 'Easy' ? 'bg-green-100 text-green-800' :
            accessibility === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {accessibility}
          </span>
        );
      },
    }] : [{
      accessorKey: 'distance',
      header: 'Distance',
      cell: ({ row }: { row: Row<LocationData> }) => <span>{row.original.distance}</span>,
    }]),
    ...(mode === 'admin' ? [{
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }: { row: Row<LocationData> }) => <span className="max-w-xs">{row.original.notes}</span>,
    }] : []),
    ...(enableAddEdit ? [{
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Row<LocationData> }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }] : []),
  ];

  const getLandmarkColumns = (): ColumnDef<LocationData>[] => [
    {
      accessorKey: 'name',
      header: mode === 'admin' ? 'Landmark Name' : 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-yellow-500" />
          <span className="font-medium">{row.original.name || row.original.number || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => <span>{row.original.location || row.original.address}</span>,
    },
    {
      accessorKey: 'coordinates',
      header: 'Coordinates',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{row.original.coordinates}</span>
          {getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) && (
            <a
              href={getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: mode === 'admin' ? 'proximityToStation' : 'distance',
      header: 'Distance from Station',
      cell: ({ row }: { row: Row<LocationData> }) => <span>{row.original.distance || row.original.proximityToStation}</span>,
    },
    {
      accessorKey: mode === 'admin' ? 'description' : 'description',
      header: 'Description',
      cell: ({ row }: { row: Row<LocationData> }) => <span className="max-w-xs">{row.original.description}</span>,
    },
    ...(enableAddEdit ? [{
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Row<LocationData> }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }] : []),
  ];

  const getHydrantColumns = (): ColumnDef<LocationData>[] => [
    {
      accessorKey: 'number',
      header: 'Hydrant Number',
      cell: ({ row }) => (
        <div className="font-mono font-semibold">{row.original.number}</div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => <span>{row.original.location || row.original.address}</span>,
    },
    {
      accessorKey: 'coordinates',
      header: 'Coordinates',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{row.original.coordinates}</span>
          {getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) && (
            <a
              href={getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            type === 'Above Ground' ? 'bg-green-100 text-green-800' :
            type === 'Underground' ? 'bg-blue-100 text-blue-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            status === 'Operational' ? 'bg-green-100 text-green-800' :
            status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'waterPressure',
      header: 'Water Pressure',
      cell: ({ row }) => <span>{row.original.waterPressure}</span>,
    },
    ...(mode === 'admin' ? [
      {
        accessorKey: 'lastInspection',
        header: 'Last Inspection',
        cell: ({ row }: { row: Row<LocationData> }) => <span>{row.original.lastInspection}</span>,
      },
      {
        accessorKey: 'nextInspection',
        header: 'Next Inspection',
        cell: ({ row }: { row: Row<LocationData> }) => <span>{row.original.nextInspection}</span>,
      },
    ] : [
      {
        accessorKey: 'distance',
        header: 'Distance',
        cell: ({ row }: { row: Row<LocationData> }) => <span>{row.original.distance}</span>,
      },
      {
        accessorKey: 'lastInspection',
        header: 'Last Inspection',
        cell: ({ row }: { row: Row<LocationData> }) => <span>{row.original.lastInspection}</span>,
      },
      {
        accessorKey: 'nextInspection',
        header: 'Next Inspection',
        cell: ({ row }: { row: Row<LocationData> }) => <span>{row.original.nextInspection}</span>,
      },
    ]),
    ...(enableAddEdit ? [{
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Row<LocationData> }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }] : []),
  ];

  const getServicesColumns = (): ColumnDef<LocationData>[] => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-500" />
          <span className="font-medium">{row.original.name || row.original.number || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => <span>{row.original.location}</span>,
    },
    {
      accessorKey: 'distance',
      header: 'Distance',
      cell: ({ row }) => <span>{row.original.distance}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }: { row: Row<LocationData> }) => <span>{row.original.phone || row.original.contact}</span>,
    },
    ...(enableAddEdit ? [{
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Row<LocationData> }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }] : []),
  ];

  // Get columns based on active tab
  const columns = useMemo(() => {
    const tabKey = mode === 'admin' 
      ? (activeTab === 'locations' ? 'locations' : activeTab === 'landmarks' ? 'landmarks' : 'hydrants')
      : (activeTab === 'jurisdiction' ? 'locations' : activeTab === 'importance' ? 'landmarks' : activeTab === 'services' ? 'services' : 'hydrants');

    switch (tabKey) {
      case 'locations':
        return getLocationColumns();
      case 'landmarks':
        return getLandmarkColumns();
      case 'services':
        return getServicesColumns();
      case 'hydrants':
        return getHydrantColumns();
      default:
        return getLocationColumns();
    }
  }, [activeTab, mode, enableAddEdit]);

  // Create table
  const table = useReactTable<LocationData>({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // CRUD handlers
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setShowAddModal(true);
  };

  const handleEdit = (item: LocationData) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const tabKey = mode === 'admin' 
      ? (activeTab === 'locations' ? 'locations' : activeTab === 'landmarks' ? 'landmarks' : 'hydrants')
      : (activeTab === 'jurisdiction' ? 'locations' : activeTab === 'importance' ? 'landmarks' : activeTab === 'services' ? 'services' : 'hydrants');

    switch (tabKey) {
      case 'locations':
        setLocationsState(prev => prev.filter(p => p.id !== id));
        break;
      case 'landmarks':
        setLandmarksState(prev => prev.filter(p => p.id !== id));
        break;
      case 'services':
        setServicesState(prev => prev.filter(p => p.id !== id));
        break;
      case 'hydrants':
        setHydrantsState(prev => prev.filter(p => p.id !== id));
        break;
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newId = editingItem?.id || `item-${Date.now()}`;
    const newItem: LocationData = {
      ...formData,
      id: newId,
    } as LocationData;

    const tabKey = mode === 'admin' 
      ? (activeTab === 'locations' ? 'locations' : activeTab === 'landmarks' ? 'landmarks' : 'hydrants')
      : (activeTab === 'jurisdiction' ? 'locations' : activeTab === 'importance' ? 'landmarks' : activeTab === 'services' ? 'services' : 'hydrants');

    switch (tabKey) {
      case 'locations':
        if (editingItem) {
          setLocationsState(prev => prev.map(p => p.id === editingItem.id ? newItem : p));
        } else {
          setLocationsState(prev => [...prev, newItem]);
        }
        break;
      case 'landmarks':
        if (editingItem) {
          setLandmarksState(prev => prev.map(p => p.id === editingItem.id ? newItem : p));
        } else {
          setLandmarksState(prev => [...prev, newItem]);
        }
        break;
      case 'services':
        if (editingItem) {
          setServicesState(prev => prev.map(p => p.id === editingItem.id ? newItem : p));
        } else {
          setServicesState(prev => [...prev, newItem]);
        }
        break;
      case 'hydrants':
        if (editingItem) {
          setHydrantsState(prev => prev.map(p => p.id === editingItem.id ? newItem : p));
        } else {
          setHydrantsState(prev => [...prev, newItem]);
        }
        break;
    }
    
    handleCloseModal();
  };

  const currentCount = filteredData.length;
  const tabLabel = mode === 'admin'
    ? (activeTab === 'locations' ? 'Locations' : activeTab === 'landmarks' ? 'Landmarks' : 'Fire Hydrants')
    : (activeTab === 'jurisdiction' ? 'Jurisdiction Places' : activeTab === 'importance' ? 'Places of Importance' : activeTab === 'services' ? 'Sister Services' : 'Hydrant Locations');

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-3">
              {title}
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              {description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <MapPin className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{currentCount}</span>
              <p className="text-gray-500 text-sm">{tabLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        {mode === 'admin' ? (
          <>
            <button
              onClick={() => setActiveTab('locations' as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === 'locations'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
                  : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <Navigation className="w-5 h-5" />
              Locations
            </button>
            <button
              onClick={() => setActiveTab('landmarks' as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === 'landmarks'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
                  : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <Flag className="w-5 h-5" />
              Landmarks
            </button>
            <button
              onClick={() => setActiveTab('hydrants' as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === 'hydrants'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
                  : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <Droplets className="w-5 h-5" />
              Fire Hydrants
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('jurisdiction' as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === 'jurisdiction'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
                  : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <Navigation className="w-5 h-5" />
              Jurisdiction
            </button>
            <button
              onClick={() => setActiveTab('importance' as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === 'importance'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
                  : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <Flag className="w-5 h-5" />
              Importance
            </button>
            {showServicesTab && (
              <button
                onClick={() => setActiveTab('services' as TabType)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  activeTab === 'services'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
                    : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <Shield className="w-5 h-5" />
                Services
              </button>
            )}
            <button
              onClick={() => setActiveTab('hydrants' as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === 'hydrants'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
                  : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <Droplets className="w-5 h-5" />
              Hydrants
            </button>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={`Search ${tabLabel.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
            <Download className="w-5 h-5" />
            Export Data
          </button>
          {enableAddEdit && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add {tabLabel.slice(0, -1)}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-gradient-to-r from-red-500 to-red-600">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header as string | ((props: unknown) => React.ReactNode) | undefined,
                            header.getContext() as any
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, index) => (
                  <tr key={row.id} className={`hover:bg-red-50 transition-all duration-200 border-b border-gray-100 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell as string | ((props: any) => React.ReactNode) | undefined,
                          cell.getContext() as any
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={table.getAllColumns().length} className="px-6 py-8 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {enableAddEdit && showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add New'} {tabLabel.slice(0, -1)}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab !== 'hydrants' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                )}
                {(mode === 'admin' && activeTab === 'locations') || (mode === 'unit' && activeTab === 'jurisdiction') ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat || ''}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng || ''}
                      onChange={(e) => setFormData({ ...formData, lng: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates</label>
                  <input
                    type="text"
                    value={formData.coordinates || ''}
                    onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="e.g. 5.5500°N, 0.2000°W"
                  />
                </div>
                {activeTab === 'hydrants' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hydrant Number</label>
                      <input
                        type="text"
                        value={formData.number || ''}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={formData.type || 'Above Ground'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Above Ground">Above Ground</option>
                          <option value="Underground">Underground</option>
                          <option value="Wall Mounted">Wall Mounted</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={formData.status || 'Operational'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Operational">Operational</option>
                          <option value="Under Maintenance">Under Maintenance</option>
                          <option value="Out of Service">Out of Service</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Water Pressure</label>
                      <input
                        type="text"
                        value={formData.waterPressure || ''}
                        onChange={(e) => setFormData({ ...formData, waterPressure: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. 65 PSI"
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {editingItem ? 'Update' : 'Add'}
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

export default OutlookPage;

