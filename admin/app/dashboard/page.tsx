'use client';

import DashboardRouter from '@/components/DashboardRouter';
import SuperAdminSidebar from '@/components/layout/SuperAdminSidebar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import OperationsSidebar from '@/components/layout/OperationsSidebar';
import TopBar from '@/components/layout/TopBar';
import ActiveIncidentsBanner from '@/components/incidents/ActiveIncidentsBanner';
import { useAuthStore } from '@/lib/stores/auth';
import { useRouter, usePathname } from 'next/navigation';

export default function Dashboard() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  
  // Show floating banner if not on main dashboard or incidents page
  const isMainDashboard = pathname === '/dashboard' || pathname === '/dashboard/superadmin' || pathname === '/dashboard/admin';
  const isIncidentsPage = pathname?.includes('/incidents');
  const showFloatingBanner = !isMainDashboard && !isIncidentsPage;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Render appropriate sidebar based on user role
  const renderSidebar = () => {
    if (user?.role === 'SuperAdmin') {
      return <SuperAdminSidebar />;
    }
    if (user?.role === 'Operations') {
      return <OperationsSidebar />;
    }
    // Use Admin sidebar as the unified default for Admin and other roles
    return <AdminSidebar />;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar onLogout={handleLogout} />
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 bg-gray-50 dark:bg-gray-900">
            {showFloatingBanner && <ActiveIncidentsBanner isFloating={true} />}
            <DashboardRouter />
          </div>
        </div>
      </div>
    </div>
  );
}
