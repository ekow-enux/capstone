'use client';

import React, { useEffect } from 'react';
import { useAuthStore, selectUser, selectIsAuthenticated } from '@/lib/stores/auth';
import { UserRole } from '@/lib/types/auth';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Dashboard Components
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import OperationsDashboard from '@/components/dashboards/OperationsDashboard';
import SafetyDashboard from '@/components/dashboards/SafetyDashboard';
import PRDashboard from '@/components/dashboards/PRDashboard';

// Layout Components
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface DashboardRouterProps {
  initialRole?: UserRole;
}

const DashboardRouter: React.FC<DashboardRouterProps> = ({ initialRole }) => {
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Client-side redirect to login when unauthenticated
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.replace('/fire-personnel/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // While determining auth or redirecting, render nothing
  if (!isAuthenticated || !user) {
    return null;
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'SuperAdmin':
        return <SuperAdminDashboard />;
      case 'Admin':
        return <AdminDashboard />;
      case 'Operations':
        return <OperationsDashboard />;
      case 'Safety':
        return <SafetyDashboard />;
      case 'PR':
        return <PRDashboard />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Unknown Role
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your role is not recognized. Please contact your administrator.
              </p>
            </div>
          </div>
        );
    }
  };

  // Use the unified fixed sidebar/top bar layout container for all roles
  return (
    <>
      {renderDashboard()}
      <Toaster position="top-right" />
    </>
  );
};

export default DashboardRouter;
