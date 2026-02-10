'use client';

import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  Megaphone, 
  Newspaper, 
  Volume2, 
  Smartphone,
  Target,
  TrendingUp,
  Calendar,
  Users,
  MessageSquare,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Eye,
  BarChart3,
  Activity,
  Building2,
  Shield
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

// Mock data for PR metrics
const prMetrics = {
  daily: {
    mediaReports: 8,
    announcements: 2,
    socialPosts: 24,
    campaigns: 1,
    publicSentiment: 78
  },
  weekly: {
    mediaReports: 52,
    announcements: 12,
    socialPosts: 156,
    campaigns: 3,
    publicSentiment: 82
  },
  monthly: {
    mediaReports: 234,
    announcements: 48,
    socialPosts: 687,
    campaigns: 12,
    publicSentiment: 85
  }
};

// Mock data for charts
const mediaCoverageData = [
  { name: 'Mon', reports: 3, posts: 8 },
  { name: 'Tue', reports: 5, posts: 12 },
  { name: 'Wed', reports: 4, posts: 10 },
  { name: 'Thu', reports: 6, posts: 15 },
  { name: 'Fri', reports: 7, posts: 18 },
  { name: 'Sat', reports: 8, posts: 22 },
  { name: 'Sun', reports: 5, posts: 14 },
];

const campaignTypesData = [
  { name: 'Fire Safety', value: 40, color: '#ef4444' },
  { name: 'Emergency Prep', value: 30, color: '#3b82f6' },
  { name: 'Community Outreach', value: 20, color: '#10b981' },
  { name: 'Training', value: 10, color: '#f59e0b' },
];

const sentimentData = [
  { name: 'Jan', positive: 65, neutral: 25, negative: 10 },
  { name: 'Feb', positive: 68, neutral: 24, negative: 8 },
  { name: 'Mar', positive: 72, neutral: 22, negative: 6 },
  { name: 'Apr', positive: 75, neutral: 20, negative: 5 },
  { name: 'May', positive: 78, neutral: 18, negative: 4 },
  { name: 'Jun', positive: 82, neutral: 15, negative: 3 },
];

// Mock data for media coverage
const mediaCoverageList = [
  {
    id: 1,
    title: 'GNFS Rescues Family from Fire',
    source: 'Daily Graphic',
    type: 'Newspaper',
    sentiment: 'Positive',
    published: '2 hours ago',
    reach: 12500,
    engagement: 156
  },
  {
    id: 2,
    title: 'Fire Safety Tips for Homes',
    source: 'Twitter',
    type: 'Social Media',
    sentiment: 'Neutral',
    published: '4 hours ago',
    reach: 8500,
    engagement: 98
  },
  {
    id: 3,
    title: 'Emergency Response Training',
    source: 'Ghana News Agency',
    type: 'News Agency',
    sentiment: 'Positive',
    published: '1 day ago',
    reach: 15200,
    engagement: 234
  },
  {
    id: 4,
    title: 'Fire Station Opening Ceremony',
    source: 'Facebook',
    type: 'Social Media',
    sentiment: 'Positive',
    published: '2 days ago',
    reach: 9800,
    engagement: 187
  },
  {
    id: 5,
    title: 'Community Fire Drill',
    source: 'Joy News',
    type: 'TV',
    sentiment: 'Neutral',
    published: '3 days ago',
    reach: 18700,
    engagement: 312
  }
];

const PRDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [sorting, setSorting] = useState<SortingState>([]);

  const currentMetrics = prMetrics[timeFilter];

  // TanStack table columns
  const columns: ColumnDef<typeof mediaCoverageList[0]>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ getValue }) => (
          <div className="font-medium text-black">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'sentiment',
        header: 'Sentiment',
        cell: ({ getValue }) => {
          const sentiment = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium border ${
              sentiment === 'Positive' 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : sentiment === 'Neutral'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                : 'bg-red-100 text-red-800 border-red-200'
            }`}>
              {sentiment}
            </span>
          );
        },
      },
      {
        accessorKey: 'published',
        header: 'Published',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'reach',
        header: 'Reach',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{(getValue() as number).toLocaleString()}</div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: mediaCoverageList,
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
              Public Relations Command Center
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Welcome back, PR Officer
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Megaphone className="w-10 h-10 text-purple-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">GNFS</span>
              <p className="text-gray-500 text-sm">PR Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Filter */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-white border-2 border-gray-200 p-8 rounded-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">PR Metrics</h2>
            <p className="text-gray-600 text-lg">Real-time communications data</p>
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
                <Newspaper className="w-6 h-6 text-red-600" />
            </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">+12%</span>
      </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Media Reports</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.mediaReports}</p>
              <p className="text-xs text-gray-500">vs last period</p>
            </div>
          </div>
          
          <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Volume2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">+8%</span>
            </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Announcements</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.announcements}</p>
              <p className="text-xs text-gray-500">published</p>
        </div>
      </div>

          <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Smartphone className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">+15%</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Social Posts</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.socialPosts}</p>
              <p className="text-xs text-gray-500">this period</p>
              </div>
            </div>
            
          <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Target className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-semibold">Active</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Campaigns</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.campaigns}</p>
              <p className="text-xs text-gray-500">running</p>
            </div>
          </div>

          <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <ThumbsUp className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">+3%</span>
            </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Sentiment</h3>
              <p className="text-3xl font-bold text-gray-900">{currentMetrics.publicSentiment}%</p>
              <p className="text-xs text-gray-500">positive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media Coverage Chart */}
        <div className="bg-gradient-to-br from-white via-red-50/30 to-white border-2 border-red-200 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-200 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-red-700" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Media Coverage This Week</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={mediaCoverageData}>
              <defs>
                <linearGradient id="reportsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="postsGradient" x1="0" y1="0" x2="0" y2="1">
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
              <Area 
                type="monotone" 
                dataKey="reports" 
                stroke="#8b5cf6" 
                fill="url(#reportsGradient)" 
                strokeWidth={3}
                name="Media Reports"
              />
              <Area 
                type="monotone" 
                dataKey="posts" 
                stroke="#3b82f6" 
                fill="url(#postsGradient)" 
                strokeWidth={3}
                name="Social Posts"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Types Chart */}
        <div className="bg-gradient-to-br from-white via-red-50/30 to-white border-2 border-red-200 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-200 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-red-700" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Campaign Types Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={campaignTypesData}
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
                {campaignTypesData.map((entry, index) => (
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

      {/* Public Sentiment Trend */}
      <div className="bg-gradient-to-br from-white via-red-50/30 to-white border-2 border-red-200 p-8 rounded-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-200 p-2 rounded-lg">
            <TrendingUp className="w-6 h-6 text-red-700" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Public Sentiment Trend (Last 6 Months)</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={sentimentData}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="positive" 
              stroke="#10b981" 
              strokeWidth={4}
              dot={{ fill: '#10b981', strokeWidth: 3, r: 6 }}
              activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
            </div>

      {/* Media Coverage Table */}
      <div className="bg-gradient-to-br from-white via-gray-50/50 to-white border-2 border-gray-200 p-8 rounded-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Newspaper className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Recent Media Coverage</h2>
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

export default PRDashboard;
