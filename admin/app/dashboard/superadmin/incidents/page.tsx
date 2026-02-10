'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  FileText,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
  Upload,
  TrendingUp,
  Users,
  Activity,
  Eye,
  Calendar,
  Building2,
  User
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
import { Incident } from '@/lib/types/incident';
import { useIncidentsStore, selectIncidents, selectIncidentsIsLoading, selectIncidentsError } from '@/lib/stores/incidents';
import toast, { Toaster } from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';

// Helper function to capitalize first letter
const capitalize = (str: string | undefined | null) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const IncidentReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  // Incidents store
  const incidents = useIncidentsStore(selectIncidents);
  const isLoading = useIncidentsStore(selectIncidentsIsLoading);
  const error = useIncidentsStore(selectIncidentsError);
  const fetchIncidents = useIncidentsStore((state) => state.fetchIncidents);
  const clearError = useIncidentsStore((state) => state.clearError);

  // Fetch incidents on mount and listen for real-time updates
  useEffect(() => {
    fetchIncidents();

    // Listen for real-time incident updates from WebSocket
    const handleNewIncident = (event: CustomEvent) => {
      // Refresh incidents to get the new one
      fetchIncidents();
    };

    const handleIncidentUpdated = (event: CustomEvent) => {
      // Refresh incidents to get updated data
      fetchIncidents();
    };

    const handleIncidentDeleted = (event: CustomEvent) => {
      // Refresh incidents to reflect deletion
      fetchIncidents();
    };

    window.addEventListener('newIncident', handleNewIncident as EventListener);
    window.addEventListener('incidentUpdated', handleIncidentUpdated as EventListener);
    window.addEventListener('incidentDeleted', handleIncidentDeleted as EventListener);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('newIncident', handleNewIncident as EventListener);
      window.removeEventListener('incidentUpdated', handleIncidentUpdated as EventListener);
      window.removeEventListener('incidentDeleted', handleIncidentDeleted as EventListener);
    };
  }, [fetchIncidents]);



  console.log('Incidents:', incidents);
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // TanStack table columns
  const columns: ColumnDef<Incident>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Incident ID',
        cell: ({ row }) => (
          <div className="font-mono text-sm font-semibold text-gray-900">
            #{row.original.id?.slice(-8) || row.original._id?.slice(-8) || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'alertId.incidentName',
        header: 'Title',
        cell: ({ row }) => (
          <div className="font-semibold text-gray-900 max-w-xs truncate">
            {row.original.alertId?.incidentName || 'No Alert Assigned'}
          </div>
        ),
      },
      {
        accessorKey: 'alertId.incidentType',
        header: 'Type',
        cell: ({ row }) => {
          if (!row.original.alertId) {
            return (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                N/A
              </span>
            );
          }
          const type = capitalize(row.original.alertId.incidentType);
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              row.original.alertId.incidentType === 'fire' ? 'bg-red-100 text-red-800' :
              row.original.alertId.incidentType === 'medical' ? 'bg-blue-100 text-blue-800' :
              row.original.alertId.incidentType === 'rescue' ? 'bg-green-100 text-green-800' :
              row.original.alertId.incidentType === 'flood' ? 'bg-cyan-100 text-cyan-800' :
              row.original.alertId.incidentType === 'hazardous' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: 'alertId.priority',
        header: 'Priority',
        cell: ({ row }) => {
          if (!row.original.alertId) {
            return (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                N/A
              </span>
            );
          }
          const priority = capitalize(row.original.alertId.priority);
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              row.original.alertId.priority === 'critical' ? 'bg-red-100 text-red-800' :
              row.original.alertId.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              row.original.alertId.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              row.original.alertId.priority === 'low' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {priority}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = capitalize(row.original.status);
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              row.original.status === 'completed' ? 'bg-green-100 text-green-800' :
              row.original.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
              row.original.status === 'on_scene' ? 'bg-blue-100 text-blue-800' :
              row.original.status === 'en_route' ? 'bg-purple-100 text-purple-800' :
              row.original.status === 'dispatched' ? 'bg-indigo-100 text-indigo-800' :
              row.original.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'alertId.location.locationName',
        header: 'Location',
        cell: ({ row }) => (
          <div className="text-gray-600 max-w-xs truncate" title={row.original.alertId?.location?.locationName || 'No location'}>
            {row.original.alertId?.location?.locationName || 'No Location'}
          </div>
        ),
      },
      {
        accessorKey: 'departmentOnDuty.name',
        header: 'Department',
        cell: ({ row }) => (
          <div className="text-gray-600">
            {row.original.departmentOnDuty?.name || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'unitOnDuty.name',
        header: 'Unit',
        cell: ({ row }) => (
          <div className="text-gray-600">
            {row.original.unitOnDuty?.name || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <div className="text-gray-600 text-sm">{formatDate(row.original.createdAt)}</div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedIncident(row.original);
                setShowIncidentModal(true);
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    let filtered = incidents;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(incident => incident.status === filterStatus.toLowerCase());
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(incident => {
        if (!incident.alertId) return false;
        return capitalize(incident.alertId.incidentType) === filterType;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(incident =>
        incident.alertId?.incidentName?.toLowerCase().includes(searchLower) ||
        incident.alertId?.location?.locationName?.toLowerCase().includes(searchLower) ||
        incident.departmentOnDuty?.name?.toLowerCase().includes(searchLower) ||
        incident.unitOnDuty?.name?.toLowerCase().includes(searchLower) ||
        incident.id?.toLowerCase().includes(searchLower) ||
        incident._id?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [incidents, filterStatus, filterType, searchTerm]);

  const table = useReactTable({
    data: filteredIncidents,
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

  // Calculate metrics
  const totalIncidents = filteredIncidents.length;
  const activeIncidents = filteredIncidents.filter(incident => incident.status === 'active').length;
  const criticalIncidents = filteredIncidents.filter(incident => incident.alertId?.priority === 'critical').length;
  const completedIncidents = filteredIncidents.filter(incident => incident.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-3">
              Incidents
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              View and manage all incidents
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-gray-500 text-sm">{isLoading ? 'Loading...' : 'System Online'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{totalIncidents}</span>
              <p className="text-gray-500 text-sm">Total Incidents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+12%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Incidents</h3>
            <p className="text-3xl font-bold text-gray-900">{totalIncidents}</p>
            <p className="text-xs text-gray-500">all incidents</p>
          </div>
        </div>

        <div className="bg-white border-2 border-yellow-200 p-6 rounded-xl hover:border-yellow-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-yellow-600 font-semibold">{activeIncidents}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active</h3>
            <p className="text-3xl font-bold text-gray-900">{activeIncidents}</p>
            <p className="text-xs text-gray-500">in progress</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-600 font-semibold">{criticalIncidents}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Critical</h3>
            <p className="text-3xl font-bold text-gray-900">{criticalIncidents}</p>
            <p className="text-xs text-gray-500">high priority</p>
          </div>
        </div>

        <div className="bg-white border-2 border-green-200 p-6 rounded-xl hover:border-green-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">{completedIncidents}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed</h3>
            <p className="text-3xl font-bold text-gray-900">{completedIncidents}</p>
            <p className="text-xs text-gray-500">resolved</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="dispatched">Dispatched</option>
              <option value="en_route">En Route</option>
              <option value="on_scene">On Scene</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
            >
              <option value="all">All Types</option>
              <option value="Fire">Fire</option>
              <option value="Medical">Medical</option>
              <option value="Rescue">Rescue</option>
              <option value="Flood">Flood</option>
              <option value="Hazardous">Hazardous</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => fetchIncidents()}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm"
            >
              <Download className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading incidents...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">No incidents found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your filters'
                : 'No incidents have been created yet'}
            </p>
          </div>
        ) : (
          <DataTable
            data={filteredIncidents}
            columns={columns}
            searchTerm={searchTerm}
            searchMessage="No incidents found matching your search"
            sorting={sorting}
            onSortingChange={setSorting}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            table={table}
            headerClassName="bg-gradient-to-r from-red-500 to-red-600 text-white"
          />
        )}
      </div>

      {/* Incident Details Modal */}
      {showIncidentModal && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowIncidentModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">Incident Details</h2>
                <button
                  onClick={() => setShowIncidentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedIncident.alertId?.incidentName || 'Incident (No Alert Assigned)'}
                  </h3>
                  {selectedIncident.alertId && (
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedIncident.alertId.incidentType === 'fire' ? 'bg-red-100 text-red-800' :
                        selectedIncident.alertId.incidentType === 'medical' ? 'bg-blue-100 text-blue-800' :
                        selectedIncident.alertId.incidentType === 'rescue' ? 'bg-green-100 text-green-800' :
                        selectedIncident.alertId.incidentType === 'flood' ? 'bg-cyan-100 text-cyan-800' :
                        selectedIncident.alertId.incidentType === 'hazardous' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {capitalize(selectedIncident.alertId.incidentType)}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedIncident.alertId.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        selectedIncident.alertId.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        selectedIncident.alertId.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {capitalize(selectedIncident.alertId.priority)} Priority
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Status:</span>
                    <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${
                      selectedIncident.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedIncident.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {capitalize(selectedIncident.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Department:</span>
                    <span className="ml-2 text-gray-900">{selectedIncident.departmentOnDuty?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Unit:</span>
                    <span className="ml-2 text-gray-900">{selectedIncident.unitOnDuty?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Created:</span>
                    <span className="ml-2 text-gray-900">{formatDate(selectedIncident.createdAt)}</span>
                  </div>
                </div>

                {selectedIncident.alertId && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Location:</span>
                    <p className="text-gray-900 mt-1">{selectedIncident.alertId.location?.locationName || 'No Location'}</p>
                    {selectedIncident.alertId.location?.locationUrl && (
                      <a
                        href={selectedIncident.alertId.location.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-1 inline-flex items-center gap-1"
                      >
                        <MapPin className="w-4 h-4" />
                        View on Map
                      </a>
                    )}
                  </div>
                )}
                
                {!selectedIncident.alertId && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm font-semibold">⚠️ No Alert Assigned</p>
                    <p className="text-yellow-700 text-sm mt-1">This incident does not have an associated alert.</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 font-semibold">Response Time:</span>
                    <p className="text-gray-900 mt-1">
                      {selectedIncident.responseTimeMinutes !== null 
                        ? `${selectedIncident.responseTimeMinutes} minutes` 
                        : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">Resolution Time:</span>
                    <p className="text-gray-900 mt-1">
                      {selectedIncident.resolutionTimeMinutes !== null 
                        ? `${selectedIncident.resolutionTimeMinutes} minutes` 
                        : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">Total Incident Time:</span>
                    <p className="text-gray-900 mt-1">
                      {selectedIncident.totalIncidentTimeMinutes !== null 
                        ? `${selectedIncident.totalIncidentTimeMinutes} minutes` 
                        : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">Last Updated:</span>
                    <p className="text-gray-900 mt-1">{formatDate(selectedIncident.updatedAt)}</p>
                  </div>
                </div>

                {selectedIncident.alertId && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 font-semibold">Alert Status:</span>
                      <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${
                        selectedIncident.alertId.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        selectedIncident.alertId.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                        selectedIncident.alertId.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedIncident.alertId.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        selectedIncident.alertId.status === 'referred' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {capitalize(selectedIncident.alertId.status)}
                      </span>
                    </div>
                    {selectedIncident.alertId.responseTimeMinutes !== null && (
                      <div>
                        <span className="text-gray-600 font-semibold">Alert Response Time:</span>
                        <p className="text-gray-900 mt-1">{selectedIncident.alertId.responseTimeMinutes} minutes</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentReportsPage;
