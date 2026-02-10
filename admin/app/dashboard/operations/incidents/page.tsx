'use client';

import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  FileText,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  TrendingUp,
  Eye,
  Calendar,
  Flame,
  Clock3,
  Edit,
  X,
  Ban,
  MessageSquare,
  Save
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
import { useAuthStore } from '@/lib/stores/auth';
import { STATION_IDS } from '@/lib/types/station';

interface IncidentReport {
  id: string;
  incidentNumber: string;
  title: string;
  type: 'Fire' | 'Medical Emergency' | 'Rescue' | 'Hazardous Material' | 'Vehicle Accident' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'Under Review' | 'Approved' | 'Rejected' | 'Closed' | 'Request Corrections';
  location: string;
  reportedBy: string;
  assignedTo: string;
  station: string;
  reportedAt: string;
  occurredAt: string;
  description: string;
  casualties: number;
  injuries: number;
  fatalities: number;
  propertyDamage: 'None' | 'Minor' | 'Moderate' | 'Major' | 'Severe';
  responseTime: number;
  resolutionTime: number;
  // 24-hour report fields
  dayAndDate?: string;
  timeOfCall?: string;
  timeDispatched?: string;
  timeAtScene?: string;
  methodOfCall?: string;
  addressOfFire?: string;
  drivenBy?: string;
  natureOfFire?: string;
  fireInProgress?: boolean;
  causeOfFire?: string;
  damage?: string;
  casualty?: string;
  timeAtBase?: string;
  oic?: string;
  watch?: string;
}

// Helper to get station name from ID
const getStationName = (stationId?: string): string => {
  if (!stationId) return 'Accra Central'; // Default
  const stationMap: Record<string, string> = {
    [STATION_IDS.ACCRA_CENTRAL]: 'Accra Central',
    [STATION_IDS.ACCRA_CITY]: 'Accra City',
    [STATION_IDS.ACCRA_REGIONAL_HQ]: 'Accra Regional HQ',
    [STATION_IDS.AMAMORLEY]: 'Amamorley',
    [STATION_IDS.ANYAA]: 'Anyaa',
    [STATION_IDS.DANSONAN]: 'Dansoman',
    [STATION_IDS.FIRE_ACADEMY]: 'Fire Academy',
    [STATION_IDS.ADENTA]: 'Adenta',
    [STATION_IDS.GHANA_HQ]: 'Ghana HQ',
    [STATION_IDS.UG_STATION]: 'UG Station',
    [STATION_IDS.MADINA]: 'Madina',
    [STATION_IDS.NATIONAL_FIRE_SERVICE]: 'National Fire Service',
    [STATION_IDS.MILE_11]: 'Mile 11',
    [STATION_IDS.CIRCLE]: 'Circle',
    [STATION_IDS.AMASAMAN]: 'Amasaman',
    [STATION_IDS.MOTORWAY]: 'Motorway',
    [STATION_IDS.WEST_MUNICIPAL]: 'West Municipal',
    [STATION_IDS.TESHIE]: 'Teshie',
    [STATION_IDS.WEIJA]: 'Weija',
  };
  return stationMap[stationId] || 'Accra Central';
};

