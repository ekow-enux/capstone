'use client';

import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Calendar,
  Clipboard,
  BarChart3,
  Activity,
  Building2,
  Zap
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

// Mock data for safety metrics
const safetyMetrics = {
  daily: {
    safetyIncidents: 2,
    complianceScore: 96,
    safetyPersonnel: 8,
    riskLevel: 3,
    trainingCompleted: 5
  },
  weekly: {
    safetyIncidents: 12,
    complianceScore: 94,
    safetyPersonnel: 8,
    riskLevel: 3,
    trainingCompleted: 28
  },
  monthly: {
    safetyIncidents: 45,
    complianceScore: 92,
    safetyPersonnel: 8,
    riskLevel: 3,
    trainingCompleted: 112
  }
};

// Mock data for charts
const incidentTrendData = [
  { name: 'Mon', incidents: 1, resolved: 1 },
  { name: 'Tue', incidents: 2, resolved: 2 },
  { name: 'Wed', incidents: 0, resolved: 0 },
  { name: 'Thu', incidents: 3, resolved: 2 },
  { name: 'Fri', incidents: 1, resolved: 1 },
  { name: 'Sat', incidents: 2, resolved: 2 },
  { name: 'Sun', incidents: 1, resolved: 1 },
];

const incidentTypesData = [
  { name: 'Equipment', value: 40, color: '#ef4444' },
  { name: 'Personnel', value: 30, color: '#f59e0b' },
  { name: 'Environmental', value: 20, color: '#3b82f6' },
  { name: 'Procedural', value: 10, color: '#10b981' },
];

const complianceData = [
  { name: 'Jan', score: 88 },
  { name: 'Feb', score: 90 },
  { name: 'Mar', score: 92 },
  { name: 'Apr', score: 89 },
  { name: 'May', score: 94 },
  { name: 'Jun', score: 96 },
];

// Safety personnel data for TanStack table
const safetyPersonnelData = [
  {
    id: 1,
    name: 'Sarah Wilson',
    rank: 'Safety Officer',
    certifications: 'Fire Safety, First Aid',
    lastTraining: '2 weeks ago',
    performance: 98,
    status: 'Active'
  },
  {
    id: 2,
    name: 'David Brown',
    rank: 'Safety Inspector',
    certifications: 'Equipment Safety, Hazardous Materials',
    lastTraining: '1 month ago',
    performance: 95,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Lisa Johnson',
    rank: 'Safety Coordinator',
    certifications: 'OSHA, Risk Assessment',
    lastTraining: '3 weeks ago',
    performance: 92,
    status: 'Active'
  },
  {
    id: 4,
    name: 'Mike Davis',
    rank: 'Safety Technician',
    certifications: 'Equipment Inspection',
    lastTraining: '1 week ago',
    performance: 89,
    status: 'Active'
  },
  {
    id: 5,
    name: 'Emma Wilson',
    rank: 'Safety Analyst',
    certifications: 'Data Analysis, Reporting',
    lastTraining: '2 weeks ago',
    performance: 96,
    status: 'Active'
  },
];

const SafetyDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [sorting, setSorting] = useState<SortingState>([]);

  const currentMetrics = safetyMetrics[timeFilter];

  // TanStack table columns
  const columns: ColumnDef<typeof safetyPersonnelData[0]>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => (
          <div className="font-medium text-black">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'rank',
        header: 'Rank',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'certifications',
        header: 'Certifications',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'lastTraining',
        header: 'Last Training',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'performance',
        header: 'Performance',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as number}%</div>
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
    data: safetyPersonnelData,
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
              Safety Command Center
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Welcome back, Safety Officer
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Shield className="w-10 h-10 text-yellow-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">GNFS</span>
              <p className="text-gray-500 text-sm">Safety Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Filter */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-white border-2 border-gray-200 p-8 rounded-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Safety Metrics</h2>
            <p className="text-gray-600 text-lg">Real-time safety and compliance data</p>
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
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">-15%</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Safety Incidents</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.safetyIncidents}</p>
              <p className="text-xs text-gray-500">vs last period</p>
            </div>
          </div>

          <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">+2%</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Compliance Score</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.complianceScore}%</p>
              <p className="text-xs text-gray-500">overall</p>
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
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Safety Personnel</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.safetyPersonnel}</p>
              <p className="text-xs text-gray-500">active</p>
            </div>
          </div>

          <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">Low</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Risk Level</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.riskLevel}/10</p>
              <p className="text-xs text-gray-500">current</p>
            </div>
          </div>

          <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">+8%</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Training</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.trainingCompleted}</p>
              <p className="text-xs text-gray-500">completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incident Trend Chart */}
        <div className="bg-gradient-to-br from-white via-red-50/30 to-white border-2 border-red-200 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-200 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-red-700" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Safety Incidents This Week</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={incidentTrendData}>
              <defs>
                <linearGradient id="incidentsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
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
                dataKey="incidents" 
                stroke="#f59e0b" 
                fill="url(#incidentsGradient)" 
                strokeWidth={3}
                name="Incidents"
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
        <div className="bg-gradient-to-br from-white via-red-50/30 to-white border-2 border-red-200 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-200 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-red-700" />
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

      {/* Compliance Trend */}
      <div className="bg-gradient-to-br from-white via-red-50/30 to-white border-2 border-red-200 p-8 rounded-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-200 p-2 rounded-lg">
            <TrendingUp className="w-6 h-6 text-red-700" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Compliance Score Trend (Last 6 Months)</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={complianceData}>
            <defs>
              <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
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
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#10b981" 
              strokeWidth={4}
              dot={{ fill: '#10b981', strokeWidth: 3, r: 6 }}
              activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Safety Personnel Table */}
      <div className="bg-gradient-to-br from-white via-gray-50/50 to-white border-2 border-gray-200 p-8 rounded-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Users className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Safety Personnel Overview</h2>
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

export default SafetyDashboard;
