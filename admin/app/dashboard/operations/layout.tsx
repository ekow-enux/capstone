'use client';

import React from 'react';
import OperationsSidebar from '@/components/layout/OperationsSidebar';
import TopBar from '@/components/layout/TopBar';
import { useAuthStore } from '@/lib/stores/auth';
import { useRouter } from 'next/navigation';

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <OperationsSidebar />

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




