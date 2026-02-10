'use client';

import React from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import TopBar from '@/components/layout/TopBar';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logout = useStationAdminAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Ignore errors, proceed with redirect
    }
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar onLogout={handleLogout} />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 bg-gray-50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