// Mock data - initial incidents (defined outside component)
const initialIncidentReports: IncidentReport[] = [
    {
      id: '1',
      incidentNumber: 'INC-2024-001',
      title: 'Building Fire - Accra Central Market',
      type: 'Fire',
      severity: 'Critical',
      status: 'Approved',
      location: 'Accra Central Market, Accra',
      reportedBy: 'John Doe',
      assignedTo: 'Station Commander A1',
      station: 'Accra Central',
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 - 5 * 60 * 1000).toISOString(),
    description: 'Multi-story building fire with heavy smoke and flames visible',
      casualties: 0,
      injuries: 3,
      fatalities: 0,
      propertyDamage: 'Major',
      responseTime: 8,
      resolutionTime: 120
    },
    {
      id: '2',
      incidentNumber: 'INC-2024-002',
      title: 'Vehicle Accident - Ring Road',
      type: 'Vehicle Accident',
      severity: 'High',
      status: 'Under Review',
      dayAndDate: 'THURSDAY, 30th October, 2025',
      timeOfCall: '1027hours',
      timeDispatched: '1028hours',
      timeAtScene: '1031hours',
      methodOfCall: 'Telephone Call',
      addressOfFire: 'Legon Police Station Near The Bus Stop',
      drivenBy: 'RFM NeeQuaye',
      natureOfFire: 'Vehicular Fire',
      fireInProgress: true,
      causeOfFire: 'Under investigation',
      damage: 'Engine compartment partially burnt.',
      casualty: 'Nil',
      timeAtBase: '12:02hours',
      oic: 'ADOI Noah Biere',
      watch: 'Red watch',
    location: 'Ring Road, Accra',
      reportedBy: 'Jane Smith',
      assignedTo: 'Station Commander B2',
    station: 'Accra Central',
    reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      occurredAt: new Date(Date.now() - 4 * 60 * 60 * 1000 - 10 * 60 * 1000).toISOString(),
    description: 'Multi-vehicle collision with trapped passengers',
      casualties: 2,
      injuries: 5,
      fatalities: 0,
      propertyDamage: 'Moderate',
      responseTime: 12,
      resolutionTime: 90
    },
    {
      id: '3',
      incidentNumber: 'INC-2024-003',
    title: 'Medical Emergency - East Legon',
      type: 'Medical Emergency',
      severity: 'Medium',
      status: 'Approved',
      location: 'East Legon, Accra',
      reportedBy: 'Mike Johnson',
      assignedTo: 'Station Commander C3',
    station: 'Accra Central',
    reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      occurredAt: new Date(Date.now() - 6 * 60 * 60 * 1000 - 15 * 60 * 1000).toISOString(),
    description: 'Elderly person collapsed, required immediate medical attention',
      casualties: 0,
      injuries: 1,
      fatalities: 0,
      propertyDamage: 'None',
      responseTime: 15,
      resolutionTime: 45
    },
    {
      id: '4',
      incidentNumber: 'INC-2024-004',
    title: 'Rescue Operation - Industrial Area',
    type: 'Rescue',
      severity: 'High',
    status: 'Approved',
    location: 'Industrial Area, Accra',
      reportedBy: 'Sarah Wilson',
      assignedTo: 'Station Commander D4',
    station: 'Accra Central',
    reportedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      occurredAt: new Date(Date.now() - 8 * 60 * 60 * 1000 - 20 * 60 * 1000).toISOString(),
    description: 'Worker trapped in machinery, rescue operation required',
      casualties: 0,
    injuries: 1,
      fatalities: 0,
    propertyDamage: 'None',
      responseTime: 10,
      resolutionTime: 180
    },
    {
      id: '5',
      incidentNumber: 'INC-2024-005',
      title: 'Apartment Fire - Osu District',
      type: 'Fire',
      severity: 'Medium',
      status: 'Approved',
      location: 'Osu District, Accra',
      reportedBy: 'Lisa Davis',
      assignedTo: 'Station Commander F6',
    station: 'Kumasi Central',
    reportedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      occurredAt: new Date(Date.now() - 18 * 60 * 60 * 1000 - 25 * 60 * 1000).toISOString(),
      description: 'Kitchen fire in apartment building, quickly contained',
      casualties: 0,
      injuries: 0,
      fatalities: 0,
      propertyDamage: 'Minor',
      responseTime: 7,
      resolutionTime: 60
    },
];

