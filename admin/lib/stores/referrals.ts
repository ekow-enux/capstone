"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const REFERRALS_ENDPOINT = `${API_BASE_URL}/referrals`;

export type ReferralDataType = 'EmergencyAlert' | 'Incident';

export interface Referral {
  _id: string;
  id: string;
  data_id: string; // ObjectId reference to EmergencyAlert or Incident
  data_type: ReferralDataType; // 'EmergencyAlert' or 'Incident'
  from_station_id: string; // ObjectId reference to Station (required)
  to_station_id: string; // ObjectId reference to Station (required)
  reason?: string; // Optional reason for referral
  status?: 'pending' | 'accepted' | 'rejected' | 'completed';
  response_notes?: string; // Response notes when accepting/rejecting
  referred_at?: string; // When referral was created
  responded_at?: string; // When referral was responded to
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ReferralResponse {
  success: boolean;
  data: Referral;
}

export interface ReferralsResponse {
  success: boolean;
  count: number;
  data: Referral[];
}

export interface ReferredAlertNotification {
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
    lat?: number;
    lng?: number;
    phone_number?: string;
    placeId?: string;
  };
  priority: string;
  status: string;
  timestamps: {
    createdAt: string;
    updatedAt: string;
    reportedAt: string;
  };
  referral: {
    referralId: string;
    fromStation: {
      _id: string;
      name: string;
      location?: string;
    };
    reason?: string;
    referredAt: string;
  };
  isReferred: boolean;
  message: string;
  requiresAction: boolean;
}

export interface ReferredIncidentNotification {
  _id: string;
  alertId: string | any;
  station?: {
    _id: string;
    name: string;
    location?: string;
  };
  departmentOnDuty?: string | any;
  unitOnDuty?: string | any;
  status: string;
  dispatchedAt?: string | null;
  arrivedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  referral: {
    referralId: string;
    fromStation: {
      _id: string;
      name: string;
      location?: string;
    };
    reason?: string;
    referredAt: string;
  };
  isReferred: boolean;
  message: string;
  requiresAction: boolean;
}

interface ReferralsStore {
  referrals: Referral[];
  currentReferral: Referral | null;
  isLoading: boolean;
  error: string | null;
  count: number;
  
  // Referral notifications
  referredAlertNotification: ReferredAlertNotification | null;
  referredIncidentNotification: ReferredIncidentNotification | null;

  createReferral: (referralData: {
    data_id: string;
    data_type: ReferralDataType;
    from_station_id: string;
    to_station_id: string;
    reason?: string;
  }) => Promise<Referral>;
  fetchReferrals: () => Promise<void>;
  fetchReferralById: (id: string) => Promise<Referral | null>;
  updateReferral: (id: string, referralData: Partial<Referral>) => Promise<Referral>;
  acceptReferral: (id: string, responseNotes?: string) => Promise<Referral>;
  rejectReferral: (id: string, responseNotes?: string) => Promise<Referral>;
  deleteReferral: (id: string) => Promise<void>;
  clearError: () => void;
  setCurrentReferral: (referral: Referral | null) => void;
  setReferredAlertNotification: (notification: ReferredAlertNotification | null) => void;
  setReferredIncidentNotification: (notification: ReferredIncidentNotification | null) => void;
}

