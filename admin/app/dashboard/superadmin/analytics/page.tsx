'use client';

import React, { useState, useMemo } from 'react';
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

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

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

  const stationPerformanceData = [
    { name: 'Accra Central', calls: 45, responseTime: 8.2, efficiency: 95 },
    { name: 'Kumasi Central', calls: 38, responseTime: 9.1, efficiency: 92 },
    { name: 'Tamale Central', calls: 32, responseTime: 10.5, efficiency: 88 },
    { name: 'Takoradi', calls: 28, responseTime: 8.8, efficiency: 94 },
    { name: 'Cape Coast', calls: 25, responseTime: 9.3, efficiency: 90 },
  ];

  // Calculate metrics based on time range
  const getMetrics = () => {
    const baseMetrics = {
      '7d': { calls: 131, responseTime: 8.5, resolved: 122, efficiency: 93 },
      '30d': { calls: 687, responseTime: 8.8, resolved: 654, efficiency: 95 },
      '90d': { calls: 2103, responseTime: 8.6, resolved: 1987, efficiency: 94 },
      '1y': { calls: 8245, responseTime: 8.4, resolved: 7892, efficiency: 96 },
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
    link.setAttribute('download', `superadmin-analytics-${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3">
              Analytics & Reports
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Comprehensive fire service performance analytics
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <BarChart3 className="w-10 h-10 text-red-600" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">Live</span>
                <p className="text-gray-500 text-sm">Analytics</p>
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
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Performance Metrics</h2>
            <p className="text-gray-600">Fire service operational data</p>
          </div>
          <div className="flex gap-3">
            {(['7d', '30d', '90d', '1y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeRange(period)}
                className={`px-6 py-3 text-sm font-bold border-2 transition-all duration-300 transform hover:scale-105 ${
                  timeRange === period
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 rounded-xl'
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
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Emergency Calls</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.calls.toLocaleString()}</p>
              <p className="text-xs text-gray-500">total calls</p>
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
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Avg Response Time</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.responseTime}<span className="text-lg text-gray-500">m</span></p>
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
                  <span className="text-xs text-green-600 font-semibold">{metrics.efficiency}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Resolved</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.resolved.toLocaleString()}</p>
              <p className="text-xs text-gray-500">incidents</p>
            </div>
          </div>

          <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-semibold">{metrics.efficiency}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Efficiency</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.efficiency}%</p>
              <p className="text-xs text-gray-500">success rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emergency Calls Chart */}
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-200 p-2 rounded-lg">
              <LineChart className="w-6 h-6 text-red-700" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Emergency Calls Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={emergencyCallsData}>
              <defs>
                <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
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
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Types Chart */}
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-200 p-2 rounded-lg">
              <PieChart className="w-6 h-6 text-red-700" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Incident Types Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
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
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Station Performance Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Station Performance</h2>
        </div>
        <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wider">Station</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wider">Calls</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wider">Response Time</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wider">Efficiency</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stationPerformanceData.map((station, index) => (
                <tr key={station.name} className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{station.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-600">{station.calls}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-600">{station.responseTime}m</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-600">{station.efficiency}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      station.efficiency >= 95 ? 'bg-green-100 text-green-800' :
                      station.efficiency >= 90 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {station.efficiency >= 95 ? 'Excellent' : station.efficiency >= 90 ? 'Good' : 'Needs Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Export Reports</h3>
            <p className="text-gray-600">Download comprehensive analytics reports</p>
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
    </div>
  );
};

export default AnalyticsPage;