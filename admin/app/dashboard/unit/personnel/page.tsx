'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFirePersonnelAuthStore } from '@/lib/stores/firePersonnelAuth';
import { useFirePersonnelStore, selectFirePersonnel } from '@/lib/stores/firePersonnel';
import { 
  Users, 
  Search, 
  Mail,
  Phone,
  User,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PersonnelPage: React.FC = () => {
  const { user } = useFirePersonnelAuthStore();
  const firePersonnel = useFirePersonnelStore(selectFirePersonnel);
  const fetchFirePersonnel = useFirePersonnelStore((state) => state.fetchFirePersonnel);
  const isLoadingPersonnel = useFirePersonnelStore((state) => state.isLoading);
  const [searchTerm, setSearchTerm] = useState('');

  const unitId = user?.unitId;
  const stationId = user?.stationId;

  useEffect(() => {
    if (stationId) {
      fetchFirePersonnel(stationId).catch((err) => {
        console.error('Failed to fetch fire personnel:', err);
        toast.error('Failed to load personnel data');
      });
    }
  }, [stationId, fetchFirePersonnel]);

  const unitPersonnel = useMemo(() => {
    if (!unitId) return [];
    let filtered = firePersonnel.filter(p => {
      const pUnitId = typeof p.unit === 'string' 
        ? p.unit 
        : (p.unit?._id || p.unit?.id || p.unitId);
      return pUnitId === unitId;
    });

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.serviceNumber?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        p.phone?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [firePersonnel, unitId, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unit Personnel</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all personnel in your unit</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search personnel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Personnel Grid */}
      {isLoadingPersonnel ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading personnel...</p>
        </div>
      ) : unitPersonnel.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unitPersonnel.map((person) => (
            <div
              key={person._id || person.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {person.name || 'Unknown'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Service #: {person.serviceNumber || 'N/A'}
                  </p>
                  <div className="mt-3 space-y-2">
                    {typeof person.rank === 'string' ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {person.rank}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {person.rank?.name || 'N/A'}
                      </p>
                    )}
                    {person.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {person.email}
                      </p>
                    )}
                    {person.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {person.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No personnel found in this unit</p>
        </div>
      )}
    </div>
  );
};

export default PersonnelPage;



