"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthStore, UserRoleData, AuthFormData } from "@/lib/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const LOGIN_ENDPOINT = `${API_BASE_URL}/super-admin/login`;

// API function - replace mock with actual API call
const apiLogin = async (credentials: AuthFormData): Promise<UserRoleData> => {
  try {
    const { data } = await axios.post(
      LOGIN_ENDPOINT,
      { username: credentials.username, password: credentials.password },
      { withCredentials: true }
    );

    // Transform API response to UserRoleData format
    // Adjust this mapping based on your actual API response structure
    const userData: UserRoleData = {
      userId: data.userId || data.id || data.user?.id || "",
      role: data.role || data.user?.role || "SuperAdmin",
      subRole: data.subRole || data.user?.subRole,
      stationId: data.stationId || data.user?.stationId,
      departmentId: data.departmentId || data.user?.departmentId,
      permissions: data.permissions || data.user?.permissions || [],
      dashboardAccess: data.dashboardAccess || data.user?.dashboardAccess || [],
    };

    return userData;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Login failed"
      : "Login failed";
    throw new Error(message);
  }
};

const apiCheckAuth = async (): Promise<UserRoleData | null> => {
  // Check if user is stored in localStorage
  const storedUser = localStorage.getItem("gnfs-user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }

  // Optionally, you could make an API call here to verify the token
  // For now, we'll just check localStorage
  return null;
};

export const useSuperAdminAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: AuthFormData) => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiLogin(credentials);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          // Store user in localStorage for persistence
          localStorage.setItem("gnfs-user", JSON.stringify(user));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Implement registration API call if needed
          // For now, throw an error as registration might not be available for super admin
          throw new Error("Registration not available for super admin");
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Registration failed",
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call logout API endpoint
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
          if (API_BASE_URL) {
            await axios.post(
              `${API_BASE_URL}/super-admin/logout`,
              {},
              { withCredentials: true }
            ).catch(() => {
              // Ignore errors, proceed with local logout
            });
          }
        } catch (error) {
          // Ignore errors, proceed with local logout
        }
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
        localStorage.removeItem("gnfs-super-admin-user");
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const user = await apiCheckAuth();
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Auth check failed",
            isLoading: false,
            isAuthenticated: false,
          });
        }
      },

      updateUser: (userData: Partial<UserRoleData>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
          // Update localStorage
          localStorage.setItem("gnfs-user", JSON.stringify(updatedUser));
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "gnfs-superadmin-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for easy access to specific parts of the auth state
export const selectSuperAdminUser = (state: AuthStore) => state.user;
export const selectSuperAdminIsAuthenticated = (state: AuthStore) =>
  state.isAuthenticated;
export const selectSuperAdminIsLoading = (state: AuthStore) => state.isLoading;
export const selectSuperAdminError = (state: AuthStore) => state.error;
export const selectSuperAdminUserRole = (state: AuthStore) => state.user?.role;
export const selectSuperAdminUserPermissions = (state: AuthStore) =>
  state.user?.permissions || [];
export const selectSuperAdminDashboardAccess = (state: AuthStore) =>
  state.user?.dashboardAccess || [];

// Helper functions for role-based access control
export const hasSuperAdminPermission = (permission: string): boolean => {
  const user = useSuperAdminAuthStore.getState().user;
  return user?.permissions.includes(permission as any) || false;
};

export const hasSuperAdminDashboardAccess = (dashboard: string): boolean => {
  const user = useSuperAdminAuthStore.getState().user;
  return user?.dashboardAccess.includes(dashboard as any) || false;
};

export const isSuperAdminRole = (role: string): boolean => {
  const user = useSuperAdminAuthStore.getState().user;
  return user?.role === role;
};

export const isSuperAdminOperationsSubRole = (subRole: string): boolean => {
  const user = useSuperAdminAuthStore.getState().user;
  return user?.role === "Operations" && user?.subRole === subRole;
};

export default useSuperAdminAuthStore;

