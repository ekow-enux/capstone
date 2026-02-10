'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
import { useStationsStore } from '@/lib/stores/stations';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const { user, fetchStationAdminData, isAuthenticated } = useStationAdminAuthStore();
  const fetchStations = useStationsStore((state) => state.fetchStations);
  const stations = useStationsStore((state) => state.stations);
  const isLoadingStations = useStationsStore((state) => state.isLoading);

  // Fetch stations on mount
  useEffect(() => {
    if (stations.length === 0 && !isLoadingStations) {
      fetchStations().catch((error) => {
        console.error('Error fetching stations:', error);
      });
    }
  }, [stations.length, isLoadingStations, fetchStations]);

  useEffect(() => {
    const checkTempPassword = async () => {
      // Only check for station admin users
      if (!isAuthenticated || !user || user.role !== 'Admin') {
        return;
      }

      // Check if user has stationId
      if (!user.stationId) {
        return;
      }

      try {
        const result = await fetchStationAdminData(user.stationId);
        if (result.hasTempPassword) {
          // Redirect to password change page
          router.replace('/dashboard/admin/change-password');
        }
      } catch (error) {
        console.error('Error checking password status:', error);
        // Don't show error toast, just log it
        // User can still access dashboard if check fails
      }
    };

    checkTempPassword();
  }, [user, fetchStationAdminData, router, isAuthenticated]);

  return <AdminDashboard />;
}

