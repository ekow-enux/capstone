'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import {
  LayoutDashboard,
  Building2,
  Users,
  AlertTriangle,
  Ambulance,
  Wrench,
  FileText,
  LogOut,
  Menu,
  X,
  Flame,
  Clock,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const OperationsSidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const menuItems: SidebarItem[] = [
    { name: 'Dashboard', href: '/dashboard/operations', icon: LayoutDashboard },
    { name: 'Incidents', href: '/dashboard/operations/incidents', icon: AlertTriangle },
    { name: 'Emergency', href: '/dashboard/operations/emergency', icon: Ambulance },
    { name: 'Fire Personnel', href: '/dashboard/operations/fire-personnel', icon: Users },
    { name: 'Departments', href: '/dashboard/operations/departments', icon: Building2 },
    { name: 'Equipment', href: '/dashboard/operations/equipment', icon: Wrench },
    { name: 'Turnout Slips', href: '/dashboard/operations/turnout-slips', icon: FileText },
    { name: 'Logs', href: '/dashboard/operations/logs', icon: Clock },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard/operations') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
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
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-gradient-to-b from-green-600 to-green-700 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-green-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">GNFS Admin</h2>
                <p className="text-xs text-green-100">Operations</p>
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
                    active
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-green-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-green-500/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-green-100 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 bg-green-600 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
};

export default OperationsSidebar;

