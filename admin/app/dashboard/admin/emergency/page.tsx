'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Phone,
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
  Building2,
  X,
  AlertCircle,
  Eye
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
import { EmergencyAlert } from '@/lib/types/emergencyAlert';
import { useEmergencyAlertsStore, selectEmergencyAlerts, selectEmergencyAlertsIsLoading, selectEmergencyAlertsError } from '@/lib/stores/emergencyAlerts';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
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

const EmergencyResponsePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'station' | 'general'>('station');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  // Get user and station info from auth store
  const user = useStationAdminAuthStore((state) => state.user);
  const stationId = user?.stationId || user?.stationAdminData?.station?._id || user?.stationAdminData?.station?.id;

  // Emergency alerts store
  const alerts = useEmergencyAlertsStore(selectEmergencyAlerts);
  const isLoading = useEmergencyAlertsStore(selectEmergencyAlertsIsLoading);
  const error = useEmergencyAlertsStore(selectEmergencyAlertsError);
  const isConnected = useEmergencyAlertsStore((state) => state.isConnected);
  const fetchAlerts = useEmergencyAlertsStore((state) => state.fetchAlerts);
  const fetchAlertsByStation = useEmergencyAlertsStore((state) => state.fetchAlertsByStation);
  const updateAlert = useEmergencyAlertsStore((state) => state.updateAlert);
  const deleteAlert = useEmergencyAlertsStore((state) => state.deleteAlert);
  const clearError = useEmergencyAlertsStore((state) => state.clearError);

  // Fetch alerts on mount
  useEffect(() => {
    // Fetch initial alerts
    const loadAlerts = async () => {
      try {
        if (activeTab === 'station' && stationId) {
          await fetchAlertsByStation(stationId);
        } else {
          await fetchAlerts();
        }
      } catch (err) {
        toast.error('Failed to load emergency alerts');
      }
    };
    loadAlerts();

    // Note: Global emergency alerts are now handled by GlobalEmergencyAlertHandler
    // No need for page-specific toast notifications

    // Cleanup on unmount
    return () => {
      // Note: WebSocket is now managed globally by GlobalEmergencyAlertHandler
      // No need to disconnect here as it should remain connected for global alerts
    };
  }, [activeTab, stationId, fetchAlerts, fetchAlertsByStation]);

  // Note: Station room joining is now handled globally by GlobalEmergencyAlertHandler

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // TanStack table columns for Emergency Alerts
  const columns: ColumnDef<EmergencyAlert>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Alert ID',
        cell: ({ row }) => (
          <div className="font-mono text-sm font-semibold text-gray-900">
            #{row.original.id?.slice(-8) || row.original._id?.slice(-8) || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="font-semibold text-gray-900">{row.original.title}</div>
        ),
      },
      {
        accessorKey: 'user.name',
        header: 'Reporter',
        cell: ({ row }) => (
          <div className="text-gray-900">
            {row.original.user?.name || 'Unknown'}
          </div>
        ),
      },
      {
        accessorKey: 'user.phone',
        header: 'Phone',
        cell: ({ row }) => (
          <div className="text-gray-600 font-mono text-sm">
            {row.original.user?.phone || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'alertType',
        header: 'Type',
        cell: ({ row }) => {
          const type = capitalize(row.original.alertType);
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              row.original.alertType === 'fire' ? 'bg-red-100 text-red-800' :
              row.original.alertType === 'medical' ? 'bg-blue-100 text-blue-800' :
              row.original.alertType === 'rescue' ? 'bg-green-100 text-green-800' :
              row.original.alertType === 'flood' ? 'bg-cyan-100 text-cyan-800' :
              row.original.alertType === 'hazardous' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
          const priority = capitalize(row.original.priority);
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              row.original.priority === 'critical' ? 'bg-red-100 text-red-800' :
              row.original.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              row.original.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              row.original.priority === 'low' ? 'bg-green-100 text-green-800' :
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
              row.original.status === 'accepted' ? 'bg-green-100 text-green-800' :
              row.original.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
              row.original.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              row.original.status === 'rejected' ? 'bg-red-100 text-red-800' :
              row.original.status === 'referred' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'location.locationName',
        header: 'Location',
        cell: ({ row }) => (
          <div className="text-gray-600 max-w-xs truncate" title={row.original.location.locationName}>
            {row.original.location.locationName}
          </div>
        ),
      },
      {
        accessorKey: 'station.name',
        header: 'Station',
        cell: ({ row }) => (
          <div className="text-gray-600 text-sm">
            {row.original.station?.name || 'Unassigned'}
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
                setSelectedAlert(row.original);
                setShowAlertModal(true);
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to delete this alert?')) {
                  const success = await deleteAlert(row.original.id || row.original._id);
                  if (success) {
                    toast.success('Alert deleted successfully');
                  }
                }
              }}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
              title="Delete Alert"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [deleteAlert]
  );

  // Filter alerts based on active tab and filters
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(alert => alert.status === filterStatus.toLowerCase());
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(alert => 
        capitalize(alert.priority) === filterPriority
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchLower) ||
        alert.message.toLowerCase().includes(searchLower) ||
        alert.location.locationName.toLowerCase().includes(searchLower) ||
        alert.station?.name?.toLowerCase().includes(searchLower) ||
        alert.user?.name?.toLowerCase().includes(searchLower) ||
        alert.user?.phone?.toLowerCase().includes(searchLower) ||
        (alert.description || '').toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [alerts, filterStatus, filterPriority, searchTerm]);

  const table = useReactTable({
    data: filteredAlerts,
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

  // Calculate metrics based on filtered data
  const activeAlerts = filteredAlerts.filter(alert => alert.status === 'active').length;
  const criticalAlerts = filteredAlerts.filter(alert => alert.priority === 'critical').length;
  const resolvedAlerts = filteredAlerts.filter(alert => alert.status === 'accepted').length;
  const totalAlerts = filteredAlerts.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-3">
              Emergency Alerts
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage and monitor emergency alerts
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span className="text-gray-500 text-sm">{isLoading ? 'Loading...' : 'System Online'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-gray-500 text-sm">{isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{activeAlerts}</span>
              <p className="text-gray-500 text-sm">Active Alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+12%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Alerts</h3>
            <p className="text-3xl font-bold text-gray-900">{activeAlerts}</p>
            <p className="text-xs text-gray-500">currently active</p>
          </div>
        </div>

        <div className="bg-white border-2 border-orange-200 p-6 rounded-xl hover:border-orange-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-600 font-semibold">Urgent</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Critical Alerts</h3>
            <p className="text-3xl font-bold text-gray-900">{criticalAlerts}</p>
            <p className="text-xs text-gray-500">require immediate attention</p>
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
                <span className="text-xs text-green-600 font-semibold">{resolvedAlerts}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Resolved</h3>
            <p className="text-3xl font-bold text-gray-900">{resolvedAlerts}</p>
            <p className="text-xs text-gray-500">alerts resolved</p>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 p-6 rounded-xl hover:border-blue-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-semibold">Total</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Alerts</h3>
            <p className="text-3xl font-bold text-gray-900">{totalAlerts}</p>
            <p className="text-xs text-gray-500">all alerts</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab('station')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            activeTab === 'station'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
            Station Alerts
        </button>
        <button
          onClick={() => setActiveTab('general')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            activeTab === 'general'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
            All Alerts
        </button>
      </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search alerts by title, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none transition-colors"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="referred">Referred</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none transition-colors"
          >
            <option value="all">All Priority</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        
        {/* Alerts Table */}
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading emergency alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-semibold">No emergency alerts found</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No alerts have been created yet'}
              </p>
            </div>
          ) : (
            <DataTable
              data={filteredAlerts}
              columns={columns}
              searchTerm={searchTerm}
              searchMessage="No alerts found matching your search"
              sorting={sorting}
              onSortingChange={setSorting}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
              table={table}
              headerClassName="bg-gradient-to-r from-red-500 to-red-600 text-white"
            />
          )}
        </div>
      </div>

      {/* Alert Details Modal */}
      {showAlertModal && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAlertModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">Alert Details</h2>
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
          </button>
        </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedAlert.title}</h3>
                  <p className="text-gray-600">{selectedAlert.message}</p>
      </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Type:</span>
                    <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${
                      selectedAlert.alertType === 'fire' ? 'bg-red-100 text-red-800' :
                      selectedAlert.alertType === 'medical' ? 'bg-blue-100 text-blue-800' :
                      selectedAlert.alertType === 'rescue' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {capitalize(selectedAlert.alertType)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Priority:</span>
                    <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${
                      selectedAlert.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      selectedAlert.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      selectedAlert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {capitalize(selectedAlert.priority)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Status:</span>
                    <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${
                      selectedAlert.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      selectedAlert.status === 'referred' ? 'bg-blue-100 text-blue-800' :
                      selectedAlert.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {capitalize(selectedAlert.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Station:</span>
                    <span className="ml-2 text-gray-900">{selectedAlert.station?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-semibold text-gray-600">Location:</span>
                  <p className="text-gray-900 mt-1">{selectedAlert.location.locationName}</p>
                  {selectedAlert.location.locationUrl && (
                    <a
                      href={selectedAlert.location.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-1 inline-flex items-center gap-1"
                    >
                      <MapPin className="w-4 h-4" />
                      View on Map
                    </a>
                  )}
        </div>

                {selectedAlert.description && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Description:</span>
                    <p className="text-gray-900 mt-1">{selectedAlert.description}</p>
      </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <p className="text-gray-900">{formatDate(selectedAlert.createdAt)}</p>
                  </div>
                  {selectedAlert.acknowledgedAt && (
                    <div>
                      <span className="text-gray-600">Acknowledged:</span>
                      <p className="text-gray-900">{formatDate(selectedAlert.acknowledgedAt)}</p>
                    </div>
                  )}
                  {selectedAlert.resolvedAt && (
                    <div>
                      <span className="text-gray-600">Resolved:</span>
                      <p className="text-gray-900">{formatDate(selectedAlert.resolvedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyResponsePage;
