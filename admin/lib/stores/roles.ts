"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const ROLES_ENDPOINT = `${API_BASE_URL}/fire/roles`;

export interface Role {
  _id: string;
  id: string;
  name?: string;
  description?: string;
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface RolesResponse {
  success: boolean;
  count?: number;
  data: Role[];
}

export interface CreateRoleData {
  name: string;
  description: string;
}

interface CreateRoleAPIData {
  name: string;
  description: string;
}

interface RolesStore {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  count: number;
  fetchRoles: () => Promise<void>;
  createRole: (data: CreateRoleData) => Promise<Role>;
  updateRole: (id: string, data: Partial<CreateRoleData>) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  clearError: () => void;
}

// API function to fetch roles
const apiFetchRoles = async (): Promise<RolesResponse> => {
  try {
    const { data } = await axios.get<RolesResponse | Role[]>(
      ROLES_ENDPOINT,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct array
    if (Array.isArray(data)) {
      return {
        success: true,
        count: data.length,
        data: data.map(role => ({
          ...role,
          id: role.id || role._id,
          _id: role._id || role.id,
        })),
      };
    }
    
    return {
      success: data.success ?? true,
      count: data.count ?? data.data?.length ?? 0,
      data: (data.data || []).map(role => ({
        ...role,
        id: role.id || role._id,
        _id: role._id || role.id,
      })),
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch roles"
      : "Failed to fetch roles";
    throw new Error(message);
  }
};

// API function to create role
const apiCreateRole = async (formData: CreateRoleData): Promise<Role> => {
  try {
    const apiData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    const { data } = await axios.post<{ success: boolean; data: Role } | Role>(
      ROLES_ENDPOINT,
      apiData,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct Role
    const role = 'data' in data ? data.data : data;
    return {
      ...role,
      id: role.id || role._id,
      _id: role._id || role.id,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to create role"
      : "Failed to create role";
    throw new Error(message);
  }
};

// API function to update role
const apiUpdateRole = async (id: string, formData: Partial<CreateRoleData>): Promise<Role> => {
  try {
    const apiData: Partial<CreateRoleAPIData> = {};
    if (formData.name) apiData.name = formData.name.trim();
    if (formData.description !== undefined) apiData.description = formData.description.trim();

    const { data } = await axios.put<{ success: boolean; data: Role } | Role>(
      `${ROLES_ENDPOINT}/${id}`,
      apiData,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct Role
    const role = 'data' in data ? data.data : data;
    return {
      ...role,
      id: role.id || role._id,
      _id: role._id || role.id,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to update role"
      : "Failed to update role";
    throw new Error(message);
  }
};

// API function to delete role
const apiDeleteRole = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${ROLES_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to delete role"
      : "Failed to delete role";
    throw new Error(message);
  }
};

export const useRolesStore = create<RolesStore>()(
  persist(
    (set, get) => ({
      roles: [],
      isLoading: false,
      error: null,
      count: 0,

      fetchRoles: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchRoles();
          set({
            roles: response.data,
            count: response.count || 0,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch roles";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      createRole: async (data: CreateRoleData) => {
        set({ isLoading: true, error: null });
        try {
          const newRole = await apiCreateRole(data);
          set((state) => ({
            roles: [...state.roles, newRole],
            count: state.count + 1,
            isLoading: false,
            error: null,
          }));
          return newRole;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create role";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      updateRole: async (id: string, data: Partial<CreateRoleData>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedRole = await apiUpdateRole(id, data);
          set((state) => ({
            roles: state.roles.map((role) =>
              (role.id === id || role._id === id) ? updatedRole : role
            ),
            isLoading: false,
            error: null,
          }));
          return updatedRole;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update role";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      deleteRole: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiDeleteRole(id);
          set((state) => ({
            roles: state.roles.filter((role) => role.id !== id && role._id !== id),
            count: Math.max(0, state.count - 1),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete role";
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
      name: 'gnfs-roles-storage',
      partialize: (state) => ({
        roles: state.roles,
        count: state.count,
      }),
    }
  )
);

// Selectors
export const selectRoles = (state: RolesStore) => state.roles;
export const selectRolesIsLoading = (state: RolesStore) => state.isLoading;
export const selectRolesError = (state: RolesStore) => state.error;
export const selectRolesCount = (state: RolesStore) => state.count;

