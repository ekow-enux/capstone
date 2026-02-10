'use client';

import React from 'react';
import UnitSidebar from '@/components/layout/UnitSidebar';
import TopBar from '@/components/layout/TopBar';
import { useFirePersonnelAuthStore } from '@/lib/stores/firePersonnelAuth';
import { useRouter } from 'next/navigation';

export default function UnitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logout = useFirePersonnelAuthStore((state) => state.logout);
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
      <UnitSidebar />

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