// API function to create a referral
const apiCreateReferral = async (referralData: {
  data_id: string;
  data_type: ReferralDataType;
  from_station_id: string;
  to_station_id: string;
  reason?: string;
}): Promise<ReferralResponse> => {
  try {
    const { data } = await axios.post<ReferralResponse>(
      REFERRALS_ENDPOINT,
      referralData,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to create referral"
      : "Failed to create referral";
    throw new Error(message);
  }
};

// API function to fetch all referrals
const apiFetchReferrals = async (): Promise<ReferralsResponse> => {
  try {
    const { data } = await axios.get<ReferralsResponse>(
      REFERRALS_ENDPOINT,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch referrals"
      : "Failed to fetch referrals";
    throw new Error(message);
  }
};

// API function to fetch a single referral by ID
const apiFetchReferralById = async (id: string): Promise<ReferralResponse> => {
  try {
    const { data } = await axios.get<ReferralResponse>(
      `${REFERRALS_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch referral"
      : "Failed to fetch referral";
    throw new Error(message);
  }
};

// API function to update a referral
const apiUpdateReferral = async (id: string, referralData: Partial<Referral>): Promise<ReferralResponse> => {
  try {
    const { data } = await axios.patch<ReferralResponse>(
      `${REFERRALS_ENDPOINT}/${id}`,
      referralData,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to update referral"
      : "Failed to update referral";
    throw new Error(message);
  }
};

// API function to delete a referral
const apiDeleteReferral = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${REFERRALS_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to delete referral"
      : "Failed to delete referral";
    throw new Error(message);
  }
};

export const useReferralsStore = create<ReferralsStore>()(
  persist(
    (set, get) => ({
      referrals: [],
      currentReferral: null,
      isLoading: false,
      error: null,
      count: 0,
      referredAlertNotification: null,
      referredIncidentNotification: null,

      createReferral: async (referralData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCreateReferral(referralData);
          const newReferral = {
            ...response.data,
            id: response.data.id || response.data._id,
            _id: response.data._id || response.data.id,
          };
          
          set((state) => ({
            referrals: [newReferral, ...state.referrals],
            count: state.count + 1,
            isLoading: false,
            error: null,
          }));
          
          return newReferral;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create referral";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      fetchReferrals: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchReferrals();
          const normalizedReferrals = (response.data || []).map(referral => ({
            ...referral,
            id: referral.id || referral._id,
            _id: referral._id || referral.id,
          }));
          set({
            referrals: normalizedReferrals,
            count: response.count || 0,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch referrals";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      fetchReferralById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchReferralById(id);
          const referral = {
            ...response.data,
            id: response.data.id || response.data._id,
            _id: response.data._id || response.data.id,
          };
          
          set((state) => ({
            referrals: state.referrals.map(r => 
              (r.id === id || r._id === id) ? referral : r
            ),
            currentReferral: referral,
            isLoading: false,
            error: null,
          }));
          
          return referral;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch referral";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      updateReferral: async (id: string, referralData: Partial<Referral>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiUpdateReferral(id, referralData);
          const updatedReferral = {
            ...response.data,
            id: response.data.id || response.data._id,
            _id: response.data._id || response.data.id,
          };
          
          set((state) => ({
            referrals: state.referrals.map((referral) =>
              (referral.id === id || referral._id === id) ? updatedReferral : referral
            ),
            currentReferral: state.currentReferral?.id === id || state.currentReferral?._id === id
              ? updatedReferral
              : state.currentReferral,
            isLoading: false,
            error: null,
          }));
          
          return updatedReferral;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update referral";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      acceptReferral: async (id: string, responseNotes?: string) => {
        return get().updateReferral(id, {
          status: 'accepted',
          response_notes: responseNotes,
        } as any);
      },

      rejectReferral: async (id: string, responseNotes?: string) => {
        return get().updateReferral(id, {
          status: 'rejected',
          response_notes: responseNotes,
        } as any);
      },

      deleteReferral: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiDeleteReferral(id);
          
          set((state) => ({
            referrals: state.referrals.filter(
              (referral) => referral.id !== id && referral._id !== id
            ),
            count: state.count - 1,
            currentReferral: state.currentReferral?.id === id || state.currentReferral?._id === id
              ? null
              : state.currentReferral,
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete referral";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setCurrentReferral: (referral: Referral | null) => {
        set({ currentReferral: referral });
      },

      setReferredAlertNotification: (notification: ReferredAlertNotification | null) => {
        set({ referredAlertNotification: notification });
      },

      setReferredIncidentNotification: (notification: ReferredIncidentNotification | null) => {
        set({ referredIncidentNotification: notification });
      },
    }),
    {
      name: 'gnfs-referrals-storage',
      partialize: (state) => ({
        referrals: state.referrals,
        count: state.count,
      }),
    }
  )
);

// Selectors
export const selectReferrals = (state: ReferralsStore) => state.referrals;
export const selectReferralsIsLoading = (state: ReferralsStore) => state.isLoading;
export const selectReferralsError = (state: ReferralsStore) => state.error;
export const selectReferralsCount = (state: ReferralsStore) => state.count;

