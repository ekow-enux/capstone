'use client';

import SuperAdminSidebar from '@/components/layout/SuperAdminSidebar';
import TopBar from '@/components/layout/TopBar';
import useSuperAdminAuthStore from '@/lib/stores/superAdminAuth';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logout = useSuperAdminAuthStore((state) => state.logout);
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
      <SuperAdminSidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar onLogout={handleLogout} />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 bg-gray-50 dark:bg-gray-900">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}