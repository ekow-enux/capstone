"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { io, Socket } from "socket.io-client";
import {
  EmergencyAlert,
  EmergencyAlertResponse,
  CreateEmergencyAlertData,
  UpdateEmergencyAlertData,
} from "@/lib/types/emergencyAlert";
import { Incident, IncidentResponse } from "@/lib/types/incident";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const EMERGENCY_ALERTS_ENDPOINT = `${API_BASE_URL}/emergency/alerts`;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL 

// Setup incident listeners on the socket (shared connection)
const setupIncidentListeners = (socket: Socket) => {
  // Import incidents store dynamically to avoid circular dependencies
  import('@/lib/stores/incidents').then(({ useIncidentsStore }) => {
    const incidentsStore = useIncidentsStore.getState();
    
    // Incident Created
    socket.on('incident_created', (incidentData: any) => {
      console.log('📋 Incident created:', incidentData);
      incidentsStore.addIncidentFromSocket(incidentData);
    });

    // Incident Updated
    socket.on('incident_updated', (incidentData: any) => {
      console.log('🔄 Incident updated:', incidentData);
      incidentsStore.updateIncidentFromSocket(incidentData);
    });

    // Incident Deleted
    socket.on('incident_deleted', (incidentData: any) => {
      console.log('🗑️ Incident deleted:', incidentData);
      incidentsStore.removeIncidentFromSocket(incidentData);
    });
  });
};

// Setup referral listeners on the socket (shared connection)
const setupReferralListeners = (socket: Socket) => {
  // Import referrals store dynamically to avoid circular dependencies
  import('@/lib/stores/referrals').then(({ useReferralsStore }) => {
    const referralsStore = useReferralsStore.getState();
    
    // Referred Alert Received - Notification removed, only tracking
    socket.on('referred_alert_received', (notification: any) => {
      console.log('📨 Referred alert received:', notification);
      // Notification popup removed - only log for tracking
    });

    // Referred Incident Received - Notification removed, only tracking
    socket.on('referred_incident_received', (notification: any) => {
      console.log('📨 Referred incident received:', notification);
      // Notification popup removed - only log for tracking
    });

    // Referral Created (for tracking)
    socket.on('referral_created', (referralData: any) => {
      console.log('📋 Referral created:', referralData);
      // Optionally update referrals list
      referralsStore.fetchReferrals().catch(err => {
        console.error('Error fetching referrals after creation:', err);
      });
    });

    // Referral Updated
    socket.on('referral_updated', (referralData: any) => {
      console.log('🔄 Referral updated:', referralData);
      // Update referral in store if it exists
      const existingReferral = referralsStore.referrals.find(
        r => (r.id === referralData._id || r._id === referralData._id)
      );
      if (existingReferral) {
        referralsStore.updateReferral(existingReferral.id || existingReferral._id, referralData).catch(err => {
          console.error('Error updating referral:', err);
        });
      }
      
      // Dispatch custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('referralUpdated', { detail: referralData }));
      }
    });
  });
};

interface WebSocketAlertData {
  _id?: string;
  id?: string;
  // New payload structure
  incidentType?: string;
  incidentName?: string;
  userName?: string;
  userContact?: {
    email?: string;
    phone?: string;
  };
  locationName?: string;
  locationUrl?: string;
  gpsCoordinates?: {
    latitude?: number;
    longitude?: number;
    lat?: number; // Alternative field name
    lng?: number; // Alternative field name
  };
  stationInfo?: {
    _id?: string;
    id?: string;
    name?: string;
    location?: string;
    phone?: string;
    phone_number?: string;
    lat?: number;
    lng?: number;
    placeId?: string;
  };
  priority?: string;
  status?: string;
  timestamps?: {
    createdAt?: string;
    updatedAt?: string;
    reportedAt?: string;
  };
  // Legacy/alternative field names (for backward compatibility)
  title?: string;
  locationCoordinates?: {
    latitude: number;
    longitude: number;
  };
  location?: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    locationUrl?: string;
    locationName: string;
  };
  stationName?: string;
  stationId?: string;
  station?: any;
  userPhoneNumber?: string;
  reporterDetails?: {
    id?: string;
    _id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  userId?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  reportedAt?: string;
  [key: string]: any; // Allow any other properties
}

