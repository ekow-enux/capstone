"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Incident, IncidentResponse } from "@/lib/types/incident";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const INCIDENTS_ENDPOINT = `${API_BASE_URL}/incidents`;

interface WebSocketIncidentData {
  _id?: string;
  id?: string;
  alertId?: any;
  departmentOnDuty?: any;
  unitOnDuty?: any;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  responseTimeMinutes?: number | null;
  resolutionTimeMinutes?: number | null;
  totalIncidentTimeMinutes?: number | null;
  [key: string]: any;
}

interface IncidentsStore {
  incidents: Incident[];
  currentIncident: Incident | null;
  isLoading: boolean;
  error: string | null;
  count: number;

  fetchIncidents: () => Promise<void>;
  fetchIncidentById: (id: string) => Promise<Incident | null>;
  updateIncident: (id: string, incidentData: Partial<Incident>) => Promise<Incident>;
  clearError: () => void;
  setCurrentIncident: (incident: Incident | null) => void;
  addIncidentFromSocket: (incidentData: WebSocketIncidentData) => void;
  updateIncidentFromSocket: (incidentData: WebSocketIncidentData) => void;
  removeIncidentFromSocket: (incidentData: WebSocketIncidentData) => void;
}

// API function to fetch all incidents
const apiFetchIncidents = async (): Promise<IncidentResponse> => {
  try {
    const response = await axios.get<IncidentResponse>(
      INCIDENTS_ENDPOINT,
      { withCredentials: true }
    );

    // The API returns: { success: true, data: [...], pagination: {...} }
    const responseData = response.data;
    
    let incidents: any[] = [];
    let pagination = undefined;
    let total = 0;

    // Extract incidents array from response.data
    if (responseData && typeof responseData === 'object') {
      // Check if response.data has the structure { success, data, pagination }
      if ('data' in responseData) {
        if (Array.isArray(responseData.data)) {
          incidents = responseData.data;
        } else if (responseData.data) {
          incidents = [responseData.data];
        }
      }
      
      // Extract pagination if present
      if (responseData.pagination) {
        pagination = responseData.pagination;
        total = responseData.pagination.total;
      } else if (responseData.total !== undefined) {
        total = responseData.total;
      } else if (responseData.count !== undefined) {
        total = responseData.count;
      } else {
        total = incidents.length;
      }
    } 
    // Fallback: if response.data is directly an array
    else if (Array.isArray(responseData)) {
      incidents = responseData;
      total = incidents.length;
    }

    return {
      success: responseData?.success ?? true,
      data: incidents,
      count: total,
      total: total,
      pagination: pagination,
    };
  } catch (error) {
    console.error("❌ Error fetching incidents:", error);
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        error.message ||
        "Failed to fetch incidents"
      : "Failed to fetch incidents";
    throw new Error(message);
  }
};

