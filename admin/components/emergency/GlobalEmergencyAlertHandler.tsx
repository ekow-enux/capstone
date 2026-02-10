'use client';

import React, { useEffect, useState } from 'react';
import { EmergencyAlert } from '@/lib/types/emergencyAlert';
import { useEmergencyAlertsStore } from '@/lib/stores/emergencyAlerts';
import { useAuthStore } from '@/lib/stores/auth';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
import EmergencyAlertPopup from './EmergencyAlertPopup';

/**
 * Global component that listens to WebSocket events for emergency alerts
 * and displays the alert popup regardless of the current page.
 * This ensures users are notified of new alerts no matter where they are in the app.
 */
const GlobalEmergencyAlertHandler: React.FC = () => {
  const [currentAlert, setCurrentAlert] = useState<EmergencyAlert | null>(null);
  
  // Get user info to determine if alert is relevant
  const regularUser = useAuthStore((state) => state.user);
  const stationAdminUser = useStationAdminAuthStore((state) => state.user);
  const user = stationAdminUser || regularUser;
  const userRole = user?.role;
  
  // Get station ID for Admin users
  const currentStationId = user?.stationId || 
    (stationAdminUser?.stationAdminData?.station?.id) ||
    (user as any)?.stationAdminData?.station?.id;

  // Get alert actions and WebSocket from store
  const updateAlert = useEmergencyAlertsStore((state) => state.updateAlert);
  const connectSocket = useEmergencyAlertsStore((state) => state.connectSocket);
  const disconnectSocket = useEmergencyAlertsStore((state) => state.disconnectSocket);
  const joinStationRoom = useEmergencyAlertsStore((state) => state.joinStationRoom);
  const leaveStationRoom = useEmergencyAlertsStore((state) => state.leaveStationRoom);
  const isConnected = useEmergencyAlertsStore((state) => state.isConnected);
  const fetchAlerts = useEmergencyAlertsStore((state) => state.fetchAlerts);
  const alerts = useEmergencyAlertsStore((state) => state.alerts);

  // Connect to WebSocket and fetch alerts globally for authenticated users
  useEffect(() => {
    if (user) {
      if (!isConnected) {
        console.log('🔌 Connecting WebSocket globally for user:', userRole);
        connectSocket();
      }

      // Fetch alerts to check for existing active alerts
      const loadAlerts = async () => {
        try {
          await fetchAlerts();
        } catch (error) {
          console.error('Error fetching alerts globally:', error);
        }
      };
      loadAlerts();
    }
  }, [user, isConnected, connectSocket, fetchAlerts]);

  // Handle station room joining/leaving for Station Admins
  useEffect(() => {
    if (isConnected && userRole === 'Admin' && currentStationId) {
      console.log('🏢 Joining station room globally:', currentStationId);
      joinStationRoom(currentStationId);

      // Return cleanup function to leave room when station changes
      return () => {
        console.log('🏢 Leaving station room globally:', currentStationId);
        leaveStationRoom(currentStationId);
      };
    }
  }, [isConnected, userRole, currentStationId, joinStationRoom, leaveStationRoom]);

  // Cleanup WebSocket on unmount or user logout
  useEffect(() => {
    return () => {
      if (!user && isConnected) {
        console.log('🔌 Disconnecting WebSocket globally');
        disconnectSocket();
      }
    };
  }, [user, isConnected, disconnectSocket]);

  // Show existing active alerts when user logs in
  useEffect(() => {
    if (user && alerts.length > 0) {
      const activeAlerts = alerts.filter(alert =>
        (alert.status === 'active' || alert.status === 'pending') &&
        (!currentStationId || // SuperAdmin sees all
         userRole !== 'Admin' || // Non-admin sees all
         alert.station?.id === currentStationId ||
         alert.station?._id === currentStationId ||
         alert.stationId === currentStationId)
      );

      // Show the most recent active alert if any
      if (activeAlerts.length > 0 && !currentAlert) {
        const mostRecent = activeAlerts.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        setCurrentAlert(mostRecent);
      }
    }
  }, [user, alerts, userRole, currentStationId, currentAlert]);

  // Listen for new alerts from WebSocket
  useEffect(() => {
    const handleNewAlert = (event: CustomEvent) => {
      const newAlert: EmergencyAlert = event.detail;

      if (!newAlert) {
        return;
      }

      // Only show if status is 'active' or 'pending'
      const shouldShowByStatus = newAlert.status === 'active' || newAlert.status === 'pending';

      if (!shouldShowByStatus) {
        return;
      }

      // For Admin users, check if alert is relevant to their station
      if (userRole === 'Admin' && currentStationId) {
        const isRelevant =
          newAlert.station?.id === currentStationId ||
          newAlert.station?._id === currentStationId ||
          newAlert.stationId === currentStationId;

        if (!isRelevant) {
          return;
        }
      }

      // For SuperAdmin, show all active/pending alerts
      // For Admin, we've already filtered by station above
      // For other roles, show all active/pending alerts
      setCurrentAlert(newAlert);
    };

    window.addEventListener('newEmergencyAlert', handleNewAlert as EventListener);

    return () => {
      window.removeEventListener('newEmergencyAlert', handleNewAlert as EventListener);
    };
  }, [userRole, currentStationId]);

  // Handle alert actions
  const handleAcknowledge = async (alertId: string) => {
    try {
      await updateAlert(alertId, { status: 'accepted' });
      setCurrentAlert(null);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleReject = async (alertId: string, reason: string) => {
    try {
      // Update alert status to 'rejected'
      // Note: The decline reason can be stored in description if needed
      await updateAlert(alertId, { 
        status: 'rejected',
        description: reason 
      });
      setCurrentAlert(null);
    } catch (error) {
      console.error('Error rejecting alert:', error);
      throw error;
    }
  };

  const handleRefer = async (alertId: string, stationId: string, reason: string) => {
    try {
      // Update alert status to 'referred'
      // Note: The actual referral is created via the referrals API in EmergencyAlertPopup
      await updateAlert(alertId, { 
        status: 'referred'
      });
      setCurrentAlert(null);
    } catch (error) {
      console.error('Error referring alert:', error);
      throw error;
    }
  };

  const handleClose = () => {
    setCurrentAlert(null);
  };

  // Only render popup if there's an alert
  if (!currentAlert) {
    return null;
  }

  return (
    <EmergencyAlertPopup
      alert={currentAlert}
      onClose={handleClose}
      onAcknowledge={handleAcknowledge}
      onReject={handleReject}
      onRefer={handleRefer}
    />
  );
};

export default GlobalEmergencyAlertHandler;

