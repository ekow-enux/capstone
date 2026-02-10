"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const DEPARTMENT_ADMINS_ENDPOINT = `${API_BASE_URL}/department-admin`;
const REGISTER_ENDPOINT = `${API_BASE_URL}/department-admin/register`;

export interface DepartmentAdmin {
  _id: string;
  id: string;
  username: string;
  email: string;
  name?: string;
  department_id: string | { _id?: string; id?: string };
  departmentId?: string;
  isActive: boolean;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface DepartmentAdminsResponse {
  success: boolean;
  count?: number;
  data: DepartmentAdmin[];
}

export interface CreateDepartmentAdminData {
  username: string;
  email: string;
  tempPassword: string;
  name?: string;
  department_id: string;
}

interface CreateDepartmentAdminAPIData {
  username: string;
  email: string;
  tempPassword: string;
  name?: string;
  department_id: string;
}

interface DepartmentAdminsStore {
  departmentAdmins: DepartmentAdmin[];
  isLoading: boolean;
  error: string | null;
  count: number;
  fetchDepartmentAdmins: (departmentId?: string) => Promise<void>;
  createDepartmentAdmin: (data: CreateDepartmentAdminData) => Promise<DepartmentAdmin>;
  updateDepartmentAdmin: (id: string, data: Partial<CreateDepartmentAdminData>) => Promise<DepartmentAdmin>;
  deleteDepartmentAdmin: (id: string) => Promise<void>;
  clearError: () => void;
}

// API function to fetch department admins
const apiFetchDepartmentAdmins = async (departmentId?: string): Promise<DepartmentAdminsResponse> => {
  try {
    const params = new URLSearchParams();
    if (departmentId) params.append('department_id', departmentId);

    const url = params.toString()
      ? `${DEPARTMENT_ADMINS_ENDPOINT}?${params.toString()}`
      : DEPARTMENT_ADMINS_ENDPOINT;

    const { data } = await axios.get<DepartmentAdminsResponse | DepartmentAdmin[]>(
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
          departmentId: typeof admin.department_id === 'string'
            ? admin.department_id
            : admin.department_id?._id || admin.department_id?.id || admin.departmentId,
        })),
      };
    }

    return {
      success: data.success ?? true,
      count: data.count ?? data.data?.length ?? 0,
      data: (data.data || []).map(admin => ({
        ...admin,
        id: admin.id || admin._id,
        departmentId: typeof admin.department_id === 'string'
          ? admin.department_id
          : admin.department_id?._id || admin.department_id?.id || admin.departmentId,
      })),
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch department admins"
      : "Failed to fetch department admins";
    throw new Error(message);
  }
};

// API function to create department admin
const apiCreateDepartmentAdmin = async (formData: CreateDepartmentAdminData): Promise<DepartmentAdmin> => {
  try {
    const apiData: CreateDepartmentAdminAPIData = {
      username: formData.username,
      email: formData.email,
      tempPassword: formData.tempPassword,
      name: formData.name,
      department_id: formData.department_id,
    };

    const { data } = await axios.post<{ success: boolean; data: DepartmentAdmin } | DepartmentAdmin>(
      REGISTER_ENDPOINT,
      apiData,
      { withCredentials: true }
    );

    // Handle both response formats: { success, data } or direct DepartmentAdmin
    const admin = 'data' in data ? data.data : data;
    return {
      ...admin,
      id: admin.id || admin._id,
      departmentId: typeof admin.department_id === 'string'
        ? admin.department_id
        : admin.department_id?._id || admin.department_id?.id || admin.departmentId,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to create department admin"
      : "Failed to create department admin";
    throw new Error(message);
  }
};

// API function to update department admin
const apiUpdateDepartmentAdmin = async (id: string, formData: Partial<CreateDepartmentAdminData>): Promise<DepartmentAdmin> => {
  try {
    const apiData: Partial<CreateDepartmentAdminAPIData> = {};
    if (formData.username) apiData.username = formData.username;
    if (formData.email) apiData.email = formData.email;
    if (formData.tempPassword) apiData.tempPassword = formData.tempPassword;
    if (formData.name !== undefined) apiData.name = formData.name;
    if (formData.department_id) apiData.department_id = formData.department_id;

    const { data } = await axios.put<{ success: boolean; data: DepartmentAdmin } | DepartmentAdmin>(
      `${DEPARTMENT_ADMINS_ENDPOINT}/${id}`,
      apiData,
      { withCredentials: true }
    );

    // Handle both response formats: { success, data } or direct DepartmentAdmin
    const admin = 'data' in data ? data.data : data;
    return {
      ...admin,
      id: admin.id || admin._id,
      departmentId: typeof admin.department_id === 'string'
        ? admin.department_id
        : admin.department_id?._id || admin.department_id?.id || admin.departmentId,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to update department admin"
      : "Failed to update department admin";
    throw new Error(message);
  }
};

// API function to delete department admin
const apiDeleteDepartmentAdmin = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${DEPARTMENT_ADMINS_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to delete department admin"
      : "Failed to delete department admin";
    throw new Error(message);
  }
};

export const useDepartmentAdminsStore = create<DepartmentAdminsStore>()(
  persist(
    (set, get) => ({
      departmentAdmins: [],
      isLoading: false,
      error: null,
      count: 0,

      fetchDepartmentAdmins: async (departmentId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchDepartmentAdmins(departmentId);
          set({
            departmentAdmins: response.data,
            count: response.count || 0,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch department admins";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      createDepartmentAdmin: async (data: CreateDepartmentAdminData) => {
        set({ isLoading: true, error: null });
        try {
          const newAdmin = await apiCreateDepartmentAdmin(data);
          set((state) => ({
            departmentAdmins: [...state.departmentAdmins, newAdmin],
            count: state.count + 1,
            isLoading: false,
            error: null,
          }));
          return newAdmin;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create department admin";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      updateDepartmentAdmin: async (id: string, data: Partial<CreateDepartmentAdminData>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedAdmin = await apiUpdateDepartmentAdmin(id, data);
          set((state) => ({
            departmentAdmins: state.departmentAdmins.map((admin) =>
              (admin.id === id || admin._id === id) ? updatedAdmin : admin
            ),
            isLoading: false,
            error: null,
          }));
          return updatedAdmin;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update department admin";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      deleteDepartmentAdmin: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiDeleteDepartmentAdmin(id);
          set((state) => ({
            departmentAdmins: state.departmentAdmins.filter((admin) => admin.id !== id && admin._id !== id),
            count: Math.max(0, state.count - 1),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete department admin";
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
      name: 'gnfs-department-admins-storage',
      partialize: (state) => ({
        departmentAdmins: state.departmentAdmins,
        count: state.count,
      }),
    }
  )
);

// Selectors
export const selectDepartmentAdmins = (state: DepartmentAdminsStore) => state.departmentAdmins;
export const selectDepartmentAdminsIsLoading = (state: DepartmentAdminsStore) => state.isLoading;
export const selectDepartmentAdminsError = (state: DepartmentAdminsStore) => state.error;
export const selectDepartmentAdminsCount = (state: DepartmentAdminsStore) => state.count;