// API function to update an incident
const apiUpdateIncident = async (id: string, incidentData: Partial<Incident>): Promise<{ success: boolean; data: Incident }> => {
  try {
    const { data } = await axios.patch<{ success: boolean; data: Incident }>(
      `${INCIDENTS_ENDPOINT}/${id}`,
      incidentData,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to update incident"
      : "Failed to update incident";
    throw new Error(message);
  }
};

// API function to fetch incident by ID
const apiFetchIncidentById = async (id: string): Promise<IncidentResponse> => {
  try {
    const response = await axios.get<IncidentResponse>(
      `${INCIDENTS_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching incident with ID ${id}:`, error);
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        error.message ||
        `Failed to fetch incident with ID ${id}`
      : `Failed to fetch incident with ID ${id}`;
    throw new Error(message);
  }
};

// Helper function to normalize incident data
const normalizeIncident = (incident: any): Incident => {
  // Ensure both id and _id are set
  const normalized: Incident = {
    ...incident,
    id: incident.id || incident._id,
    _id: incident._id || incident.id,
    // Ensure alertId is properly set (can be null)
    alertId: incident.alertId || null,
    // Ensure departmentOnDuty exists
    departmentOnDuty: incident.departmentOnDuty || {
      _id: '',
      id: '',
      name: 'Unknown Department',
    },
    // Ensure unitOnDuty exists
    unitOnDuty: incident.unitOnDuty || {
      _id: '',
      id: '',
      name: 'Unknown Unit',
      department: '',
      isActive: false,
    },
    // Ensure status exists
    status: incident.status || 'active',
    // Ensure timestamps exist
    createdAt: incident.createdAt || new Date().toISOString(),
    updatedAt: incident.updatedAt || incident.createdAt || new Date().toISOString(),
    // Ensure time fields exist
    responseTimeMinutes: incident.responseTimeMinutes ?? null,
    resolutionTimeMinutes: incident.resolutionTimeMinutes ?? null,
    totalIncidentTimeMinutes: incident.totalIncidentTimeMinutes ?? null,
  };
  
  return normalized;
};

export const useIncidentsStore = create<IncidentsStore>()(
  persist(
    (set, get) => ({
      incidents: [],
      currentIncident: null,
      isLoading: false,
      error: null,
      count: 0,

      fetchIncidents: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchIncidents();
          const incidentsArray = Array.isArray(response.data)
            ? response.data
            : [response.data];
          const normalizedIncidents = incidentsArray.map(normalizeIncident);
          set({
            incidents: normalizedIncidents,
            count: response.count || normalizedIncidents.length,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error("Failed to fetch incidents:", error);
          set({
            isLoading: false,
            error: error.message || "Failed to fetch incidents",
          });
        }
      },

      fetchIncidentById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchIncidentById(id);
          const normalizedIncident = normalizeIncident(
            response.data as Incident
          );
          set({
            currentIncident: normalizedIncident,
            isLoading: false,
            error: null,
          });
          return normalizedIncident;
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error.message || `Failed to fetch incident with ID ${id}`,
          });
          return null;
        }
      },

      updateIncident: async (id: string, incidentData: Partial<Incident>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiUpdateIncident(id, incidentData);
          const updatedIncident = normalizeIncident(response.data);
          
          set((state) => ({
            incidents: state.incidents.map((incident) =>
              (incident.id === id || incident._id === id) ? updatedIncident : incident
            ),
            currentIncident: state.currentIncident?.id === id || state.currentIncident?._id === id
              ? updatedIncident
              : state.currentIncident,
            isLoading: false,
            error: null,
          }));
          
          return updatedIncident;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update incident";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      setCurrentIncident: (incident: Incident | null) => {
        set({ currentIncident: incident });
      },

      addIncidentFromSocket: (incidentData: WebSocketIncidentData) => {
        try {
          const normalizedIncident = normalizeIncident(incidentData);
          const incidentId = normalizedIncident._id || normalizedIncident.id;
          
          // Check if incident already exists (avoid duplicates)
          const { incidents } = get();
          const exists = incidents.some(i => {
            const iId = i._id || i.id;
            return iId === incidentId;
          });
          
          if (!exists) {
            set((state) => ({
              incidents: [normalizedIncident, ...state.incidents],
              count: state.count + 1,
            }));
            
            // Trigger a custom event that components can listen to
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('newIncident', { detail: normalizedIncident }));
            }
          }
        } catch (error) {
          console.error('❌ Error processing WebSocket incident:', error);
        }
      },

      updateIncidentFromSocket: (incidentData: WebSocketIncidentData) => {
        try {
          const normalizedIncident = normalizeIncident(incidentData);
          const incidentId = normalizedIncident._id || normalizedIncident.id;
          
          set((state) => ({
            incidents: state.incidents.map((incident) => {
              const iId = incident._id || incident.id;
              return iId === incidentId ? { ...incident, ...normalizedIncident } : incident;
            }),
            currentIncident: state.currentIncident && 
              ((state.currentIncident._id === incidentId) || (state.currentIncident.id === incidentId))
                ? { ...state.currentIncident, ...normalizedIncident }
                : state.currentIncident,
          }));
          
          // Trigger update event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('incidentUpdated', { detail: normalizedIncident }));
          }
        } catch (error) {
          console.error('❌ Error updating incident from WebSocket:', error);
        }
      },

      removeIncidentFromSocket: (incidentData: WebSocketIncidentData) => {
        try {
          const incidentId = incidentData._id || incidentData.id;
          
          set((state) => ({
            incidents: state.incidents.filter((incident) => {
              const iId = incident._id || incident.id;
              return iId !== incidentId;
            }),
            count: Math.max(0, state.count - 1),
            currentIncident: state.currentIncident && 
              ((state.currentIncident._id === incidentId) || (state.currentIncident.id === incidentId))
                ? null
                : state.currentIncident,
          }));
          
          // Trigger delete event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('incidentDeleted', { detail: incidentData }));
          }
        } catch (error) {
          console.error('❌ Error removing incident from WebSocket:', error);
        }
      },
    }),
    {
      name: "gnfs-incidents-storage",
      partialize: (state) => ({}), // Don't persist incidents - always fetch fresh data
    }
  )
);

// Selectors
export const selectIncidents = (state: IncidentsStore) => state.incidents;
export const selectIncidentsIsLoading = (state: IncidentsStore) =>
  state.isLoading;
export const selectIncidentsError = (state: IncidentsStore) => state.error;
export const selectIncidentsCount = (state: IncidentsStore) => state.count;

