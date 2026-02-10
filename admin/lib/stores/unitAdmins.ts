"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const UNIT_ADMINS_ENDPOINT = `${API_BASE_URL}/unit-admin`;
const REGISTER_ENDPOINT = `${API_BASE_URL}/unit-admin/register`;

export interface UnitAdmin {
  _id: string;
  id: string;
  username: string;
  email: string;
  name?: string;
  unit_id: string | { _id?: string; id?: string };
  unitId?: string;
  isActive: boolean;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface UnitAdminsResponse {
  success: boolean;
  count?: number;
  data: UnitAdmin[];
}

export interface CreateUnitAdminData {
  username: string;
  email: string;
  tempPassword: string;
  name?: string;
  unit_id: string;
}

interface CreateUnitAdminAPIData {
  username: string;
  email: string;
  tempPassword: string;
  name?: string;
  unit_id: string;
}

interface UnitAdminsStore {
  unitAdmins: UnitAdmin[];
  isLoading: boolean;
  error: string | null;
  count: number;
  fetchUnitAdmins: (unitId?: string) => Promise<void>;
  createUnitAdmin: (data: CreateUnitAdminData) => Promise<UnitAdmin>;
  updateUnitAdmin: (id: string, data: Partial<CreateUnitAdminData>) => Promise<UnitAdmin>;
  deleteUnitAdmin: (id: string) => Promise<void>;
  clearError: () => void;
}

// API function to fetch unit admins
const apiFetchUnitAdmins = async (unitId?: string): Promise<UnitAdminsResponse> => {
  try {
    const params = new URLSearchParams();
    if (unitId) params.append('unit_id', unitId);

    const url = params.toString()
      ? `${UNIT_ADMINS_ENDPOINT}?${params.toString()}`
      : UNIT_ADMINS_ENDPOINT;

    const { data } = await axios.get<UnitAdminsResponse | UnitAdmin[]>(
      url,
      { withCredentials: true }
    );

    // Handle both response formats: { success, data } or direct array
    if (Array.isArray(data)) {
      return {
        success: true,
        count: data.length,
        data: data.map(admin => ({
          ...admin,
          id: admin.id || admin._id,
          unitId: typeof admin.unit_id === 'string'
            ? admin.unit_id
            : admin.unit_id?._id || admin.unit_id?.id || admin.unitId,
        })),
      };
    }

    return {
      success: data.success ?? true,
      count: data.count ?? data.data?.length ?? 0,
      data: (data.data || []).map(admin => ({
        ...admin,
        id: admin.id || admin._id,
        unitId: typeof admin.unit_id === 'string'
          ? admin.unit_id
          : admin.unit_id?._id || admin.unit_id?.id || admin.unitId,
      })),
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch unit admins"
      : "Failed to fetch unit admins";
    throw new Error(message);
  }
};

// API function to create unit admin
const apiCreateUnitAdmin = async (formData: CreateUnitAdminData): Promise<UnitAdmin> => {
  try {
    const apiData: CreateUnitAdminAPIData = {
      username: formData.username,
      email: formData.email,
      tempPassword: formData.tempPassword,
      name: formData.name,
      unit_id: formData.unit_id,
    };

    const { data } = await axios.post<{ success: boolean; data: UnitAdmin } | UnitAdmin>(
      REGISTER_ENDPOINT,
      apiData,
      { withCredentials: true }
    );

    // Handle both response formats: { success, data } or direct UnitAdmin
    const admin = 'data' in data ? data.data : data;
    return {
      ...admin,
      id: admin.id || admin._id,
      unitId: typeof admin.unit_id === 'string'
        ? admin.unit_id
        : admin.unit_id?._id || admin.unit_id?.id || admin.unitId,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to create unit admin"
      : "Failed to create unit admin";
    throw new Error(message);
  }
};

// API function to update unit admin
const apiUpdateUnitAdmin = async (id: string, formData: Partial<CreateUnitAdminData>): Promise<UnitAdmin> => {
  try {
    const apiData: Partial<CreateUnitAdminAPIData> = {};
    if (formData.username) apiData.username = formData.username;
    if (formData.email) apiData.email = formData.email;
    if (formData.tempPassword) apiData.tempPassword = formData.tempPassword;
    if (formData.name !== undefined) apiData.name = formData.name;
    if (formData.unit_id) apiData.unit_id = formData.unit_id;

    const { data } = await axios.put<{ success: boolean; data: UnitAdmin } | UnitAdmin>(
      `${UNIT_ADMINS_ENDPOINT}/${id}`,
      apiData,
      { withCredentials: true }
    );

    // Handle both response formats: { success, data } or direct UnitAdmin
    const admin = 'data' in data ? data.data : data;
    return {
      ...admin,
      id: admin.id || admin._id,
      unitId: typeof admin.unit_id === 'string'
        ? admin.unit_id
        : admin.unit_id?._id || admin.unit_id?.id || admin.unitId,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to update unit admin"
      : "Failed to update unit admin";
    throw new Error(message);
  }
};

// API function to delete unit admin
const apiDeleteUnitAdmin = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${UNIT_ADMINS_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to delete unit admin"
      : "Failed to delete unit admin";
    throw new Error(message);
  }
};

export const useUnitAdminsStore = create<UnitAdminsStore>()(
  persist(
    (set, get) => ({
      unitAdmins: [],
      isLoading: false,
      error: null,
      count: 0,

      fetchUnitAdmins: async (unitId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchUnitAdmins(unitId);
          set({
            unitAdmins: response.data,
            count: response.count || 0,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch unit admins";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      createUnitAdmin: async (data: CreateUnitAdminData) => {
        set({ isLoading: true, error: null });
        try {
          const newAdmin = await apiCreateUnitAdmin(data);
          set((state) => ({
            unitAdmins: [...state.unitAdmins, newAdmin],
            count: state.count + 1,
            isLoading: false,
            error: null,
          }));
          return newAdmin;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create unit admin";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      updateUnitAdmin: async (id: string, data: Partial<CreateUnitAdminData>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedAdmin = await apiUpdateUnitAdmin(id, data);
          set((state) => ({
            unitAdmins: state.unitAdmins.map((admin) =>
              (admin.id === id || admin._id === id) ? updatedAdmin : admin
            ),
            isLoading: false,
            error: null,
          }));
          return updatedAdmin;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update unit admin";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      deleteUnitAdmin: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiDeleteUnitAdmin(id);
          set((state) => ({
            unitAdmins: state.unitAdmins.filter((admin) => admin.id !== id && admin._id !== id),
            count: Math.max(0, state.count - 1),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete unit admin";
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
      name: 'gnfs-unit-admins-storage',
      partialize: (state) => ({
        unitAdmins: state.unitAdmins,
        count: state.count,
      }),
    }
  )
);

// Selectors
export const selectUnitAdmins = (state: UnitAdminsStore) => state.unitAdmins;
export const selectUnitAdminsIsLoading = (state: UnitAdminsStore) => state.isLoading;
export const selectUnitAdminsError = (state: UnitAdminsStore) => state.error;
export const selectUnitAdminsCount = (state: UnitAdminsStore) => state.count;