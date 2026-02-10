'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useFirePersonnelAuthStore } from '@/lib/stores/firePersonnelAuth';
import { useFirePersonnelStore, selectFirePersonnel } from '@/lib/stores/firePersonnel';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import { useUnitsStore, selectUnits } from '@/lib/stores/units';
import { useDepartmentsStore, selectDepartments } from '@/lib/stores/departments';
import { 
  Flame, 
  AlertTriangle, 
  Users, 
  Building2,
  Droplets,
  Wrench,
  MapPin,
  FileText,
  Clock,
  Activity,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  Eye,
  ArrowRight,
  Power,
  Shield,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
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
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const UnitDashboard: React.FC = () => {
  const { user } = useFirePersonnelAuthStore();
  const firePersonnel = useFirePersonnelStore(selectFirePersonnel);
  const fetchFirePersonnel = useFirePersonnelStore((state) => state.fetchFirePersonnel);
  const isLoadingPersonnel = useFirePersonnelStore((state) => state.isLoading);
  const stations = useStationsStore(selectStations);
  const fetchStations = useStationsStore((state) => state.fetchStations);
  const isLoadingStations = useStationsStore((state) => state.isLoading);
  const units = useUnitsStore(selectUnits);
  const fetchUnits = useUnitsStore((state) => state.fetchUnits);
  const isLoadingUnits = useUnitsStore((state) => state.isLoading);
  const departments = useDepartmentsStore(selectDepartments);
  const fetchDepartments = useDepartmentsStore((state) => state.fetchDepartments);
  const isLoadingDepartments = useDepartmentsStore((state) => state.isLoading);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const unitId = user?.unitId;
  const stationId = user?.stationId;
  const departmentId = user?.departmentId;

  // Fetch data on mount
  useEffect(() => {
    if (stationId) {
      fetchFirePersonnel(stationId).catch((err) => {
        console.error('Failed to fetch fire personnel:', err);
        toast.error('Failed to load personnel data');
      });
      fetchStations().catch((err) => {
        console.error('Failed to fetch stations:', err);
      });
      fetchDepartments(stationId).catch((err) => {
        console.error('Failed to fetch departments:', err);
      });
    }
    if (departmentId) {
      fetchUnits(departmentId, stationId).catch((err) => {
        console.error('Failed to fetch units:', err);
      });
    }
  }, [stationId, departmentId, fetchFirePersonnel, fetchStations, fetchUnits, fetchDepartments]);

  // Get current unit info
  const currentUnit = useMemo(() => {
    if (!unitId) return null;
    return units.find(u => {
      const uId = typeof u._id === 'string' ? u._id : u.id;
      return uId === unitId || u.id === unitId;
    });
  }, [units, unitId]);

  // Get current station info
  const currentStation = useMemo(() => {
    if (!stationId) return null;
    return stations.find(s => {
      const sId = typeof s._id === 'string' ? s._id : s.id;
      return sId === stationId || s.id === stationId;
    });
  }, [stations, stationId]);

  // Get current department info
  const currentDepartment = useMemo(() => {
    if (!departmentId) return null;
    return departments.find(d => {
      const dId = typeof d._id === 'string' ? d._id : d.id;
      return dId === departmentId || d.id === departmentId;
    });
  }, [departments, departmentId]);

  // Get current logged-in personnel info
  const currentPersonnel = useMemo(() => {
    if (!user?.userId) return null;
    return firePersonnel.find(p => {
      const pId = typeof p._id === 'string' ? p._id : p.id;
      return pId === user.userId;
    });
  }, [firePersonnel, user?.userId]);

  // Filter personnel by unit
  const unitPersonnel = useMemo(() => {
    if (!unitId) return [];
    return firePersonnel.filter(p => {
      const pUnitId = typeof p.unit === 'string' 
        ? p.unit 
        : (p.unit?._id || p.unit?.id || p.unitId);
      return pUnitId === unitId;
    });
  }, [firePersonnel, unitId]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Check if unit is active
  // Show activate button if unit is not active or status is unknown
  const isUnitActive = useMemo(() => {
    if (!currentUnit || !unitId) return false;
    // Check if unit has an isActive property (if backend provides it)
    // Default to false (inactive) if property doesn't exist, so button shows
    const unitAny = currentUnit as any;
    // Only return true if explicitly marked as active
    // Since Unit interface doesn't have isActive, this will default to false
    return unitAny.isActive === true || unitAny.active === true;
  }, [currentUnit, unitId]);

  // Debug: Log unit status (moved after declarations)
  useEffect(() => {
    console.log('Unit Dashboard Debug:', {
      unitId,
      currentUnit,
      isUnitActive,
      hasUnitId: !!unitId,
      shouldShowButton: unitId && !isUnitActive
    });
  }, [unitId, currentUnit, isUnitActive]);

  // Mock data for fire types the unit has attended - formatted for charts
  // In real app, these would be fetched from API based on unit's incident history
  const fireTypeMetrics = useMemo(() => {
    return [
      { name: 'Building Fire', value: 12, color: '#ef4444' },
      { name: 'Vehicle Fire', value: 8, color: '#f97316' },
      { name: 'Residential Fire', value: 15, color: '#dc2626' },
      { name: 'Commercial Fire', value: 6, color: '#b91c1c' },
      { name: 'Wildfire', value: 3, color: '#991b1b' },
      { name: 'Other', value: 2, color: '#7f1d1d' },
    ];
  }, []);

  // Mock data for metrics
  const emergencies24h = 8;
  const fireReports24h = 5;
  const activeIncidents = 3;

  // Table columns for Unit Personnel
  const personnelColumns: ColumnDef<typeof firePersonnel[0]>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <span className="font-medium">{row.original.name || 'Unknown'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'serviceNumber',
      header: 'Service Number',
      cell: ({ row }) => <span>{row.original.serviceNumber || 'N/A'}</span>,
    },
    {
      accessorKey: 'rank',
      header: 'Rank',
      cell: ({ row }) => (
        <span>
          {typeof row.original.rank === 'string' 
            ? row.original.rank 
            : row.original.rank?.name || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.email && <Mail className="w-4 h-4 text-gray-400" />}
          <span>{row.original.email || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.phone && <Phone className="w-4 h-4 text-gray-400" />}
          <span>{row.original.phone || 'N/A'}</span>
        </div>
      ),
    },
  ];

  const personnelTable = useReactTable({
    data: unitPersonnel,
    columns: personnelColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleActivateUnit = async () => {
    // In real app, call API to activate unit
    toast.success('Unit activated successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {currentPersonnel?.name || 'Fire Personnel'}
            </h1>
            <p className="text-red-100 text-lg">
              {currentUnit?.name || 'Unit'} • {currentDepartment?.name || 'Department'} • {currentStation?.name || 'Station'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {unitId && !isUnitActive && (
              <button
                onClick={handleActivateUnit}
                className="px-6 py-3 bg-white hover:bg-gray-100 text-red-600 rounded-lg font-semibold flex items-center gap-2 transition shadow-lg hover:shadow-xl"
              >
                <Power className="w-5 h-5" />
                Activate Unit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics - Top Priority */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Emergencies */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Emergencies (24h)</p>
              <p className="text-4xl font-bold text-red-600 dark:text-red-400">{emergencies24h}</p>
            </div>
            <div className="p-3 bg-red-500 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>
          <Link 
            href="/dashboard/unit/emergencies"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Fire Reports */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">Fire Reports (24h)</p>
              <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{fireReports24h}</p>
            </div>
            <div className="p-3 bg-yellow-500 rounded-xl">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
          <Link 
            href="/dashboard/unit/fire-reports"
            className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Active Incidents */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Active Incidents</p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">{activeIncidents}</p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <Link 
            href="/dashboard/unit/incidents"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400 hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Fire Types Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <BarChart3 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fire Types Attended</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Bar Chart</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fireTypeMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]}>
                  {fireTypeMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Pie Chart */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={fireTypeMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name}: ${((props.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fireTypeMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Unit Personnel Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Unit Personnel</h2>
          </div>
          <Link 
            href="/dashboard/unit/personnel"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-6">
          {isLoadingPersonnel ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading...</p>
          ) : unitPersonnel.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  {personnelTable.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {personnelTable.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No personnel in this unit</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitDashboard;
