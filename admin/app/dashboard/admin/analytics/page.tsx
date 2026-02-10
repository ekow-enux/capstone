'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Calendar,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Station-level mock data
  const emergencyCallsData = [
    { name: 'Mon', calls: 4, resolved: 4 },
    { name: 'Tue', calls: 7, resolved: 6 },
    { name: 'Wed', calls: 5, resolved: 5 },
    { name: 'Thu', calls: 8, resolved: 7 },
    { name: 'Fri', calls: 6, resolved: 6 },
    { name: 'Sat', calls: 9, resolved: 8 },
    { name: 'Sun', calls: 3, resolved: 3 },
  ];

  const incidentTypesData = [
    { name: 'Fire', value: 45, color: '#ef4444' },
    { name: 'Medical', value: 30, color: '#3b82f6' },
    { name: 'Rescue', value: 15, color: '#10b981' },
    { name: 'Hazardous', value: 10, color: '#f59e0b' },
  ];

  const responseTimeData = [
    { name: 'Jan', avgTime: 6.2 },
    { name: 'Feb', avgTime: 6.8 },
    { name: 'Mar', avgTime: 6.5 },
    { name: 'Apr', avgTime: 6.9 },
    { name: 'May', avgTime: 6.3 },
    { name: 'Jun', avgTime: 6.1 },
  ];

  // Station-level metrics
  const getMetrics = () => {
    const baseMetrics = {
      '7d': { calls: 42, responseTime: 6.5, resolved: 39, efficiency: 93 },
      '30d': { calls: 234, responseTime: 6.5, resolved: 218, efficiency: 93 },
      '90d': { calls: 687, responseTime: 6.6, resolved: 645, efficiency: 94 },
      '1y': { calls: 2756, responseTime: 6.4, resolved: 2608, efficiency: 95 },
    };
    return baseMetrics[timeRange];
  };

  const metrics = getMetrics();

  const handleDownloadReport = () => {
    const m = getMetrics();

    const rows = [
      { Metric: 'Time Range', Value: timeRange },
      { Metric: 'Total Calls', Value: m.calls },
      { Metric: 'Average Response Time (min)', Value: m.responseTime },
      { Metric: 'Resolved Incidents', Value: m.resolved },
      { Metric: 'Efficiency (%)', Value: m.efficiency },
      {} as any,
      { Metric: 'Day', Value: 'Calls / Resolved (last 7 days)' },
      ...emergencyCallsData.map((d) => ({
        Metric: d.name,
        Value: `${d.calls} / ${d.resolved}`,
      })),
    ];

    const headers = Object.keys(rows[0]).filter(Boolean);
    const csvLines = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const v = (row as any)[h] ?? '';
            const s = String(v);
            return `"${s.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `station-analytics-${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-3">
              Analytics & Reports
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Station-level performance analytics and insights
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-xl">
                <BarChart3 className="w-10 h-10 text-red-600" />
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">Live</span>
                <p className="text-gray-500 text-sm">Analytics</p>
              </div>
            </div>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-red-500 text-red-600 font-semibold hover:bg-red-50 hover:shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center justify-end gap-3">
          {(['7d', '30d', '90d', '1y'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeRange(period)}
              className={`px-6 py-3 text-sm font-bold border-2 transition-all duration-300 transform hover:scale-105 ${
                timeRange === period
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 rounded-xl shadow-lg shadow-red-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:bg-red-50 rounded-xl'
              }`}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-red-50 border-2 border-red-200 p-6 rounded-2xl hover:border-red-400 hover:shadow-xl hover:shadow-red-100 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-bold">+8%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Emergency Calls</h3>
            <p className="text-4xl font-black text-gray-900">{metrics.calls.toLocaleString()}</p>
            <p className="text-xs text-gray-400 font-medium">station calls</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 p-6 rounded-2xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-bold">-3%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Avg Response Time</h3>
            <p className="text-4xl font-black text-gray-900">{metrics.responseTime}<span className="text-lg text-gray-500">m</span></p>
            <p className="text-xs text-gray-400 font-medium">average</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 p-6 rounded-2xl hover:border-green-400 hover:shadow-xl hover:shadow-green-100 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-bold">{metrics.efficiency}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Resolved</h3>
            <p className="text-4xl font-black text-gray-900">{metrics.resolved.toLocaleString()}</p>
            <p className="text-xs text-gray-400 font-medium">incidents</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 p-6 rounded-2xl hover:border-purple-400 hover:shadow-xl hover:shadow-purple-100 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-bold">{metrics.efficiency}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Efficiency</h3>
            <p className="text-4xl font-black text-gray-900">{metrics.efficiency}%</p>
            <p className="text-xs text-gray-400 font-medium">success rate</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Performance Charts</h2>
          <p className="text-gray-600 text-lg">Visual data representation</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Calls Chart */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-2 rounded-lg">
                <LineChart className="w-6 h-6 text-red-700" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Emergency Calls Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={emergencyCallsData}>
                <defs>
                  <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} fontWeight="bold" />
                <YAxis stroke="#9ca3af" fontSize={12} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-2 rounded-lg">
                <PieChart className="w-6 h-6 text-red-700" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Incident Types Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <RechartsPieChart>
                <Pie
                  data={incidentTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={120}
                  innerRadius={70}
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
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-black text-gray-900 mb-2">Export Reports</h3>
          <p className="text-gray-600 text-lg">Download station analytics reports</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
            <Download className="w-5 h-5" />
            PDF Report
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold">
            <Download className="w-5 h-5" />
            Excel Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
