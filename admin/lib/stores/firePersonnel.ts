"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const FIRE_PERSONNEL_ENDPOINT = `${API_BASE_URL}/fire/personnel`;

export interface FirePersonnel {
  _id: string;
  id: string;
  serviceNumber?: string;
  name?: string;
  email?: string;
  phone?: string;
  rank?: string | {
    _id?: string;
    id?: string;
    name?: string;
    initials?: string;
  };
  rankId?: string;
  department?: string | {
    _id?: string;
    id?: string;
    name?: string;
  };
  departmentId?: string;
  unit?: string | {
    _id?: string;
    id?: string;
    name?: string;
  };
  unitId?: string;
  role?: string | {
    _id?: string;
    id?: string;
    name?: string;
  };
  roleId?: string;
  station_id?: string | {
    _id?: string;
    id?: string;
    name?: string;
  };
  stationId?: string;
  tempPassword?: string;
  password?: string;
  tempPasswordExpiry?: string;
  passwordResetRequired?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface FirePersonnelResponse {
  success: boolean;
  count?: number;
  data: FirePersonnel[];
}

export interface CreateFirePersonnelData {
  serviceNumber: string;
  name: string;
  rank: string; // rankId
  department: string; // departmentId (required)
  unit?: string; // unitId (required if department has units, optional otherwise)
  role?: string; // roleId (optional, only for Admin)
  station_id: string; // stationId (required)
  tempPassword: string;
}

interface CreateFirePersonnelAPIData {
  serviceNumber: string;
  name: string;
  rank: string; // rankId
  department: string; // departmentId
  unit?: string; // unitId
  role?: string; // roleId
  station_id: string; // stationId
  tempPassword: string;
}

interface FirePersonnelStore {
  firePersonnel: FirePersonnel[];
  isLoading: boolean;
  error: string | null;
  count: number;
  fetchFirePersonnel: (stationId?: string) => Promise<void>;
  createFirePersonnel: (data: CreateFirePersonnelData) => Promise<FirePersonnel>;
  updateFirePersonnel: (id: string, data: Partial<CreateFirePersonnelData>) => Promise<FirePersonnel>;
  deleteFirePersonnel: (id: string) => Promise<void>;
  clearError: () => void;
}

// API function to fetch fire personnel
const apiFetchFirePersonnel = async (stationId?: string): Promise<FirePersonnelResponse> => {
  try {
    const url = stationId 
      ? `${FIRE_PERSONNEL_ENDPOINT}?stationId=${stationId}`
      : FIRE_PERSONNEL_ENDPOINT;
    
    const { data } = await axios.get<FirePersonnelResponse | FirePersonnel[]>(
      url,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct array
    if (Array.isArray(data)) {
      return {
        success: true,
        count: data.length,
        data: data.map(personnel => ({
          ...personnel,
          id: personnel.id || personnel._id,
          _id: personnel._id || personnel.id,
          rankId: typeof personnel.rank === 'string' 
            ? personnel.rank 
            : personnel.rank?._id || personnel.rank?.id || personnel.rankId,
          departmentId: typeof personnel.department === 'string' 
            ? personnel.department 
            : personnel.department?._id || personnel.department?.id || personnel.departmentId,
          unitId: typeof personnel.unit === 'string' 
            ? personnel.unit 
            : personnel.unit?._id || personnel.unit?.id || personnel.unitId,
          roleId: typeof personnel.role === 'string' 
            ? personnel.role 
            : personnel.role?._id || personnel.role?.id || personnel.roleId,
          stationId: typeof personnel.station_id === 'string' 
            ? personnel.station_id 
            : personnel.station_id?._id || personnel.station_id?.id || personnel.stationId,
        })),
      };
    }
    
    return {
      success: data.success ?? true,
      count: data.count ?? data.data?.length ?? 0,
      data: (data.data || []).map(personnel => ({
        ...personnel,
        id: personnel.id || personnel._id,
        _id: personnel._id || personnel.id,
        rankId: typeof personnel.rank === 'string' 
          ? personnel.rank 
          : personnel.rank?._id || personnel.rank?.id || personnel.rankId,
        unitId: typeof personnel.unit === 'string' 
          ? personnel.unit 
          : personnel.unit?._id || personnel.unit?.id || personnel.unitId,
        roleId: typeof personnel.role === 'string' 
          ? personnel.role 
          : personnel.role?._id || personnel.role?.id || personnel.roleId,
        stationId: typeof personnel.station_id === 'string' 
          ? personnel.station_id 
          : personnel.station_id?._id || personnel.station_id?.id || personnel.stationId,
      })),
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch fire personnel"
      : "Failed to fetch fire personnel";
    throw new Error(message);
  }
};

// API function to create fire personnel
const apiCreateFirePersonnel = async (formData: CreateFirePersonnelData): Promise<FirePersonnel> => {
  try {
    const apiData: CreateFirePersonnelAPIData = {
      serviceNumber: formData.serviceNumber.trim(),
      name: formData.name.trim(),
      rank: formData.rank, // rankId
      department: formData.department, // departmentId (required)
      station_id: formData.station_id, // stationId
      tempPassword: formData.tempPassword,
      ...(formData.unit && { unit: formData.unit }), // unitId
      ...(formData.role && { role: formData.role }), // roleId
    };

    const { data } = await axios.post<{ success: boolean; data: FirePersonnel } | FirePersonnel>(
      FIRE_PERSONNEL_ENDPOINT,
      apiData,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct FirePersonnel
    const personnel = 'data' in data ? data.data : data;
    return {
      ...personnel,
      id: personnel.id || personnel._id,
      _id: personnel._id || personnel.id,
      rankId: typeof personnel.rank === 'string' 
        ? personnel.rank 
        : personnel.rank?._id || personnel.rank?.id || personnel.rankId,
      departmentId: typeof personnel.department === 'string' 
        ? personnel.department 
        : personnel.department?._id || personnel.department?.id || personnel.departmentId,
      unitId: typeof personnel.unit === 'string' 
        ? personnel.unit 
        : personnel.unit?._id || personnel.unit?.id || personnel.unitId,
      roleId: typeof personnel.role === 'string' 
        ? personnel.role 
        : personnel.role?._id || personnel.role?.id || personnel.roleId,
      stationId: typeof personnel.station_id === 'string' 
        ? personnel.station_id 
        : personnel.station_id?._id || personnel.station_id?.id || personnel.stationId,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to create fire personnel"
      : "Failed to create fire personnel";
    throw new Error(message);
  }
};

// API function to update fire personnel
const apiUpdateFirePersonnel = async (id: string, formData: Partial<CreateFirePersonnelData>): Promise<FirePersonnel> => {
  try {
    const apiData: Partial<CreateFirePersonnelAPIData> = {};
    if (formData.serviceNumber) apiData.serviceNumber = formData.serviceNumber.trim();
    if (formData.name) apiData.name = formData.name.trim();
    if (formData.rank) apiData.rank = formData.rank;
    if (formData.department) apiData.department = formData.department;
    if (formData.unit !== undefined) apiData.unit = formData.unit || undefined;
    if (formData.role !== undefined) apiData.role = formData.role || undefined;
    if (formData.station_id) apiData.station_id = formData.station_id;
    if (formData.tempPassword) apiData.tempPassword = formData.tempPassword;

    const { data } = await axios.put<{ success: boolean; data: FirePersonnel } | FirePersonnel>(
      `${FIRE_PERSONNEL_ENDPOINT}/${id}`,
      apiData,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct FirePersonnel
    const personnel = 'data' in data ? data.data : data;
    return {
      ...personnel,
      id: personnel.id || personnel._id,
      _id: personnel._id || personnel.id,
      rankId: typeof personnel.rank === 'string' 
        ? personnel.rank 
        : personnel.rank?._id || personnel.rank?.id || personnel.rankId,
      departmentId: typeof personnel.department === 'string' 
        ? personnel.department 
        : personnel.department?._id || personnel.department?.id || personnel.departmentId,
      unitId: typeof personnel.unit === 'string' 
        ? personnel.unit 
        : personnel.unit?._id || personnel.unit?.id || personnel.unitId,
      roleId: typeof personnel.role === 'string' 
        ? personnel.role 
        : personnel.role?._id || personnel.role?.id || personnel.roleId,
      stationId: typeof personnel.station_id === 'string' 
        ? personnel.station_id 
        : personnel.station_id?._id || personnel.station_id?.id || personnel.stationId,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to update fire personnel"
      : "Failed to update fire personnel";
    throw new Error(message);
  }
};

// API function to delete fire personnel
const apiDeleteFirePersonnel = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${FIRE_PERSONNEL_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to delete fire personnel"
      : "Failed to delete fire personnel";
    throw new Error(message);
  }
};

export const useFirePersonnelStore = create<FirePersonnelStore>()(
  persist(
    (set, get) => ({
      firePersonnel: [],
      isLoading: false,
      error: null,
      count: 0,

      fetchFirePersonnel: async (stationId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchFirePersonnel(stationId);
          set({
            firePersonnel: response.data,
            count: response.count || 0,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch fire personnel";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      createFirePersonnel: async (data: CreateFirePersonnelData) => {
        set({ isLoading: true, error: null });
        try {
          const newPersonnel = await apiCreateFirePersonnel(data);
          set((state) => ({
            firePersonnel: [...state.firePersonnel, newPersonnel],
            count: state.count + 1,
            isLoading: false,
            error: null,
          }));
          return newPersonnel;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create fire personnel";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      updateFirePersonnel: async (id: string, data: Partial<CreateFirePersonnelData>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedPersonnel = await apiUpdateFirePersonnel(id, data);
          set((state) => ({
            firePersonnel: state.firePersonnel.map((personnel) =>
              (personnel.id === id || personnel._id === id) ? updatedPersonnel : personnel
            ),
            isLoading: false,
            error: null,
          }));
          return updatedPersonnel;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update fire personnel";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      deleteFirePersonnel: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiDeleteFirePersonnel(id);
          set((state) => ({
            firePersonnel: state.firePersonnel.filter((personnel) => personnel.id !== id && personnel._id !== id),
            count: Math.max(0, state.count - 1),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete fire personnel";
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
      name: 'gnfs-fire-personnel-storage',
      partialize: (state) => ({
        firePersonnel: state.firePersonnel,
        count: state.count,
      }),
    }
  )
);

// Selectors
export const selectFirePersonnel = (state: FirePersonnelStore) => state.firePersonnel;
export const selectFirePersonnelIsLoading = (state: FirePersonnelStore) => state.isLoading;
export const selectFirePersonnelError = (state: FirePersonnelStore) => state.error;
export const selectFirePersonnelCount = (state: FirePersonnelStore) => state.count;

