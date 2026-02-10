'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import ActiveIncidentsBanner from '@/components/incidents/ActiveIncidentsBanner';
import { 
  Flame, 
  Ambulance, 
  Car, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Building2,
  Phone,
  MapPin,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Shield, 
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data for fire service metrics
const fireServiceMetrics = {
  daily: {
    emergencyCalls: 23,
    responseTime: 8.5,
    incidentsResolved: 21,
    personnelActive: 1247,
    stationsOperational: 19
  },
  weekly: {
    emergencyCalls: 156,
    responseTime: 9.2,
    incidentsResolved: 148,
    personnelActive: 1247,
    stationsOperational: 19
  },
  monthly: {
    emergencyCalls: 687,
    responseTime: 8.8,
    incidentsResolved: 654,
    personnelActive: 1247,
    stationsOperational: 19
  }
};

// Mock data for charts
const emergencyCallsData = [
  { name: 'Mon', calls: 12, resolved: 11 },
  { name: 'Tue', calls: 19, resolved: 18 },
  { name: 'Wed', calls: 15, resolved: 14 },
  { name: 'Thu', calls: 22, resolved: 20 },
  { name: 'Fri', calls: 18, resolved: 17 },
  { name: 'Sat', calls: 25, resolved: 23 },
  { name: 'Sun', calls: 20, resolved: 19 },
];

const incidentTypesData = [
  { name: 'Fire', value: 45, color: '#ef4444' },
  { name: 'Medical', value: 30, color: '#3b82f6' },
  { name: 'Rescue', value: 15, color: '#10b981' },
  { name: 'Hazardous', value: 10, color: '#f59e0b' },
];

const responseTimeData = [
  { name: 'Jan', avgTime: 9.2 },
  { name: 'Feb', avgTime: 8.8 },
  { name: 'Mar', avgTime: 8.5 },
  { name: 'Apr', avgTime: 8.9 },
  { name: 'May', avgTime: 8.3 },
  { name: 'Jun', avgTime: 8.1 },
];

// Station data for TanStack table - using real station data
const stationData = [
  {
    id: '69049470ee691673e388de18',
    stationName: 'Accra Central Fire Station',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'Central Business District, Accra',
    phone_number: '+233302123456',
    mdfodfo: 'Chief Fire Officer',
    personnel: 0, // Will be populated from API
    callSign: 'ACC-001',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388dd9e',
    stationName: 'Accra City Fire Station',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'GQXV+P38, Kojo Thompson Road, Accra',
    phone_number: '030 266 6576',
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-002',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388dd8a',
    stationName: 'Accra Regional Headquarters - GNFS',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'AM1293 Guggisberg Avenue, Accra',
    phone_number: null,
    mdfodfo: 'Regional Commander',
    personnel: 0,
    callSign: 'ACC-RHQ',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388dd9a',
    stationName: 'Amamorley Fire Service Station',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'Firre Service Station, Amamorley Community Town',
    phone_number: null,
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-003',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388dd90',
    stationName: 'Anyaa fire service',
    city: 'Accra',
    region: 'Greater Accra',
    location: '303 Anyaa Market Street',
    phone_number: null,
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-004',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388dda6',
    stationName: 'Dansoman Fire station',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'GPRM+MPC, Shito Street, Accra',
    phone_number: '029 170 2111',
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-005',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388dda2',
    stationName: 'Fire Academy And Training School',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'Cleland Rd, Accra, Ghana',
    phone_number: '030 394 1013',
    mdfodfo: 'Training Commandant',
    personnel: 0,
    callSign: 'ACC-ACAD',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388ddb0',
    stationName: 'Fire Service',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'PV42+3QC, Adenta Municipality',
    phone_number: '029 934 0379',
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-006',
    status: 'Active'
  },
  {
    id: '69024721ee691673e388dd5f',
    stationName: 'GHANA NATIONAL FIRE SERVICE HEADQUARTERS',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'Accra',
    phone_number: '030 277 2446',
    mdfodfo: 'Chief Fire Officer',
    personnel: 0,
    callSign: 'GNFS-HQ',
    status: 'Active'
  },
  {
    id: '6902474bee691673e388ddb4',
    stationName: 'Ghana Fire Service (University of Ghana Station)',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'La Road, Accra',
    phone_number: null,
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-UG',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388dda8',
    stationName: 'Ghana Fire Service Station - Madina',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'Madina',
    phone_number: '030 250 1744',
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-007',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388dda4',
    stationName: 'Ghana National Fire Service',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'Beside National Blood Service Ghana, Guggisberg Avenue, Accra',
    phone_number: '030 266 6576',
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-008',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388ddac',
    stationName: 'Ghana National Fire Service',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'HM44+GHQ, Mile 11',
    phone_number: '050 913 2226',
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-009',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388dd88',
    stationName: 'Ghana National Fire Service - Circle',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'HQ9P+X9J, Ring Road, Accra',
    phone_number: null,
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-010',
    status: 'Active'
  },
  {
    id: '6902474bee691673e388ddb6',
    stationName: 'Ghana National Fire Service Amasaman',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'PP32+C75, Amasaman',
    phone_number: null,
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-011',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388ddae',
    stationName: 'Ghana National Fire Service, MOTORWAY Fire Station',
    city: 'Tema',
    region: 'Greater Accra',
    location: 'Close to China Mall, Tema',
    phone_number: '029 170 2011',
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'TEM-001',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388dd93',
    stationName: 'Ghana West Municipal Fire Station',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'PP32+F3C, 104 Hospital Road, Amasaman, Amasaman',
    phone_number: null,
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-012',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388dd96',
    stationName: 'Teshie Fire Service',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'JV6X+C2J, Fertilizer Road, Accra',
    phone_number: null,
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-013',
    status: 'Active'
  },
  {
    id: '6902474aee691673e388ddaa',
    stationName: 'Weija Fire Station',
    city: 'Accra',
    region: 'Greater Accra',
    location: 'HM44+GHG, Mile 11, Ghana',
    phone_number: '030 285 1543',
    mdfodfo: 'Station Officer',
    personnel: 0,
    callSign: 'ACC-014',
    status: 'Active'
  },
];

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [sorting, setSorting] = useState<SortingState>([]);

  const currentMetrics = fireServiceMetrics[timeFilter];

  // TanStack table columns
  const columns: ColumnDef<typeof stationData[0]>[] = useMemo(
    () => [
      {
        accessorKey: 'stationName',
        header: 'Station Name',
        cell: ({ getValue }) => (
          <div className="font-medium text-black">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'city',
        header: 'City',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'region',
        header: 'Region',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'mdfodfo',
        header: 'MDFO/DFO',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'personnel',
        header: 'Personnel',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as number}</div>
        ),
      },
      {
        accessorKey: 'callSign',
        header: 'Call Sign',
        cell: ({ getValue }) => (
          <div className="font-mono text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium border ${
              status === 'Active' 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-red-100 text-red-800 border-red-200'
            }`}>
              {status}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: stationData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <ActiveIncidentsBanner />
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3">
              Fire Service Command Center
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Welcome back, Super Admin
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
              <span className="text-2xl font-bold text-gray-900">GNFS</span>
              <p className="text-gray-500 text-sm">Admin Portal</p>
          </div>
          </div>
        </div>
      </div>

      {/* Time Filter */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-white border-2 border-gray-200 p-8 rounded-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Fire Service Metrics</h2>
            <p className="text-gray-600 text-lg">Real-time operational data</p>
          </div>
          <div className="flex gap-3">
            {(['daily', 'weekly', 'monthly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeFilter(period)}
                className={`px-6 py-3 text-sm font-bold border-2 transition-all duration-300 transform hover:scale-105 ${
                  timeFilter === period
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 rounded-xl'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:bg-red-50 rounded-xl'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
          ))}
        </div>
      </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Emergency Calls</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.emergencyCalls}</p>
              <p className="text-xs text-gray-500">vs last period</p>
            </div>
          </div>

          <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">-5%</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Response Time</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.responseTime}<span className="text-lg text-gray-500">m</span></p>
              <p className="text-xs text-gray-500">average</p>
            </div>
          </div>

          <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">91%</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Resolved</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.incidentsResolved}</p>
              <p className="text-xs text-gray-500">incidents</p>
        </div>
      </div>

          <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-semibold">100%</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Personnel</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.personnelActive.toLocaleString()}</p>
              <p className="text-xs text-gray-500">active</p>
            </div>
          </div>

          <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">100%</span>
            </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Stations</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.stationsOperational}</p>
              <p className="text-xs text-gray-500">operational</p>
              </div>
            </div>
          </div>
        </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emergency Calls Chart */}
        <div className="bg-gradient-to-br from-white via-red-50/30 to-white border-2 border-red-200 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-200 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-red-700" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Emergency Calls This Week</h3>
            </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={emergencyCallsData}>
              <defs>
                <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} fontWeight="bold" />
              <YAxis stroke="#6b7280" fontSize={12} fontWeight="bold" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  fontWeight: 'bold'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="calls" 
                stroke="#ef4444" 
                fill="url(#callsGradient)" 
                strokeWidth={3}
                name="Emergency Calls"
              />
              <Area 
                type="monotone" 
                dataKey="resolved" 
                stroke="#10b981" 
                fill="url(#resolvedGradient)" 
                strokeWidth={3}
                name="Resolved"
              />
            </AreaChart>
          </ResponsiveContainer>
            </div>

        {/* Incident Types Chart */}
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-white border-2 border-blue-200 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-200 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Incident Types Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={incidentTypesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {incidentTypesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  fontWeight: 'bold'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Time Trend */}
      <div className="bg-gradient-to-br from-white via-green-50/30 to-white border-2 border-green-200 p-8 rounded-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-green-200 p-2 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Response Time Trend (Last 6 Months)</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={responseTimeData}>
            <defs>
              <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} fontWeight="bold" />
            <YAxis stroke="#6b7280" fontSize={12} fontWeight="bold" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '2px solid #d1d5db',
                borderRadius: '12px',
                fontWeight: 'bold'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="avgTime" 
              stroke="#3b82f6" 
              strokeWidth={4}
              dot={{ fill: '#3b82f6', strokeWidth: 3, r: 6 }}
              activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Station Overview Table */}
      <div className="bg-gradient-to-br from-white via-gray-50/50 to-white border-2 border-gray-200 p-8 rounded-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Station Overview</h2>
        </div>
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
      </div>

    </div>
  );
};

export default SuperAdminDashboard;