'use client';

import { useEffect } from 'react';
import { useEmergencyAlertsStore } from '@/lib/stores/emergencyAlerts';
import { useIncidentsStore } from '@/lib/stores/incidents';

/**
 * Global WebSocket Provider
 * Initializes and maintains WebSocket connection across all pages
 * Handles all real-time CRUD events for alerts and incidents
 */
export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const connectSocket = useEmergencyAlertsStore((state) => state.connectSocket);
  const disconnectSocket = useEmergencyAlertsStore((state) => state.disconnectSocket);
  const isConnected = useEmergencyAlertsStore((state) => state.isConnected);

  // Initialize WebSocket connection on mount
  useEffect(() => {
    // Connect to WebSocket when component mounts
    connectSocket();

    // Cleanup: disconnect when component unmounts (should rarely happen in root layout)
    return () => {
      // Only disconnect if we're actually unmounting the entire app
      // In most cases, we want to keep the connection alive
      // disconnectSocket();
    };
  }, [connectSocket]);

  return <>{children}</>;
}


