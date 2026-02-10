'use client';

import React, { useState, useMemo } from 'react';
import { 
  Flame,
  User,
  Search,
  Eye,
  Edit,
  FileText,
  AlertTriangle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Download,
  TrendingUp,
  Users,
  X,
  FolderTree,
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

interface FirePersonnel {
  id: string;
  name: string;
  rank: string;
  email: string;
  phone: string;
  station: string;
  department: string;
  unit?: string;
  group?: string;
  status: 'active' | 'on-leave' | 'retired';
  incidentCount: number;
  lastIncident: string;
  joinedDate: string;
}

// Mock department mapping
const getDepartmentName = (departmentId?: string): string => {
  const departments: Record<string, string> = {
    'dept-1': 'Fire Suppression',
    'dept-2': 'Emergency Medical Services',
    'dept-3': 'Rescue Operations',
    'dept-4': 'Prevention & Safety',
    'dept-5': 'Training & Development',
  };
  return departments[departmentId || ''] || 'Operations';
};

const OperationsFirePersonnelPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedUser, setSelectedUser] = useState<FirePersonnel | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<FirePersonnel | null>(null);
  const [editFormData, setEditFormData] = useState({
    unit: '',
    group: ''
  });
  const user = useAuthStore((state) => state.user);
  
  const userDepartmentName = getDepartmentName(user?.departmentId);

  // Mock data - all personnel (would be filtered by API in production)
  const [allPersonnel, setAllPersonnel] = useState<FirePersonnel[]>([
    {
      id: '1',
      name: 'James Osei',
      rank: 'Chief Fire Officer',
      email: 'james.osei@gnfs.gov.gh',
      phone: '+233 24 123 4567',
      station: 'Accra Central',
      department: 'Fire Suppression',
      unit: 'Unit A',
      group: 'Group 1',
      status: 'active',
      incidentCount: 45,
      lastIncident: '2024-02-15',
      joinedDate: '2010-05-20'
    },
    {
      id: '2',
      name: 'Kofi Mensah',
      rank: 'Deputy Chief Fire Officer',
      email: 'kofi.mensah@gnfs.gov.gh',
      phone: '+233 24 234 5678',
      station: 'Accra Central',
      department: 'Fire Suppression',
      unit: 'Unit A',
      group: 'Group 2',
      status: 'active',
      incidentCount: 38,
      lastIncident: '2024-02-14',
      joinedDate: '2012-08-15'
    },
    {
      id: '3',
      name: 'Ama Darko',
      rank: 'Assistant Chief Fire Officer',
      email: 'ama.darko@gnfs.gov.gh',
      phone: '+233 24 345 6789',
      station: 'Accra Central',
      department: 'Fire Suppression',
      unit: 'Unit B',
      group: 'Group 3',
      status: 'on-leave',
      incidentCount: 32,
      lastIncident: '2024-01-30',
      joinedDate: '2015-03-10'
    },
    {
      id: '4',
      name: 'Yaw Boateng',
      rank: 'Divisional Officer',
      email: 'yaw.boateng@gnfs.gov.gh',
      phone: '+233 24 456 7890',
      station: 'Accra Central',
      department: 'Fire Suppression',
      unit: 'Unit B',
      group: 'Group 4',
      status: 'active',
      incidentCount: 28,
      lastIncident: '2024-02-10',
      joinedDate: '2018-06-05'
    },
    {
      id: '5',
      name: 'Akosua Agyeman',
      rank: 'Station Officer',
      email: 'akosua.agyeman@gnfs.gov.gh',
      phone: '+233 24 567 8901',
      station: 'Accra Central',
      department: 'Emergency Medical Services',
      unit: 'Unit C',
      group: 'Group 5',
      status: 'active',
      incidentCount: 22,
      lastIncident: '2024-02-12',
      joinedDate: '2020-01-15'
    },
    {
      id: '6',
      name: 'Kwame Asante',
      rank: 'Fire Fighter',
      email: 'kwame.asante@gnfs.gov.gh',
      phone: '+233 24 678 9012',
      station: 'Accra Central',
      department: 'Fire Suppression',
      unit: 'Unit A',
      group: 'Group 1',
      status: 'active',
      incidentCount: 15,
      lastIncident: '2024-02-13',
      joinedDate: '2021-07-20'
    }
  ]);

  // Filter personnel by department - operations account only sees their department
  const firePersonnel = useMemo(() => {
    if (!user?.departmentId) return [];
    return allPersonnel.filter(p => p.department === userDepartmentName);
  }, [user?.departmentId, userDepartmentName]);

  const columns: ColumnDef<FirePersonnel>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.name}</div>
              <div className="text-xs text-gray-500">{row.original.rank}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        cell: ({ row }) => (
          <div className="text-gray-600">{row.original.unit || 'Not assigned'}</div>
        ),
      },
      {
        accessorKey: 'group',
        header: 'Group',
        cell: ({ row }) => (
          <div className="text-gray-600">{row.original.group || 'Not assigned'}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const statusColors = {
            active: 'bg-green-100 text-green-800 border-green-200',
            'on-leave': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            retired: 'bg-gray-100 text-gray-800 border-gray-200'
          };
          return (
            <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${
              statusColors[status as keyof typeof statusColors] || statusColors.active
            }`}>
              {status.replace('-', ' ').toUpperCase()}
            </span>
          );
        },
      },
      {
        accessorKey: 'incidentCount',
        header: 'Incidents',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-gray-900">{getValue() as number}</span>
          </div>
        ),
      },
      {
        accessorKey: 'lastIncident',
        header: 'Last Incident',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{getValue() as string}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedUser(row.original);
                setShowModal(true);
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditingPersonnel(row.original);
                setEditFormData({
                  unit: row.original.unit || '',
                  group: row.original.group || ''
                });
                setShowEditModal(true);
              }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Edit Unit & Group"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: firePersonnel,
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

  const filteredData = useMemo(() => {
    if (!searchTerm) return firePersonnel;
    return firePersonnel.filter(
      personnel =>
        personnel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        personnel.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
        personnel.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, firePersonnel]);

  // Available units and groups for dropdown (from department)
  const availableUnits = ['Unit A', 'Unit B', 'Unit C'];
  const availableGroups = ['Group 1', 'Group 2', 'Group 3', 'Group 4', 'Group 5'];

  const handleSaveEdit = () => {
    if (!editingPersonnel) return;
    setAllPersonnel(prev => prev.map(p => 
      p.id === editingPersonnel.id 
        ? { ...p, unit: editFormData.unit, group: editFormData.group }
        : p
    ));
    setShowEditModal(false);
    setEditingPersonnel(null);
    setEditFormData({ unit: '', group: '' });
  };

  const totalPersonnel = firePersonnel.length;
  const activePersonnel = firePersonnel.filter(p => p.status === 'active').length;
  const totalIncidents = firePersonnel.reduce((sum, p) => sum + p.incidentCount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <Flame className="w-12 h-12 text-red-600" />
              Fire Personnel - {userDepartmentName}
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              View and manage fire service personnel in your department
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+2</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Personnel</h3>
            <p className="text-3xl font-bold text-gray-900">{totalPersonnel}</p>
            <p className="text-xs text-gray-500">in department</p>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 p-6 rounded-xl hover:border-blue-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Personnel</h3>
            <p className="text-3xl font-bold text-gray-900">{activePersonnel}</p>
            <p className="text-xs text-gray-500">currently active</p>
          </div>
        </div>

        <div className="bg-white border-2 border-green-200 p-6 rounded-xl hover:border-green-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Incidents</h3>
            <p className="text-3xl font-bold text-gray-900">{totalIncidents}</p>
            <p className="text-xs text-gray-500">department incidents</p>
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
                placeholder="Search personnel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Personnel Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Users className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Personnel List</h2>
        </div>
        <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wider"
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
              {filteredData.map((personnel, index) => (
                <tr key={personnel.id} className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}>
                  {table.getRowModel().rows[index]?.getVisibleCells().map(cell => (
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
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No personnel found</p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">Personnel Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <AlertTriangle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-gray-600">{selectedUser.rank}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-900">{selectedUser.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Station</p>
                      <p className="font-semibold text-gray-900">{selectedUser.station}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="font-semibold text-gray-900">{selectedUser.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FolderTree className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Unit</p>
                      <p className="font-semibold text-gray-900">{selectedUser.unit || 'Not assigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FolderTree className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Group</p>
                      <p className="font-semibold text-gray-900">{selectedUser.group || 'Not assigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Joined Date</p>
                      <p className="font-semibold text-gray-900">{selectedUser.joinedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Total Incidents</p>
                      <p className="font-semibold text-gray-900">{selectedUser.incidentCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Unit & Group Modal */}
      {showEditModal && editingPersonnel && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">Edit Unit & Group</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPersonnel(null);
                    setEditFormData({ unit: '', group: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{editingPersonnel.name}</h3>
                  <p className="text-gray-600">{editingPersonnel.rank}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit *</label>
                  <select
                    value={editFormData.unit}
                    onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
                  >
                    <option value="">Select Unit</option>
                    {availableUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Group *</label>
                  <select
                    value={editFormData.group}
                    onChange={(e) => setEditFormData({ ...editFormData, group: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
                  >
                    <option value="">Select Group</option>
                    {availableGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPersonnel(null);
                    setEditFormData({ unit: '', group: '' });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editFormData.unit || !editFormData.group}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsFirePersonnelPage;

