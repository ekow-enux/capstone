'use client';

import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  Settings, 
  Wrench, 
  Truck, 
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
  AlertCircle,
  Cog,
  Gauge
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

// Mock data for operations metrics
const operationsMetrics = {
  daily: {
    activeOperations: 12,
    equipmentStatus: 94,
    responseTime: 6.8,
    personnelDeployed: 45,
    maintenanceCompleted: 8
  },
  weekly: {
    activeOperations: 78,
    equipmentStatus: 92,
    responseTime: 7.2,
    personnelDeployed: 45,
    maintenanceCompleted: 42
  },
  monthly: {
    activeOperations: 312,
    equipmentStatus: 89,
    responseTime: 6.9,
    personnelDeployed: 45,
    maintenanceCompleted: 156
  }
};

// Mock data for charts
const operationsData = [
  { name: 'Mon', active: 8, completed: 7 },
  { name: 'Tue', active: 12, completed: 11 },
  { name: 'Wed', active: 9, completed: 8 },
  { name: 'Thu', active: 15, completed: 14 },
  { name: 'Fri', active: 11, completed: 10 },
  { name: 'Sat', active: 18, completed: 16 },
  { name: 'Sun', active: 7, completed: 6 },
];

const operationTypesData = [
  { name: 'Fire Suppression', value: 35, color: '#ef4444' },
  { name: 'Rescue Operations', value: 25, color: '#3b82f6' },
  { name: 'Medical Response', value: 20, color: '#10b981' },
  { name: 'Hazardous Materials', value: 20, color: '#f59e0b' },
];

const equipmentStatusData = [
  { name: 'Jan', status: 88 },
  { name: 'Feb', status: 91 },
  { name: 'Mar', status: 89 },
  { name: 'Apr', status: 93 },
  { name: 'May', status: 95 },
  { name: 'Jun', status: 94 },
];

// Operations data for TanStack table
const operationsList = [
  {
    id: 1,
    operationName: 'Fire Suppression - Building A',
    location: 'Accra Central',
    status: 'Active',
    personnel: 8,
    equipment: 'Fire Truck A1',
    startTime: '14:30',
    priority: 'High'
  },
  {
    id: 2,
    operationName: 'Rescue Operation - Vehicle Accident',
    location: 'Ring Road',
    status: 'Active',
    personnel: 6,
    equipment: 'Rescue Unit B2',
    startTime: '15:45',
    priority: 'Critical'
  },
  {
    id: 3,
    operationName: 'Medical Response - Heart Attack',
    location: 'East Legon',
    status: 'Completed',
    personnel: 4,
    equipment: 'Ambulance C3',
    startTime: '13:20',
    priority: 'High'
  },
  {
    id: 4,
    operationName: 'Hazardous Material - Chemical Spill',
    location: 'Industrial Area',
    status: 'Active',
    personnel: 12,
    equipment: 'Hazmat Unit D4',
    startTime: '16:10',
    priority: 'Critical'
  },
  {
    id: 5,
    operationName: 'Fire Prevention - Building Inspection',
    location: 'Osu',
    status: 'Scheduled',
    personnel: 3,
    equipment: 'Inspection Kit E5',
    startTime: '17:00',
    priority: 'Medium'
  },
];

const OperationsDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [sorting, setSorting] = useState<SortingState>([]);

  const currentMetrics = operationsMetrics[timeFilter];

  // TanStack table columns
  const columns: ColumnDef<typeof operationsList[0]>[] = useMemo(
    () => [
      {
        accessorKey: 'operationName',
        header: 'Operation Name',
        cell: ({ getValue }) => (
          <div className="font-medium text-black">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
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
                : status === 'Completed'
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'personnel',
        header: 'Personnel',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as number}</div>
        ),
      },
      {
        accessorKey: 'equipment',
        header: 'Equipment',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ getValue }) => {
          const priority = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium border ${
              priority === 'Critical' 
                ? 'bg-red-100 text-red-800 border-red-200' 
                : priority === 'High'
                ? 'bg-orange-100 text-orange-800 border-orange-200'
                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}>
              {priority}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: operationsList,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3">
              Operations Command Center
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Welcome back, Operations Officer
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Settings className="w-10 h-10 text-blue-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">GNFS</span>
              <p className="text-gray-500 text-sm">Operations Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Filter */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-white border-2 border-gray-200 p-8 rounded-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Operations Metrics</h2>
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
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+8%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Operations</h3>
            <p className="text-3xl font-bold text-gray-900">{currentMetrics.activeOperations}</p>
            <p className="text-xs text-gray-500">vs last period</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Gauge className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+3%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Equipment Status</h3>
            <p className="text-3xl font-bold text-gray-900">{currentMetrics.equipmentStatus}%</p>
            <p className="text-xs text-gray-500">operational</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-600 font-semibold">+0.2min</span>
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
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">100%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Personnel</h3>
            <p className="text-3xl font-bold text-gray-900">{currentMetrics.personnelDeployed}</p>
            <p className="text-xs text-gray-500">deployed</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Wrench className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Wrench className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+12%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Maintenance</h3>
            <p className="text-3xl font-bold text-gray-900">{currentMetrics.maintenanceCompleted}</p>
            <p className="text-xs text-gray-500">completed</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Operations Chart */}
        <div className="bg-gradient-to-br from-white via-red-50/30 to-white border-2 border-red-200 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-200 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-red-700" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Operations This Week</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={operationsData}>
              <defs>
                <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="active" 
                stroke="#3b82f6" 
                fill="url(#activeGradient)" 
                strokeWidth={3}
                name="Active Operations"
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#10b981" 
                fill="url(#completedGradient)" 
                strokeWidth={3}
                name="Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Operation Types Chart */}
        <div className="bg-gradient-to-br from-white via-red-50/30 to-white border-2 border-red-200 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-200 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-red-700" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Operation Types Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={operationTypesData}
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
                {operationTypesData.map((entry, index) => (
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

      {/* Equipment Status Trend */}
      <div className="bg-gradient-to-br from-white via-red-50/30 to-white border-2 border-red-200 p-8 rounded-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-200 p-2 rounded-lg">
            <TrendingUp className="w-6 h-6 text-red-700" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Equipment Status Trend (Last 6 Months)</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={equipmentStatusData}>
            <defs>
              <linearGradient id="equipmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
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
              dataKey="status" 
              stroke="#8b5cf6" 
              strokeWidth={4}
              dot={{ fill: '#8b5cf6', strokeWidth: 3, r: 6 }}
              activeDot={{ r: 8, stroke: '#8b5cf6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Operations Overview Table */}
      <div className="bg-gradient-to-br from-white via-gray-50/50 to-white border-2 border-gray-200 p-8 rounded-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Settings className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Current Operations</h2>
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
      </div>
    </div>
  );
};

export default OperationsDashboard;