interface ActiveIncidentNotificationData {
  alert: {
    _id: string;
    incidentType: string;
    incidentName: string;
    userName?: string;
    userContact?: {
      email?: string;
      phone?: string;
    };
    locationName: string;
    locationUrl?: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
    };
    stationInfo?: {
      _id: string;
      name: string;
      location?: string;
      phone?: string;
    };
    priority: string;
    timestamps: {
      createdAt: string;
      updatedAt: string;
      reportedAt: string;
    };
    status: string;
  };
  activeIncident: {
    _id: string;
    status: string;
    alertId: string;
    departmentOnDuty?: string;
    unitOnDuty?: string;
    createdAt: string;
  };
  stationId: string;
  message: string;
  requiresAction: boolean;
}

interface EmergencyAlertsStore {
  alerts: EmergencyAlert[];
  currentAlert: EmergencyAlert | null;
  isLoading: boolean;
  error: string | null;
  count: number;
  socket: Socket | null;
  isConnected: boolean;
  activeIncidentNotification: ActiveIncidentNotificationData | null;

  // Actions
  fetchAlerts: () => Promise<void>;
  fetchAlertById: (id: string) => Promise<EmergencyAlert | null>;
  fetchAlertsByStation: (stationId: string) => Promise<void>;
  fetchAlertsByUser: (userId: string) => Promise<void>;
  createAlert: (data: CreateEmergencyAlertData) => Promise<EmergencyAlert | null>;
  updateAlert: (id: string, data: UpdateEmergencyAlertData) => Promise<EmergencyAlert | null>;
  deleteAlert: (id: string) => Promise<boolean>;
  clearError: () => void;
  setCurrentAlert: (alert: EmergencyAlert | null) => void;
  setActiveIncidentNotification: (notification: ActiveIncidentNotificationData | null) => void;
  
  // WebSocket actions
  connectSocket: () => void;
  disconnectSocket: () => void;
  joinStationRoom: (stationId: string) => void;
  leaveStationRoom: (stationId: string) => void;
  addAlertFromSocket: (alertData: WebSocketAlertData) => void;
  updateAlertFromSocket: (alertData: WebSocketAlertData) => void;
  removeAlertFromSocket: (alertData: WebSocketAlertData) => void;
}

// Transform WebSocket alert data to EmergencyAlert
const transformWebSocketAlert = (alertData: WebSocketAlertData): EmergencyAlert => {
  // Use normalizeAlert to handle all the mapping logic
  return normalizeAlert(alertData);
};

// Transform Incident to EmergencyAlert
const transformIncidentToAlert = (incident: any): EmergencyAlert => {
  // Map incident status to alert status
  const statusMap: Record<string, EmergencyAlert['status']> = {
    'pending': 'active',
    'dispatched': 'accepted',
    'en_route': 'accepted',
    'on_scene': 'accepted',
    'completed': 'accepted',
    'cancelled': 'rejected',
  };

  // Handle station - could be ObjectId string or populated object
  let stationId: string | undefined;
  let station: EmergencyAlert['station'] = null;
  
  if (incident.station) {
    if (typeof incident.station === 'string' || (incident.station.$oid)) {
      // Station is just an ObjectId
      stationId = typeof incident.station === 'string' ? incident.station : incident.station.$oid;
    } else {
      // Station is populated object
      stationId = incident.station._id || incident.station.id;
      station = {
        _id: incident.station._id || incident.station.id,
        id: incident.station.id || incident.station._id,
        name: incident.station.name || 'Unknown Station',
        location: incident.station.location,
        phone_number: incident.station.phone_number || undefined,
      };
    }
  }

  // Handle userId - could be ObjectId string or populated object
  let userId: string | undefined;
  let user: EmergencyAlert['user'] = null;
  
  if (incident.userId || incident.reporterId) {
    const reporter = incident.userId || incident.reporterId;
    if (typeof reporter === 'string' || (reporter.$oid)) {
      userId = typeof reporter === 'string' ? reporter : reporter.$oid;
    } else {
      userId = reporter._id || reporter.id;
      user = {
        _id: reporter._id || reporter.id,
        id: reporter.id || reporter._id,
        name: reporter.name,
        phone: reporter.phone,
        email: reporter.email,
      };
    }
  }

  // Handle dates - could be ISO string or MongoDB date object
  const getDateString = (date: any): string => {
    if (!date) return new Date().toISOString();
    if (typeof date === 'string') return date;
    if (date.$date) return date.$date;
    if (date instanceof Date) return date.toISOString();
    return new Date(date).toISOString();
  };

  return {
    _id: incident._id?.$oid || incident._id,
    id: incident.id || incident._id?.$oid || incident._id,
    alertType: incident.incidentType,
    title: incident.incidentName || 'Emergency Alert',
    message: incident.description || incident.incidentName || 'Emergency Alert',
    location: {
      coordinates: incident.location?.coordinates || { latitude: 0, longitude: 0 },
      locationUrl: incident.location?.locationUrl || '',
      locationName: incident.location?.locationName || 'Unknown Location',
    },
    stationId,
    station,
    userId,
    user,
    status: statusMap[incident.status] || 'active',
    priority: incident.priority || 'medium',
    description: incident.description,
    createdAt: getDateString(incident.createdAt || incident.reportedAt),
    updatedAt: getDateString(incident.updatedAt),
    resolvedAt: incident.status === 'completed' ? getDateString(incident.updatedAt || incident.resolvedAt) : undefined,
    __v: incident.__v || 0,
  };
};

