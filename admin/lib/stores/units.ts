"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./auth";
import { useStationAdminAuthStore } from "./stationAdminAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const UNITS_ENDPOINT = `${API_BASE_URL}/fire/units`;

export interface Unit {
  _id: string;
  id: string;
  name?: string;
  color?: string;
  department?: string | {
    _id?: string;
    id?: string;
    name?: string;
  };
  departmentId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface UnitsResponse {
  success: boolean;
  count?: number;
  data: Unit[];
}

export interface CreateUnitData {
  name: string;
  color?: string;
  department: string; // departmentId
}

interface CreateUnitAPIData {
  name: string;
  color?: string;
  department: string; // departmentId
}

interface UnitsStore {
  units: Unit[];
  isLoading: boolean;
  error: string | null;
  count: number;
  fetchUnits: (departmentId?: string, stationId?: string) => Promise<void>;
  createUnit: (data: CreateUnitData) => Promise<Unit>;
  updateUnit: (id: string, data: Partial<CreateUnitData>) => Promise<Unit>;
  deleteUnit: (id: string) => Promise<void>;
  clearError: () => void;
}

// API function to fetch units
const apiFetchUnits = async (departmentId?: string, stationId?: string): Promise<UnitsResponse> => {
  try {
    const params = new URLSearchParams();
    if (departmentId) params.append('departmentId', departmentId);
    if (stationId) params.append('stationId', stationId);
    
    const url = params.toString() 
      ? `${UNITS_ENDPOINT}?${params.toString()}`
      : UNITS_ENDPOINT;
    
    const { data } = await axios.get<UnitsResponse | Unit[]>(
      url,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct array
    if (Array.isArray(data)) {
      return {
        success: true,
        count: data.length,
        data: data.map(unit => ({
          ...unit,
          id: unit.id || unit._id,
          _id: unit._id || unit.id,
          departmentId: typeof unit.department === 'string' 
            ? unit.department 
            : unit.department?._id || unit.department?.id || unit.departmentId,
        })),
      };
    }
    
    return {
      success: data.success ?? true,
      count: data.count ?? data.data?.length ?? 0,
      data: (data.data || []).map(unit => ({
        ...unit,
        id: unit.id || unit._id,
        _id: unit._id || unit.id,
        departmentId: typeof unit.department === 'string' 
          ? unit.department 
          : unit.department?._id || unit.department?.id || unit.departmentId,
      })),
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch units"
      : "Failed to fetch units";
    throw new Error(message);
  }
};

// API function to create unit
const apiCreateUnit = async (formData: CreateUnitData): Promise<Unit> => {
  try {
    const apiData = {
      name: formData.name.trim(),
      color: formData.color || '#000000',
      department: formData.department, // departmentId
    };

    const { data } = await axios.post<{ success: boolean; data: Unit } | Unit>(
      UNITS_ENDPOINT,
      apiData,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct Unit
    const unit = 'data' in data ? data.data : data;
    return {
      ...unit,
      id: unit.id || unit._id,
      _id: unit._id || unit.id,
      departmentId: typeof unit.department === 'string' 
        ? unit.department 
        : unit.department?._id || unit.department?.id || unit.departmentId,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to create unit"
      : "Failed to create unit";
    throw new Error(message);
  }
};

// API function to update unit
const apiUpdateUnit = async (id: string, formData: Partial<CreateUnitData>): Promise<Unit> => {
  try {
    const apiData: Partial<CreateUnitAPIData> = {};
    if (formData.name) apiData.name = formData.name.trim();
    if (formData.color !== undefined) apiData.color = formData.color || '#000000';
    if (formData.department) apiData.department = formData.department;

    const { data } = await axios.put<{ success: boolean; data: Unit } | Unit>(
      `${UNITS_ENDPOINT}/${id}`,
      apiData,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct Unit
    const unit = 'data' in data ? data.data : data;
    return {
      ...unit,
      id: unit.id || unit._id,
      _id: unit._id || unit.id,
      departmentId: typeof unit.department === 'string' 
        ? unit.department 
        : unit.department?._id || unit.department?.id || unit.departmentId,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to update unit"
      : "Failed to update unit";
    throw new Error(message);
  }
};

// API function to delete unit
const apiDeleteUnit = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${UNITS_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to delete unit"
      : "Failed to delete unit";
    throw new Error(message);
  }
};

export const useUnitsStore = create<UnitsStore>()(
  persist(
    (set, get) => ({
      units: [],
      isLoading: false,
      error: null,
      count: 0,

      fetchUnits: async (departmentId?: string, stationId?: string) => {
        set({ isLoading: true, error: null });
        try {
          // If stationId is not provided, try to get it from the admin's assigned station
          let adminStationId = stationId;
          if (!adminStationId) {
            // Try to get stationId from station admin auth store first (for station admins)
            const stationAdminUser = useStationAdminAuthStore.getState().user;
            if (stationAdminUser?.stationId) {
              adminStationId = stationAdminUser.stationId;
            } else {
              // Fallback to regular auth store (for regular admins)
              const regularUser = useAuthStore.getState().user;
              if (regularUser?.stationId) {
                adminStationId = regularUser.stationId;
              }
            }
          }
          
          const response = await apiFetchUnits(departmentId, adminStationId);
          set({
            units: response.data,
            count: response.count || 0,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch units";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      createUnit: async (data: CreateUnitData) => {
        set({ isLoading: true, error: null });
        try {
          const newUnit = await apiCreateUnit(data);
          set((state) => ({
            units: [...state.units, newUnit],
            count: state.count + 1,
            isLoading: false,
            error: null,
          }));
          return newUnit;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create unit";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      updateUnit: async (id: string, data: Partial<CreateUnitData>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUnit = await apiUpdateUnit(id, data);
          set((state) => ({
            units: state.units.map((unit) =>
              (unit.id === id || unit._id === id) ? updatedUnit : unit
            ),
            isLoading: false,
            error: null,
          }));
          return updatedUnit;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update unit";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      deleteUnit: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiDeleteUnit(id);
          set((state) => ({
            units: state.units.filter((unit) => unit.id !== id && unit._id !== id),
            count: Math.max(0, state.count - 1),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete unit";
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
      name: 'gnfs-units-storage',
      partialize: (state) => ({
        units: state.units,
        count: state.count,
      }),
    }
  )
);

// Selectors
export const selectUnits = (state: UnitsStore) => state.units;
export const selectUnitsIsLoading = (state: UnitsStore) => state.isLoading;
export const selectUnitsError = (state: UnitsStore) => state.error;
export const selectUnitsCount = (state: UnitsStore) => state.count;



