'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Building2,
  Users,
  Settings,
  Database,
  AlertTriangle,
  Shield,
  LogOut,
  Menu,
  X,
  Flame,
  Ambulance,
  Wrench,
  Eye,
  Network,
  UserCircle,
  UserCheck,
  Badge,
  UserCog,
  BookOpen,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  indent?: boolean;
}

const AdminSidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logout = useStationAdminAuthStore((state) => state.logout);
  const user = useStationAdminAuthStore((state) => state.user);
  const stations = useStationsStore(selectStations);

  // Get current station for Station Admin
  const currentStationId = user?.stationId;
  const currentStation = React.useMemo(() => {
    if (!currentStationId || stations.length === 0) return null;
    const station = stations.find(s => {
      const stationId = s._id || s.id;
      return stationId && String(stationId) === String(currentStationId);
    });
    return station || null;
  }, [stations, currentStationId]);

  const menuItems: SidebarItem[] = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
    { name: 'Stations', href: '/dashboard/admin/stations', icon: Building2 },
    { name: 'Civilians', href: '/dashboard/admin/users/civilian', icon: UserCircle },
    { name: 'Officers', href: '/dashboard/admin/users/fire-personnel', icon: UserCheck },
    { name: 'Ranks', href: '/dashboard/admin/users/ranks', icon: Badge },
    { name: 'Roles', href: '/dashboard/admin/users/roles', icon: UserCog },
    { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
    { name: 'Subdivisions', href: '/dashboard/admin/subdivisions', icon: Network },
    { name: 'Units', href: '/dashboard/admin/units', icon: Shield },
    { name: 'Incidents', href: '/dashboard/admin/incidents', icon: AlertTriangle },
    { name: 'Emergency', href: '/dashboard/admin/emergency', icon: Ambulance },
    { name: 'Equipment', href: '/dashboard/admin/equipment', icon: Wrench },
    { name: 'Outlook', href: '/dashboard/admin/outlook', icon: Eye },
    { name: 'Fire Safety Tips', href: '/dashboard/admin/fire-safety', icon: Flame },
    { name: 'AI Education', href: '/dashboard/admin/ai-education', icon: BookOpen },
    { name: 'Audit', href: '/dashboard/admin/audit', icon: Database },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Ignore errors, proceed with redirect
    }
    router.push('/');
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-gradient-to-b from-red-600 to-red-700 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-red-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{currentStation?.name || 'GNFS Admin'}</h2>
                <p className="text-xs text-red-100">Station Admin</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-white hover:bg-white/20 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    item.indent ? 'pl-8' : ''
                  } ${
                    active
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-red-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-red-500/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-100 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 bg-red-600 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
};

export default AdminSidebar;

