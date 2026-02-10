"use client";

import axios, { AxiosResponse } from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StationAdmin, StationAdminFormData } from "@/lib/types/stationAdmin";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const STATION_ADMINS_ENDPOINT = `${API_BASE_URL}/station-admin`;
const REGISTER_ENDPOINT = `${API_BASE_URL}/station-admin/register`;

export interface StationAdminsResponse {
  success: boolean;
  count?: number;
  data: StationAdmin[];
}

interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  tempPassword?: string;
}

interface StationAdminsStore {
  stationAdmins: StationAdmin[];
  isLoading: boolean;
  error: string | null;
  count: number;
  fetchStationAdmins: () => Promise<void>;
  createStationAdmin: (data: StationAdminFormData) => Promise<StationAdmin>;
  updateStationAdmin: (id: string, data: StationAdminFormData) => Promise<StationAdmin>;
  deleteStationAdmin: (id: string) => Promise<void>;
  changePassword: (id: string) => Promise<string>;
  clearError: () => void;
}

// API function to fetch station admins
const apiFetchStationAdmins = async (): Promise<StationAdminsResponse> => {
  try {
    const { data } = await axios.get<StationAdminsResponse | StationAdmin[]>(
      STATION_ADMINS_ENDPOINT,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, count, data } or direct array
    if (Array.isArray(data)) {
      return {
        success: true,
        count: data.length,
        data: data.map(admin => ({
          ...admin,
          id: admin.id || admin._id,
        })),
      };
    }
    
    return {
      success: data.success ?? true,
      count: data.count ?? data.data?.length ?? 0,
      data: (data.data || []).map(admin => ({
        ...admin,
        id: admin.id || admin._id,
      })),
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch station admins"
      : "Failed to fetch station admins";
    throw new Error(message);
  }
};

// API function to create station admin
const apiCreateStationAdmin = async (formData: StationAdminFormData): Promise<StationAdmin> => {
  try {
    // Prepare data for API - ensure station is sent as stationId
    // Use tempPassword instead of password for creation
    const apiData = {
      username: formData.username,
      tempPassword: formData.password, // Backend expects tempPassword, not password
      email: formData.email,
      name: formData.name || undefined,
      station_id: formData.station, // API expects stationId
      isActive: formData.isActive ?? true,
    };

    const { data } = await axios.post<{ success: boolean; data: StationAdmin } | StationAdmin>(
      REGISTER_ENDPOINT,
      apiData,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct StationAdmin
    const admin = 'data' in data ? data.data : data;
    return {
      ...admin,
      id: admin.id || admin._id,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to create station admin"
      : "Failed to create station admin";
    throw new Error(message);
  }
};

// API function to update station admin
const apiUpdateStationAdmin = async (id: string, formData: StationAdminFormData): Promise<StationAdmin> => {
  try {
    // Prepare data for API - only include password if provided, ensure station is sent as stationId
    interface UpdateStationAdminAPIData {
      username: string;
      email: string;
      name?: string;
      stationId: string;
      isActive: boolean;
      password?: string;
    }
    const apiData: UpdateStationAdminAPIData = {
      username: formData.username,
      email: formData.email,
      name: formData.name || undefined,
      stationId: formData.station, // API expects stationId
      isActive: formData.isActive ?? true,
    };

    // Only include password if provided (for updates)
    if (formData.password && formData.password.trim()) {
      apiData.password = formData.password;
    }

    const { data } = await axios.put<{ success: boolean; data: StationAdmin } | StationAdmin>(
      `${STATION_ADMINS_ENDPOINT}/${id}`,
      apiData,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct StationAdmin
    const admin = 'data' in data ? data.data : data;
    return {
      ...admin,
      id: admin.id || admin._id,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to update station admin"
      : "Failed to update station admin";
    throw new Error(message);
  }
};

// API function to delete station admin
const apiDeleteStationAdmin = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${STATION_ADMINS_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to delete station admin"
      : "Failed to delete station admin";
    throw new Error(message);
  }
};

// API function to change password (generate temporary password)
const apiChangePassword = async (id: string): Promise<string> => {
  try {
    const { data } = await axios.post<ChangePasswordResponse>(
      `${STATION_ADMINS_ENDPOINT}/${id}/change-password`,
      {},
      { withCredentials: true }
    );
    
    // Return the temporary password from the response
    if (data.tempPassword) {
      return data.tempPassword;
    }
    
    // If response doesn't include password, check message or throw error
    throw new Error(data.message || "Temporary password not returned from server");
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to change password"
      : "Failed to change password";
    throw new Error(message);
  }
};

export const useStationAdminsStore = create<StationAdminsStore>()(
  persist(
    (set, get) => ({
      stationAdmins: [],
      isLoading: false,
      error: null,
      count: 0,

      fetchStationAdmins: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchStationAdmins();
          set({
            stationAdmins: response.data || [],
            count: response.count || response.data?.length || 0,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch station admins";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      createStationAdmin: async (formData: StationAdminFormData) => {
        set({ isLoading: true, error: null });
        try {
          const newAdmin = await apiCreateStationAdmin(formData);
          set((state) => ({
            stationAdmins: [...state.stationAdmins, newAdmin],
            count: state.count + 1,
            isLoading: false,
            error: null,
          }));
          return newAdmin;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create station admin";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      updateStationAdmin: async (id: string, formData: StationAdminFormData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedAdmin = await apiUpdateStationAdmin(id, formData);
          set((state) => ({
            stationAdmins: state.stationAdmins.map((admin) =>
              (admin.id === id || admin._id === id) ? updatedAdmin : admin
            ),
            isLoading: false,
            error: null,
          }));
          return updatedAdmin;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update station admin";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      deleteStationAdmin: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiDeleteStationAdmin(id);
          set((state) => ({
            stationAdmins: state.stationAdmins.filter(
              (admin) => admin.id !== id && admin._id !== id
            ),
            count: state.count - 1,
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete station admin";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      changePassword: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const tempPassword = await apiChangePassword(id);
          set({
            isLoading: false,
            error: null,
          });
          return tempPassword;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to change password";
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
    }),
    {
      name: 'gnfs-station-admins-storage',
      partialize: (state) => ({
        stationAdmins: state.stationAdmins,
        count: state.count,
      }),
    }
  )
);

// Selectors
export const selectStationAdmins = (state: StationAdminsStore) => state.stationAdmins;
export const selectStationAdminsIsLoading = (state: StationAdminsStore) => state.isLoading;
export const selectStationAdminsError = (state: StationAdminsStore) => state.error;
export const selectStationAdminsCount = (state: StationAdminsStore) => state.count;