// API function to fetch all emergency alerts
const apiFetchAlerts = async (): Promise<EmergencyAlertResponse> => {
  try {
    console.log('🔵 Fetching from:', EMERGENCY_ALERTS_ENDPOINT);
    const response = await axios.get(
      EMERGENCY_ALERTS_ENDPOINT,
      { withCredentials: true }
    );
    
    // Handle different response structures
    let alerts: any[] = [];
    
    if (Array.isArray(response.data)) {
      alerts = response.data;
    } else if (response.data?.data) {
      alerts = Array.isArray(response.data.data) 
        ? response.data.data 
        : [response.data.data];
    } else if (response.data?.success && response.data?.data) {
      alerts = Array.isArray(response.data.data) 
        ? response.data.data 
        : [response.data.data];
    }
    
    return {
      success: true,
      data: alerts,
      count: response.data?.total || response.data?.count || alerts.length,
    };
  } catch (error) {
    console.error('❌ Error fetching emergency alerts:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: (error as any).config?.url || EMERGENCY_ALERTS_ENDPOINT
      });
    }
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch emergency alerts"
      : "Failed to fetch emergency alerts";
    throw new Error(message);
  }
};

// API function to fetch emergency alert by ID
const apiFetchAlertById = async (id: string): Promise<EmergencyAlertResponse> => {
  try {
    const response = await axios.get(
      `${EMERGENCY_ALERTS_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
    
    const alert = response.data?.data || response.data;
    
    return {
      success: true,
      data: alert,
      count: 1,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch emergency alert"
      : "Failed to fetch emergency alert";
    throw new Error(message);
  }
};

// API function to fetch emergency alerts by station
const apiFetchAlertsByStation = async (stationId: string): Promise<EmergencyAlertResponse> => {
  try {
    const response = await axios.get(
      `${EMERGENCY_ALERTS_ENDPOINT}/station/${stationId}`,
      { withCredentials: true }
    );
    
    // Handle different response structures
    let alerts: any[] = [];
    
    if (Array.isArray(response.data)) {
      alerts = response.data;
    } else if (response.data?.data) {
      alerts = Array.isArray(response.data.data) 
        ? response.data.data 
        : [response.data.data];
    } else if (response.data?.success && response.data?.data) {
      alerts = Array.isArray(response.data.data) 
        ? response.data.data 
        : [response.data.data];
    }
    
    return {
      success: true,
      data: alerts,
      count: response.data?.total || response.data?.count || alerts.length,
    };
  } catch (error) {
    console.error('Error fetching station emergency alerts:', error);
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch station emergency alerts"
      : "Failed to fetch station emergency alerts";
    throw new Error(message);
  }
};

// API function to fetch emergency alerts by user
const apiFetchAlertsByUser = async (userId: string): Promise<EmergencyAlertResponse> => {
  try {
    const response = await axios.get(
      `${EMERGENCY_ALERTS_ENDPOINT}/user/${userId}`,
      { withCredentials: true }
    );
    
    // Handle different response structures
    let alerts: any[] = [];
    
    if (Array.isArray(response.data)) {
      alerts = response.data;
    } else if (response.data?.data) {
      alerts = Array.isArray(response.data.data) 
        ? response.data.data 
        : [response.data.data];
    } else if (response.data?.success && response.data?.data) {
      alerts = Array.isArray(response.data.data) 
        ? response.data.data 
        : [response.data.data];
    }
    
    return {
      success: true,
      data: alerts,
      count: response.data?.total || response.data?.count || alerts.length,
    };
  } catch (error) {
    console.error('Error fetching user emergency alerts:', error);
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch user emergency alerts"
      : "Failed to fetch user emergency alerts";
    throw new Error(message);
  }
};

// API function to create emergency alert
const apiCreateAlert = async (alertData: CreateEmergencyAlertData): Promise<EmergencyAlertResponse> => {
  try {
    const { data } = await axios.post<EmergencyAlertResponse>(
      EMERGENCY_ALERTS_ENDPOINT,
      alertData,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to create emergency alert"
      : "Failed to create emergency alert";
    throw new Error(message);
  }
};

// API function to update emergency alert
const apiUpdateAlert = async (
  id: string,
  updateData: UpdateEmergencyAlertData
): Promise<EmergencyAlertResponse> => {
  try {
    const { data } = await axios.patch<EmergencyAlertResponse>(
      `${EMERGENCY_ALERTS_ENDPOINT}/${id}`,
      updateData,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to update emergency alert"
      : "Failed to update emergency alert";
    throw new Error(message);
  }
};

// API function to delete emergency alert
const apiDeleteAlert = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { data } = await axios.delete<{ success: boolean; message?: string }>(
      `${EMERGENCY_ALERTS_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to delete emergency alert"
      : "Failed to delete emergency alert";
    throw new Error(message);
  }
};

// Helper function to normalize alert data
const normalizeAlert = (alert: any): EmergencyAlert => {
  // Handle new payload structure with timestamps object
  const timestamps = alert.timestamps || {};
  const createdAt = timestamps.createdAt || alert.createdAt || timestamps.reportedAt || alert.reportedAt || new Date().toISOString();
  const updatedAt = timestamps.updatedAt || alert.updatedAt || createdAt;
  
  // Handle GPS coordinates - support both gpsCoordinates and legacy formats
  const gpsCoords = alert.gpsCoordinates || alert.locationCoordinates || alert.coordinates || alert.location?.coordinates || {};
  const latitude = gpsCoords.latitude || gpsCoords.lat || 0;
  const longitude = gpsCoords.longitude || gpsCoords.lng || 0;
  
  // Handle user information - new structure uses userName and userContact
  let user: EmergencyAlert['user'] = undefined;
  if (alert.user) {
    // Legacy user object
    user = {
      _id: alert.user._id || alert.user.id || '',
      id: alert.user.id || alert.user._id || '',
      name: alert.user.name,
      email: alert.user.email,
      phone: alert.user.phone,
    };
  } else if (alert.userName || alert.userContact) {
    // New structure: userName + userContact
    user = {
      _id: alert.userId || alert._id || '',
      id: alert.userId || alert.id || '',
      name: alert.userName || 'Unknown',
      email: alert.userContact?.email,
      phone: alert.userContact?.phone || alert.userPhoneNumber,
    };
  } else if (alert.reporterDetails) {
    // Legacy reporterDetails
    user = {
      _id: alert.reporterDetails.id || alert.reporterDetails._id || '',
      id: alert.reporterDetails.id || alert.reporterDetails._id || '',
      name: alert.reporterDetails.name || 'Unknown',
      email: alert.reporterDetails.email,
      phone: alert.reporterDetails.phone,
    };
  }
  
  // Handle station information - new structure uses stationInfo
  let station: EmergencyAlert['station'] = undefined;
  let stationId: string | undefined = undefined;
  
  if (alert.stationInfo) {
    // New structure: stationInfo
    station = {
      _id: alert.stationInfo._id || alert.stationInfo.id || '',
      id: alert.stationInfo.id || alert.stationInfo._id || '',
      name: alert.stationInfo.name || 'Unknown Station',
      location: alert.stationInfo.location,
      phone_number: alert.stationInfo.phone || alert.stationInfo.phone_number,
    };
    stationId = alert.stationInfo._id || alert.stationInfo.id;
  } else if (alert.station) {
    // Legacy station object
    station = {
      _id: alert.station._id || alert.station.id || '',
      id: alert.station.id || alert.station._id || '',
      name: alert.station.name || 'Unknown Station',
      location: alert.station.location,
      phone_number: alert.station.phone_number || alert.station.phone,
    };
    stationId = alert.station._id || alert.station.id;
  } else if (alert.stationName || alert.stationId) {
    // Legacy flat structure
    station = {
      _id: alert.stationId || '',
      id: alert.stationId || '',
      name: alert.stationName || 'Unknown Station',
      location: undefined,
      phone_number: undefined,
    };
    stationId = alert.stationId;
  }
  
  // Map API response structure to our expected structure
  const normalized: EmergencyAlert = {
    ...alert,
    id: alert.id || alert._id,
    _id: alert._id || alert.id,
    // Map incidentName to title
    title: alert.title || alert.incidentName || 'Emergency Alert',
    // Map message - use description or incidentName if message doesn't exist
    message: alert.message || alert.description || alert.incidentName || 'Emergency alert',
    // Map incidentType to alertType
    alertType: (alert.alertType || alert.incidentType || 'other') as EmergencyAlert['alertType'],
    // User information (handled above)
    user: user,
    // Location structure - handle new structure (locationName, locationUrl, gpsCoordinates)
    location: {
      coordinates: { latitude, longitude },
      locationUrl: alert.locationUrl || alert.location?.locationUrl,
      locationName: alert.locationName || alert.location?.locationName || 'Unknown Location',
    },
    // Station information (handled above)
    station: station,
    stationId: stationId || alert.stationId,
    // User ID
    userId: alert.userId || user?._id || user?.id,
    // Status and priority from root level
    status: (alert.status || 'active') as EmergencyAlert['status'],
    priority: (alert.priority || 'high') as EmergencyAlert['priority'],
    // Description
    description: alert.description || alert.notes || undefined,
    // Timestamps from timestamps object or root level
    createdAt: createdAt,
    updatedAt: updatedAt,
  };
  
  return normalized;
};

export const useEmergencyAlertsStore = create<EmergencyAlertsStore>()(
  persist(
    (set, get) => ({
      alerts: [],
      currentAlert: null,
      isLoading: false,
      error: null,
      count: 0,
      socket: null,
      isConnected: false,
      activeIncidentNotification: null,

      fetchAlerts: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchAlerts();
          const alertsArray = Array.isArray(response.data) ? response.data : [response.data];
          const normalizedAlerts = alertsArray.map(normalizeAlert);
          set({
            alerts: normalizedAlerts,
            count: response.count || normalizedAlerts.length,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error in fetchAlerts:', error);
          set({
            error: error instanceof Error ? error.message : "Failed to fetch emergency alerts",
            isLoading: false,
          });
        }
      },

      fetchAlertById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchAlertById(id);
          const alert = Array.isArray(response.data) ? response.data[0] : response.data;
          if (alert) {
            const normalizedAlert = normalizeAlert(alert);
            set({
              currentAlert: normalizedAlert,
              isLoading: false,
              error: null,
            });
            return normalizedAlert;
          }
          set({ isLoading: false, error: null });
          return null;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch emergency alert",
            isLoading: false,
          });
          return null;
        }
      },

      fetchAlertsByStation: async (stationId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchAlertsByStation(stationId);
          const alertsArray = Array.isArray(response.data) ? response.data : [response.data];
          const normalizedAlerts = alertsArray.map(normalizeAlert);
          set({
            alerts: normalizedAlerts,
            count: response.count || normalizedAlerts.length,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch station emergency alerts",
            isLoading: false,
          });
        }
      },

      fetchAlertsByUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchAlertsByUser(userId);
          const alertsArray = Array.isArray(response.data) ? response.data : [response.data];
          const normalizedAlerts = alertsArray.map(normalizeAlert);
          set({
            alerts: normalizedAlerts,
            count: response.count || normalizedAlerts.length,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch user emergency alerts",
            isLoading: false,
          });
        }
      },

      createAlert: async (alertData: CreateEmergencyAlertData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCreateAlert(alertData);
          const alert = Array.isArray(response.data) ? response.data[0] : response.data;
          if (alert) {
            const normalizedAlert = normalizeAlert(alert);
            set((state) => ({
              alerts: [normalizedAlert, ...state.alerts],
              currentAlert: normalizedAlert,
              count: state.count + 1,
              isLoading: false,
              error: null,
            }));
            return normalizedAlert;
          }
          set({ isLoading: false, error: null });
          return null;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to create emergency alert",
            isLoading: false,
          });
          return null;
        }
      },

      updateAlert: async (id: string, updateData: UpdateEmergencyAlertData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiUpdateAlert(id, updateData);
          const alert = Array.isArray(response.data) ? response.data[0] : response.data;
          if (alert) {
            const normalizedAlert = normalizeAlert(alert);
            set((state) => ({
              alerts: state.alerts.map((a) => (a.id === id || a._id === id ? normalizedAlert : a)),
              currentAlert: state.currentAlert?.id === id || state.currentAlert?._id === id 
                ? normalizedAlert 
                : state.currentAlert,
              isLoading: false,
              error: null,
            }));
            return normalizedAlert;
          }
          set({ isLoading: false, error: null });
          return null;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to update emergency alert",
            isLoading: false,
          });
          return null;
        }
      },

      deleteAlert: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiDeleteAlert(id);
          if (response.success) {
            set((state) => ({
              alerts: state.alerts.filter((a) => a.id !== id && a._id !== id),
              currentAlert: state.currentAlert?.id === id || state.currentAlert?._id === id 
                ? null 
                : state.currentAlert,
              count: Math.max(0, state.count - 1),
              isLoading: false,
              error: null,
            }));
            return true;
          }
          set({ isLoading: false, error: null });
          return false;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to delete emergency alert",
            isLoading: false,
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setCurrentAlert: (alert: EmergencyAlert | null) => {
        set({ currentAlert: alert });
      },

      setActiveIncidentNotification: (notification: ActiveIncidentNotificationData | null) => {
        set({ activeIncidentNotification: notification });
      },

      // WebSocket actions
      connectSocket: () => {
        const { socket } = get();
        if (socket?.connected) {
          return;
        }

        // Disconnect existing socket if any
        if (socket) {
          socket.disconnect();
          socket.close();
        }
        
        const newSocket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'], // Try both transports
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: Infinity, // Keep trying to reconnect
          timeout: 20000,
          forceNew: true, // Force a new connection
          autoConnect: true, // Ensure auto-connect is enabled
        });

        newSocket.on('connect', () => {
          console.log('✅ Connected to WebSocket server');
          set({ isConnected: true, socket: newSocket });
        });

        newSocket.on('disconnect', () => {
          set({ isConnected: false });
        });

        newSocket.on('connect_error', (error: any) => {
          console.error('❌ WebSocket connection error:', error.message || error);
          set({ isConnected: false, error: `WebSocket error: ${error.message || 'Unknown error'}` });
        });

        newSocket.on('reconnect', () => {
          set({ isConnected: true });
        });

        // Listen for all events for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          newSocket.onAny((eventName, ...args) => {
            console.log('📨 Socket event:', eventName, args);
          });
        }

        // ========== ALERT CRUD EVENTS ==========
        
        // Alert Created
        newSocket.on('alert_created', (alertData: WebSocketAlertData) => {
          console.log('🚨 Alert created:', alertData);
          get().addAlertFromSocket(alertData);
        });

        // Alert Updated
        newSocket.on('alert_updated', (alertData: WebSocketAlertData) => {
          console.log('🔄 Alert updated:', alertData);
          get().updateAlertFromSocket(alertData);
        });

        // Alert Deleted
        newSocket.on('alert_deleted', (alertData: WebSocketAlertData) => {
          console.log('🗑️ Alert deleted:', alertData);
          get().removeAlertFromSocket(alertData);
        });

        // Legacy event names (backward compatibility)
        newSocket.on('new_alert', (alertData: WebSocketAlertData) => {
          console.log('🚨 New alert (legacy event):', alertData);
          get().addAlertFromSocket(alertData);
        });

        newSocket.on('emergency_alert', (alertData: WebSocketAlertData) => {
          get().addAlertFromSocket(alertData);
        });

        newSocket.on('alert', (alertData: WebSocketAlertData) => {
          get().addAlertFromSocket(alertData);
        });

        // Active Incident Exists Event
        newSocket.on('active_incident_exists', (notificationData: ActiveIncidentNotificationData) => {
          console.log('⚠️ Active incident notification received:', notificationData);
          get().setActiveIncidentNotification(notificationData);
          
          // Dispatch custom event for components to listen to
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('activeIncidentExists', { detail: notificationData }));
          }
        });

        // Set socket in store
        set({ socket: newSocket });
        
        // Ensure socket connects - manually connect if needed
        if (!newSocket.connected && !newSocket.disconnected) {
          newSocket.connect();
        }

        // Setup incident listeners on the same socket connection
        setupIncidentListeners(newSocket);
        setupReferralListeners(newSocket);
      },

      disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          socket.close();
          set({ socket: null, isConnected: false });
        }
      },

      joinStationRoom: (stationId: string) => {
        const { socket } = get();
        if (socket?.connected) {
          socket.emit('join_station', stationId);
        }
      },

      leaveStationRoom: (stationId: string) => {
        const { socket } = get();
        if (socket?.connected) {
          socket.emit('leave_station', stationId);
        }
      },

      addAlertFromSocket: (alertData: WebSocketAlertData) => {
        try {
          // Transform the WebSocket alert data (which already normalizes it)
          const normalizedAlert = transformWebSocketAlert(alertData);
          
          // Check if alert already exists (avoid duplicates)
          const { alerts } = get();
          const alertId = normalizedAlert._id || normalizedAlert.id;
          const exists = alerts.some(a => {
            const aId = a._id || a.id;
            return aId === alertId;
          });
          
          if (!exists) {
            set((state) => ({
              alerts: [normalizedAlert, ...state.alerts],
              count: state.count + 1,
            }));
            
            // Trigger a custom event that components can listen to
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('newEmergencyAlert', { detail: normalizedAlert }));
            }
          }
        } catch (error) {
          console.error('❌ Error processing WebSocket alert:', error);
        }
      },

      updateAlertFromSocket: (alertData: WebSocketAlertData) => {
        try {
          const normalizedAlert = transformWebSocketAlert(alertData);
          const alertId = normalizedAlert._id || normalizedAlert.id;
          
          set((state) => ({
            alerts: state.alerts.map((alert) => {
              const aId = alert._id || alert.id;
              return aId === alertId ? { ...alert, ...normalizedAlert } : alert;
            }),
            currentAlert: state.currentAlert && 
              ((state.currentAlert._id === alertId) || (state.currentAlert.id === alertId))
                ? { ...state.currentAlert, ...normalizedAlert }
                : state.currentAlert,
          }));
          
          // Trigger update event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('emergencyAlertUpdated', { detail: normalizedAlert }));
          }
        } catch (error) {
          console.error('❌ Error updating alert from WebSocket:', error);
        }
      },

      removeAlertFromSocket: (alertData: WebSocketAlertData) => {
        try {
          const alertId = alertData._id || alertData.id;
          
          set((state) => ({
            alerts: state.alerts.filter((alert) => {
              const aId = alert._id || alert.id;
              return aId !== alertId;
            }),
            count: Math.max(0, state.count - 1),
            currentAlert: state.currentAlert && 
              ((state.currentAlert._id === alertId) || (state.currentAlert.id === alertId))
                ? null
                : state.currentAlert,
          }));
          
          // Trigger delete event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('emergencyAlertDeleted', { detail: alertData }));
          }
        } catch (error) {
          console.error('❌ Error removing alert from WebSocket:', error);
        }
      },
    }),
    {
      name: "gnfs-emergency-alerts-storage",
      partialize: (state) => ({
        // Don't persist alerts - always fetch fresh data from API
        // Only persist UI state if needed
      }),
    }
  )
);

// Selectors for easy access
export const selectEmergencyAlerts = (state: EmergencyAlertsStore) => state.alerts;
export const selectCurrentEmergencyAlert = (state: EmergencyAlertsStore) => state.currentAlert;
export const selectEmergencyAlertsIsLoading = (state: EmergencyAlertsStore) => state.isLoading;
export const selectEmergencyAlertsError = (state: EmergencyAlertsStore) => state.error;
export const selectEmergencyAlertsCount = (state: EmergencyAlertsStore) => state.count;

export default useEmergencyAlertsStore;

