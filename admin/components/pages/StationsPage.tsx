'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStationsStore, selectStations, selectStationsIsLoading, selectStationsError, selectStationsCount, Station as StationType } from '@/lib/stores/stations';
import {
  MapPin,
  Search,
  Download,
  Phone,
  Building2,
  Loader2,
  Navigation,
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
import toast from 'react-hot-toast';

// Use Station type from store
interface Station extends StationType {
  call_sign?: string;
  region?: string;
}

export interface StationsPageConfig {
  viewMode: 'table' | 'grid';
  enableEdit?: boolean;
  enableDelete?: boolean;
  showMetrics?: boolean;
  title?: string;
  description?: string;
}

interface StationsPageProps {
  config: StationsPageConfig;
}

const StationsPage: React.FC<StationsPageProps> = ({ config }) => {
  const {
    viewMode = 'table',
    enableEdit = false,
    enableDelete = false,
    showMetrics = false,
    title = 'Fire Stations',
    description = 'View all fire stations',
  } = config;

  const stations = useStationsStore(selectStations);
  const isLoading = useStationsStore(selectStationsIsLoading);
  const error = useStationsStore(selectStationsError);
  const count = useStationsStore(selectStationsCount);
  const fetchStations = useStationsStore((state) => state.fetchStations);
  const clearError = useStationsStore((state) => state.clearError);

  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Fetch stations on mount
  useEffect(() => {
    if (stations.length === 0 && !isLoading) {
      fetchStations().catch((err) => {
        console.error('Failed to fetch stations:', err);
        toast.error('Failed to load stations');
      });
    }
  }, [stations.length, isLoading, fetchStations]);

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
      call_sign: station.call_sign,
      region: station.region,
    }));
  }, [stations]);

  // Apply search filter to stations
  const filteredStations = useMemo(() => {
    if (!searchTerm) return transformedStations;
    return transformedStations.filter(
      station =>
        station.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.call_sign?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.phone_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transformedStations]);

  // Table columns
  const columns: ColumnDef<Station>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Station Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.name || '-'}</div>
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
        cell: ({ row }) => (
          <div className="text-gray-700">{row.original.region || '-'}</div>
        ),
      },
      {
        accessorKey: 'phone_number',
        header: 'Phone',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-red-600" />
            <span className="text-gray-700">{row.original.phone_number || '-'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'location_url',
        header: 'Map Location',
        cell: ({ row }) => {
          const url = row.original.location_url;
          if (!url) return <span className="text-gray-400">-</span>;
          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              View Map
            </a>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredStations,
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

  const totalStations = count || transformedStations.length;

  if (viewMode === 'grid') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search stations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stations Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading stations...</p>
          </div>
        ) : filteredStations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map((station) => (
              <div
                key={station._id || station.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                      {station.name || 'Unknown Station'}
                    </h3>
                    <div className="space-y-2">
                      {station.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {station.location}
                        </p>
                      )}
                      {station.phone_number && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {station.phone_number}
                        </p>
                      )}
                      {station.region && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Region: {station.region}
                        </p>
                      )}
                      {station.call_sign && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Call Sign: {station.call_sign}
                        </p>
                      )}
                    </div>
                    {station.location_url && (
                      <a
                        href={station.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                      >
                        <Navigation className="w-4 h-4" />
                        View on Map
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No stations found matching your search' : 'No stations found'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Table view
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <MapPin className="w-12 h-12 text-red-600" />
              {title}
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
        </div>
      )}

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
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Station Directory</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading stations...</span>
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No stations found matching your search' : 'No stations found'}
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
                        className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors"
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
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-red-50 transition-all duration-200">
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
    </div>
  );
};

export default StationsPage;

