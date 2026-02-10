'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRoleData } from '@/lib/types/auth';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  Menu, 
  X, 
  LogOut, 
  Settings, 
  Bell, 
  User,
  Home,
  BarChart3,
  Users,
  Shield,
  Megaphone,
  AlertTriangle,
  Building2,
  Activity,
  ChevronDown,
  Search,
  Plus,
  Filter,
  Calendar,
  FileText,
  MapPin,
  Phone,
  Radio,
  Clipboard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Mail,
  MessageSquare,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: UserRoleData;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { logout } = useAuthStore();

  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SuperAdmin':
        return <Shield className="h-5 w-5" />;
      case 'Admin':
        return <Building2 className="h-5 w-5" />;
      case 'Operations':
        return <Activity className="h-5 w-5" />;
      case 'Safety':
        return <AlertTriangle className="h-5 w-5" />;
      case 'PR':
        return <Megaphone className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SuperAdmin':
        return {
          bg: 'bg-gradient-to-br from-red-500 to-red-600',
          text: 'text-white',
          accent: 'bg-red-50 dark:bg-red-900/20',
          accentText: 'text-red-600 dark:text-red-400'
        };
      case 'Admin':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          text: 'text-white',
          accent: 'bg-blue-50 dark:bg-blue-900/20',
          accentText: 'text-blue-600 dark:text-blue-400'
        };
      case 'Operations':
        return {
          bg: 'bg-gradient-to-br from-green-500 to-green-600',
          text: 'text-white',
          accent: 'bg-green-50 dark:bg-green-900/20',
          accentText: 'text-green-600 dark:text-green-400'
        };
      case 'Safety':
        return {
          bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
          text: 'text-white',
          accent: 'bg-yellow-50 dark:bg-yellow-900/20',
          accentText: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'PR':
        return {
          bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
          text: 'text-white',
          accent: 'bg-purple-50 dark:bg-purple-900/20',
          accentText: 'text-purple-600 dark:text-purple-400'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
          text: 'text-white',
          accent: 'bg-gray-50 dark:bg-gray-900/20',
          accentText: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const getRoleTitle = (role: string, subRole?: string) => {
    switch (role) {
      case 'SuperAdmin':
        return 'Super Administrator';
      case 'Admin':
        return 'Station Administrator';
      case 'Operations':
        return subRole === 'main' ? 'Operations Manager' : 
               subRole === 'watchroom' ? 'Watchroom Operator' : 
               subRole === 'crew' ? 'Crew Member' : 'Operations Personnel';
      case 'Safety':
        return 'Safety Officer';
      case 'PR':
        return 'Public Relations Officer';
      default:
        return 'User';
    }
  };

  const getRoleNavigation = (role: string, subRole?: string) => {
    const baseNav = [
      { name: 'Overview', icon: Home, href: '#', active: true },
      { name: 'Analytics', icon: BarChart3, href: '#' },
      { name: 'Reports', icon: FileText, href: '#' },
    ];

    switch (role) {
      case 'SuperAdmin':
        return [
          ...baseNav,
          { name: 'All Stations', icon: Building2, href: '#' },
          { name: 'User Management', icon: Users, href: '#' },
          { name: 'System Config', icon: Settings, href: '#' },
          { name: 'Audit Logs', icon: Database, href: '#' },
        ];
      case 'Admin':
        return [
          ...baseNav,
          { name: 'Personnel', icon: Users, href: '#' },
          { name: 'Departments', icon: Building2, href: '#' },
          { name: 'Station Config', icon: Settings, href: '#' },
        ];
      case 'Operations':
        if (subRole === 'main') {
          return [
            ...baseNav,
            { name: 'Incidents', icon: AlertCircle, href: '#' },
            { name: 'Personnel Status', icon: Users, href: '#' },
            { name: 'Dispatch', icon: Radio, href: '#' },
          ];
        } else if (subRole === 'watchroom') {
          return [
            ...baseNav,
            { name: 'Incoming Calls', icon: Phone, href: '#' },
            { name: 'Dispatch Queue', icon: Radio, href: '#' },
            { name: 'Coverage Map', icon: MapPin, href: '#' },
          ];
        } else if (subRole === 'crew') {
          return [
            ...baseNav,
            { name: 'Assigned Incidents', icon: AlertCircle, href: '#' },
            { name: 'Location Tracking', icon: MapPin, href: '#' },
            { name: 'Crew Status', icon: Users, href: '#' },
          ];
        }
        return baseNav;
      case 'Safety':
        return [
          ...baseNav,
          { name: 'Safety Incidents', icon: AlertTriangle, href: '#' },
          { name: 'Compliance', icon: CheckCircle, href: '#' },
          { name: 'Audit Schedule', icon: Calendar, href: '#' },
        ];
      case 'PR':
        return [
          ...baseNav,
          { name: 'Media Coverage', icon: Globe, href: '#' },
          { name: 'Announcements', icon: Megaphone, href: '#' },
          { name: 'Campaigns', icon: TrendingUp, href: '#' },
          { name: 'Social Media', icon: MessageSquare, href: '#' },
        ];
      default:
        return baseNav;
    }
  };

  const roleColors = getRoleColor(user.role);
  const navigation = getRoleNavigation(user.role, user.subRole);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:w-64 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className={`h-16 px-4 flex items-center justify-between ${roleColors.bg}`}>
          <div className="flex items-center gap-2">
            <div className="text-2xl">🔥</div>
            <div>
              <h1 className="text-lg font-bold text-white">GNFS</h1>
              <p className="text-xs text-white/80">Fire Service</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/80 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${roleColors.bg} shadow-sm`}>
              {getRoleIcon(user.role)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                {getRoleTitle(user.role, user.subRole)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.stationId ? `Station: ${user.stationId}` : 'System Level'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">12</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">45</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Personnel</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4">
          <div className="space-y-1">
            {navigation.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                  item.active 
                    ? `${roleColors.accent} ${roleColors.accentText} font-medium shadow-sm` 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            <button className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 min-w-80">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports, personnel, incidents..."
                  className="bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 flex-1"
                />
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
                <Plus className="h-4 w-4" />
                <span className="font-medium">New Report</span>
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className={`p-1.5 rounded-lg ${roleColors.bg} shadow-sm`}>
                    {getRoleIcon(user.role)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getRoleTitle(user.role, user.subRole)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.stationId ? `Station: ${user.stationId}` : 'System Level'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {getRoleTitle(user.role, user.subRole)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.stationId ? `Station: ${user.stationId}` : 'System Level'}
                      </p>
                    </div>
                    <div className="py-2">
                      <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Profile</span>
                      </a>
                      <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Settings className="h-4 w-4" />
                        <span className="text-sm">Settings</span>
                      </a>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;