const OperationsIncidentsPage: React.FC = () => {
  const [allIncidentReports, setAllIncidentReports] = useState<IncidentReport[]>(initialIncidentReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [activeTab, setActiveTab] = useState<'24hour' | 'fire'>('24hour');
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showRequestCorrectionsModal, setShowRequestCorrectionsModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [correctionsReason, setCorrectionsReason] = useState('');
  const [editingReport, setEditingReport] = useState<IncidentReport | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const user = useAuthStore((state) => state.user);

  // Get user's station name
  const userStationName = getStationName(user?.stationId);

  // Filter incidents by user's station
  const filteredData = useMemo(() => {
    let filtered = allIncidentReports.filter(incident => incident.station === userStationName);
    
    // Filter by tab
    if (activeTab === 'fire') {
      filtered = filtered.filter(incident => incident.type === 'Fire');
    } else if (activeTab === '24hour') {
      filtered = filtered.filter(incident => 
        new Date(incident.reportedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(incident => incident.status === filterStatus);
    }
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(incident => incident.type === filterType);
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(incident =>
        incident.title.toLowerCase().includes(searchLower) ||
        incident.incidentNumber.toLowerCase().includes(searchLower) ||
        incident.location.toLowerCase().includes(searchLower) ||
        incident.reportedBy.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [userStationName, activeTab, filterStatus, filterType, searchTerm]);

  const columns: ColumnDef<IncidentReport>[] = useMemo(
    () => [
      {
        accessorKey: 'incidentNumber',
        header: 'Incident #',
        cell: ({ getValue }) => (
          <div className="font-mono text-sm font-semibold text-gray-900">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ getValue }) => (
          <div className="font-semibold text-gray-900 max-w-xs truncate">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => {
          const type = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              type === 'Fire' ? 'bg-red-100 text-red-800' :
              type === 'Medical Emergency' ? 'bg-blue-100 text-blue-800' :
              type === 'Rescue' ? 'bg-green-100 text-green-800' :
              type === 'Hazardous Material' ? 'bg-yellow-100 text-yellow-800' :
              type === 'Vehicle Accident' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ getValue }) => {
          const severity = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              severity === 'Critical' ? 'bg-red-100 text-red-800' :
              severity === 'High' ? 'bg-orange-100 text-orange-800' :
              severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              severity === 'Low' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {severity}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              status === 'Approved' ? 'bg-green-100 text-green-800' :
              status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
              status === 'Request Corrections' ? 'bg-orange-100 text-orange-800' :
              status === 'Draft' ? 'bg-gray-100 text-gray-800' :
              status === 'Rejected' ? 'bg-red-100 text-red-800' :
              status === 'Closed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-gray-600 max-w-xs truncate">
            <MapPin className="w-4 h-4" />
            <span>{getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'reportedAt',
        header: 'Reported',
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="w-4 h-4" />
              <span>{date.toLocaleDateString()}</span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedReport(row.original);
                setShowViewModal(true);
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md"
              title="View Report"
            >
              <Eye className="w-4 h-4" />
            </button>
            {row.original.status === 'Under Review' && (
              <>
                <button
                  onClick={() => {
                    setEditingReport(row.original);
                    setEditFormData({ ...row.original });
                    setShowEditModal(true);
                  }}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:shadow-md"
                  title="Edit Report"
                >
              <Edit className="w-4 h-4" />
            </button>
              </>
            )}
          </div>
        ),
      },
    ],
    []
  );

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
  });

  const handleApprove = (report: IncidentReport) => {
    setAllIncidentReports(prev => prev.map(r => 
      r.id === report.id ? { ...r, status: 'Approved' as const } : r
    ));
    setShowViewModal(false);
    setSelectedReport(null);
  };

  const handleDecline = () => {
    if (!selectedReport || !declineReason.trim()) return;
    setAllIncidentReports(prev => prev.map(r => 
      r.id === selectedReport.id 
        ? { ...r, status: 'Rejected' as const, description: r.description + `\n\n[REJECTED: ${declineReason}]` }
        : r
    ));
    setShowDeclineModal(false);
    setShowViewModal(false);
    setSelectedReport(null);
    setDeclineReason('');
  };

  const handleRequestCorrections = () => {
    if (!selectedReport || !correctionsReason.trim()) return;
    setAllIncidentReports(prev => prev.map(r => 
      r.id === selectedReport.id 
        ? { ...r, status: 'Request Corrections' as const, description: r.description + `\n\n[CORRECTIONS REQUESTED: ${correctionsReason}]` }
        : r
    ));
    setShowRequestCorrectionsModal(false);
    setShowViewModal(false);
    setSelectedReport(null);
    setCorrectionsReason('');
  };

  const handleSaveEdit = () => {
    if (!editingReport) return;
    setAllIncidentReports(prev => prev.map(r => 
      r.id === editingReport.id ? { ...r, ...editFormData } : r
    ));
    setShowEditModal(false);
    setEditingReport(null);
    setEditFormData({});
  };

  const totalIncidents = filteredData.length;
  const criticalIncidents = filteredData.filter(incident => incident.severity === 'Critical').length;
  const approvedIncidents = filteredData.filter(incident => incident.status === 'Approved').length;
  const underReviewIncidents = filteredData.filter(incident => incident.status === 'Under Review').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-3">
              Incident Reports - {userStationName}
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              View and manage incident reports for your station
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{totalIncidents}</span>
              <p className="text-gray-500 text-sm">Total Reports</p>
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
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Reports</h3>
            <p className="text-3xl font-bold text-gray-900">{totalIncidents}</p>
            <p className="text-xs text-gray-500">this period</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Critical</h3>
            <p className="text-3xl font-bold text-gray-900">{criticalIncidents}</p>
            <p className="text-xs text-gray-500">high priority</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Approved</h3>
            <p className="text-3xl font-bold text-gray-900">{approvedIncidents}</p>
            <p className="text-xs text-gray-500">completed</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Under Review</h3>
            <p className="text-3xl font-bold text-gray-900">{underReviewIncidents}</p>
            <p className="text-xs text-gray-500">pending</p>
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
                placeholder="Search incident reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Request Corrections">Request Corrections</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
            >
              <option value="all">All Types</option>
              <option value="Fire">Fire</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Rescue">Rescue</option>
              <option value="Hazardous Material">Hazardous Material</option>
              <option value="Vehicle Accident">Vehicle Accident</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('24hour')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === '24hour'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
              : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <Clock3 className="w-5 h-5" />
          24-Hour Reports
        </button>
        <button
          onClick={() => setActiveTab('fire')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'fire'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
              : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <Flame className="w-5 h-5" />
          Fire Reports
        </button>
      </div>

      {/* Incident Reports Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gradient-to-r from-red-500 to-red-600">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
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
              {table.getRowModel().rows.map((row, index) => (
                <tr key={row.id} className={`hover:bg-red-50 transition-all duration-200 border-b border-gray-100 ${
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
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No incident reports found for your station</p>
      </div>
        )}
    </div>

      {/* View Report Modal with 24-Hour Report Format */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">24-Hour Incident Report</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedReport(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 24-Hour Report Format */}
              <div className="space-y-6 border-2 border-gray-200 p-6 rounded-xl bg-gray-50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-bold">DAY & DATE:</span> {selectedReport.dayAndDate || `${new Date(selectedReport.reportedAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
                  </div>
                  <div>
                    <span className="font-bold">TIME OF CALL:</span> {selectedReport.timeOfCall || new Date(selectedReport.reportedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + 'hours'}
                  </div>
                  <div>
                    <span className="font-bold">TIME DISPATCHED:</span> {selectedReport.timeDispatched || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-bold">TIME AT SCENE:</span> {selectedReport.timeAtScene || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-bold">METHOD OF CALL:</span> {selectedReport.methodOfCall || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-bold">ADDRESS OF FIRE:</span> {selectedReport.addressOfFire || selectedReport.location}
                  </div>
                  <div>
                    <span className="font-bold">DRIVEN BY:</span> {selectedReport.drivenBy || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-bold">NATURE OF FIRE:</span> {selectedReport.natureOfFire || selectedReport.type}
                  </div>
                  {selectedReport.fireInProgress !== undefined && (
                    <div>
                      <span className="font-bold">Fire was in progress:</span> {selectedReport.fireInProgress ? 'Yes' : 'No'}
                    </div>
                  )}
                  <div>
                    <span className="font-bold">CAUSE OF FIRE:</span> {selectedReport.causeOfFire || 'Under investigation'}
                  </div>
                  {selectedReport.damage && (
                    <div className="col-span-2">
                      <span className="font-bold">*DAMAGE*</span> {selectedReport.damage}
                    </div>
                  )}
                  <div>
                    <span className="font-bold">CASUALTY:</span> {selectedReport.casualty || selectedReport.casualties > 0 ? selectedReport.casualties.toString() : 'Nil'}
                  </div>
                  <div>
                    <span className="font-bold">TIME AT BASE:</span> {selectedReport.timeAtBase || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-bold">OIC:</span> {selectedReport.oic || selectedReport.assignedTo || 'Not specified'}
                  </div>
                  {selectedReport.watch && (
                    <div>
                      <span className="font-bold">Watch:</span> {selectedReport.watch}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="font-bold mb-2">Description:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.description}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedReport.status === 'Under Review' && (
                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    onClick={() => {
                      setShowRequestCorrectionsModal(true);
                    }}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Request Corrections
                  </button>
                  <button
                    onClick={() => {
                      setShowDeclineModal(true);
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    Decline
                  </button>
                  <button
                    onClick={() => handleApprove(selectedReport)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && selectedReport && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Decline Report</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for declining this report:</p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter reason for declining..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none h-32"
            />
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={!declineReason.trim()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Corrections Modal */}
      {showRequestCorrectionsModal && selectedReport && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Request Corrections</h3>
            <p className="text-gray-600 mb-4">Please specify what corrections are needed:</p>
            <textarea
              value={correctionsReason}
              onChange={(e) => setCorrectionsReason(e.target.value)}
              placeholder="Enter corrections needed..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-yellow-300 focus:outline-none h-32"
            />
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setShowRequestCorrectionsModal(false);
                  setCorrectionsReason('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestCorrections}
                disabled={!correctionsReason.trim()}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Corrections
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Report Modal */}
      {showEditModal && editingReport && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Incident Report</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReport(null);
                  setEditFormData({});
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Day & Date</label>
                  <input
                    type="text"
                    value={editFormData.dayAndDate || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, dayAndDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time of Call</label>
                  <input
                    type="text"
                    value={editFormData.timeOfCall || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, timeOfCall: e.target.value })}
                    placeholder="e.g., 1027hours"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time Dispatched</label>
                  <input
                    type="text"
                    value={editFormData.timeDispatched || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, timeDispatched: e.target.value })}
                    placeholder="e.g., 1028hours"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time at Scene</label>
                  <input
                    type="text"
                    value={editFormData.timeAtScene || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, timeAtScene: e.target.value })}
                    placeholder="e.g., 1031hours"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Method of Call</label>
                  <input
                    type="text"
                    value={editFormData.methodOfCall || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, methodOfCall: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address of Fire</label>
                  <input
                    type="text"
                    value={editFormData.addressOfFire || editFormData.location || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, addressOfFire: e.target.value, location: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Driven By</label>
                  <input
                    type="text"
                    value={editFormData.drivenBy || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, drivenBy: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nature of Fire</label>
                  <input
                    type="text"
                    value={editFormData.natureOfFire || editFormData.type || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, natureOfFire: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cause of Fire</label>
                  <input
                    type="text"
                    value={editFormData.causeOfFire || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, causeOfFire: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Casualty</label>
                  <input
                    type="text"
                    value={editFormData.casualty || (editFormData.casualties > 0 ? editFormData.casualties.toString() : 'Nil')}
                    onChange={(e) => setEditFormData({ ...editFormData, casualty: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time at Base</label>
                  <input
                    type="text"
                    value={editFormData.timeAtBase || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, timeAtBase: e.target.value })}
                    placeholder="e.g., 12:02hours"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">OIC</label>
                  <input
                    type="text"
                    value={editFormData.oic || editFormData.assignedTo || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, oic: e.target.value, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Watch</label>
                  <input
                    type="text"
                    value={editFormData.watch || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, watch: e.target.value })}
                    placeholder="e.g., Red watch"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Damage</label>
                <textarea
                  value={editFormData.damage || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, damage: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none h-32"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReport(null);
                  setEditFormData({});
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsIncidentsPage;
