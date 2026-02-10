'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import {
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Clock,
  User,
  Building2
} from 'lucide-react';

interface TopBarProps {
  onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onLogout }) => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const regularUser = useAuthStore((state) => state.user);
  const stationAdminUser = useStationAdminAuthStore((state) => state.user);
  const stations = useStationsStore(selectStations);

  // Use station admin user if available, otherwise use regular user
  const user = stationAdminUser || regularUser;

  // Set mounted state and initial time on client only
  useEffect(() => {
    setIsMounted(true);
    setCurrentTime(new Date());
  }, []);

  // Update time every second
  useEffect(() => {
    if (!isMounted) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isMounted]);

  // Get greeting based on time of day
  const getGreeting = () => {
    if (!currentTime) return 'Hello';
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Dashboard', href: '/dashboard' }];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (index > 0) { // Skip the first segment (dashboard)
        breadcrumbs.push({ name, href: currentPath });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // You can implement actual dark mode logic here
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Left side - Breadcrumbs */}
      <div className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.href}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <span className={`text-sm font-medium ${
              index === breadcrumbs.length - 1 
                ? 'text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}>
              {breadcrumb.name}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right side - Greeting, Time, Theme Toggle, Logout */}
      <div className="flex items-center space-x-6">
        {/* Greeting */}
        <div className="flex items-center space-x-2">
          {currentStation ? (
            <>
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {getGreeting()}, <span className="font-semibold text-gray-900">{currentStation.name}</span>
              </span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {getGreeting()}, <span className="font-semibold text-gray-900">{user?.role || 'Admin'}</span>
                {user?.role === 'Operations' && user?.departmentId && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                    {(() => {
                      const departments: Record<string, string> = {
                        'dept-1': 'Fire Suppression',
                        'dept-2': 'Emergency Medical Services',
                        'dept-3': 'Rescue Operations',
                        'dept-4': 'Prevention & Safety',
                        'dept-5': 'Training & Development',
                      };
                      return departments[user.departmentId] || 'Operations';
                    })()}
                  </span>
                )}
              </span>
            </>
          )}
        </div>

        {/* Time */}
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-mono text-gray-600">
            {(() => {
              if (!isMounted || !currentTime || !(currentTime instanceof Date)) {
                return <span className="inline-block w-20 h-4 bg-gray-200 animate-pulse rounded"></span>;
              }
              try {
                return currentTime.toLocaleTimeString('en-US', { 
                  hour12: true, 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                });
              } catch (e) {
                return <span className="inline-block w-20 h-4 bg-gray-200 animate-pulse rounded"></span>;
              }
            })()}
          </span>
        </div>

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
