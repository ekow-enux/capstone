"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthStore, UserRoleData, AuthFormData } from "@/lib/types/auth";
import { StationAdmin } from "@/lib/types/stationAdmin";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const LOGIN_ENDPOINT = `${API_BASE_URL}/station-admin/login`;

// Backend login response interface (matches backend structure)
interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  requiresPasswordReset?: boolean;
  data?: {
    _id?: string;
    id?: string;
    username?: string;
    email?: string;
    name?: string;
    station_id?: string | {
      _id?: string;
      id?: string;
      name?: string;
    };
    isActive?: boolean;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

// API function for station admin login (matches backend structure)
const apiLogin = async (credentials: AuthFormData): Promise<{ userData?: UserRoleData; requiresPasswordReset: boolean; username: string; adminId?: string }> => {
  try {
    const { data } = await axios.post<LoginResponse>(
      LOGIN_ENDPOINT,
      { username: credentials.username, password: credentials.password },
      { withCredentials: true }
    );

    // Check if request was successful
    if (!data.success) {
      throw new Error(data.message || "Login failed");
    }

    // Extract admin data from response
    const adminData = data.data;
    if (!adminData) {
      throw new Error("No admin data received");
    }

    // Check if password reset is required
    const requiresPasswordReset = data.requiresPasswordReset || false;
    const username = adminData.username || credentials.username;

    // If password reset is required, return early without full user data
    // But include adminId so we can use it for password change
    if (requiresPasswordReset) {
      return {
        requiresPasswordReset: true,
        username,
        adminId: adminData._id || adminData.id || "", // Include adminId for password change
      };
    }

    // Extract station ID (handle both string and populated object)
    let stationId = "";
    if (adminData.station_id) {
      if (typeof adminData.station_id === "string") {
        stationId = adminData.station_id;
      } else {
        stationId = adminData.station_id._id || adminData.station_id.id || "";
      }
    }

    // Transform API response to UserRoleData format
    // Station admin will have role 'Admin' and stationId from response
    const userData: UserRoleData = {
      userId: adminData._id || adminData.id || "",
      role: "Admin", // Station admin uses Admin role but with station context
      stationId: stationId,
      permissions: ["read", "update", "manage_personnel", "manage_reports"],
      dashboardAccess: ["station_admin", "personnel_management", "reports_management"],
      // Store additional station admin data
      stationAdminData: {
        username: adminData.username || credentials.username,
        email: adminData.email,
        name: adminData.name,
        station: adminData.station_id,
        isActive: adminData.isActive ?? true,
      },
    };

    return { userData, requiresPasswordReset: false, username };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Login failed"
      : "Login failed";
    throw new Error(message);
  }
};

// Change password response interface
interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

// API function to change password (for station admin to change their own password)
// Backend endpoint: POST /station-admin/{id}/change-password
// Body: { oldPassword?: string, newPassword: string }
const apiChangePassword = async (adminId: string, oldPassword: string | null, newPassword: string): Promise<UserRoleData> => {
  try {
    // Prepare request body - oldPassword is optional (can be null for temp password reset)
    const requestBody: { oldPassword?: string; newPassword: string } = {
      newPassword,
    };
    
    // Only include oldPassword if provided (for regular password change)
    if (oldPassword) {
      requestBody.oldPassword = oldPassword;
    }

    // Call password change endpoint
    const response = await fetch(
      `${API_BASE_URL}/station-admin/${adminId}/change-password`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const changePasswordData: ChangePasswordResponse = await response.json();
    
    if (!changePasswordData.success) {
      throw new Error(changePasswordData.message || "Password change failed");
    }

    // After password change, login again with new password to get user data
    // We need to get the username from the API response or make a call to get current user
    // For now, we'll need to get username from somewhere - let's fetch admin data
    // Fetch admin data to get username
    const adminResponse = await fetch(
      `${API_BASE_URL}/station-admin/${adminId}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!adminResponse.ok) {
      throw new Error("Failed to fetch admin data after password change");
    }

    const adminDataResponse = await adminResponse.json();
    const adminData = adminDataResponse.data || adminDataResponse;
    const username = adminData.username;

    if (!username) {
      throw new Error("Username not found. Please log in again.");
    }

    // Login again with new password
    const loginResponse = await axios.post<LoginResponse>(
      LOGIN_ENDPOINT,
      { username, password: newPassword },
      { withCredentials: true }
    );

    const loginData = loginResponse.data;
    
    if (!loginData.success || !loginData.data) {
      throw new Error("Failed to login after password change");
    }

    const adminDataFromLogin = loginData.data;
    let stationId = "";
    if (adminDataFromLogin.station_id) {
      if (typeof adminDataFromLogin.station_id === "string") {
        stationId = adminDataFromLogin.station_id;
      } else {
        stationId = adminDataFromLogin.station_id._id || adminDataFromLogin.station_id.id || "";
      }
    }

    const userData: UserRoleData = {
      userId: adminDataFromLogin._id || adminDataFromLogin.id || "",
      role: "Admin",
      stationId: stationId,
      permissions: ["read", "update", "manage_personnel", "manage_reports"],
      dashboardAccess: ["station_admin", "personnel_management", "reports_management"],
      stationAdminData: {
        username: adminDataFromLogin.username || username,
        email: adminDataFromLogin.email,
        name: adminDataFromLogin.name,
        station: adminDataFromLogin.station_id,
        isActive: adminDataFromLogin.isActive ?? true,
      },
    };

    return userData;
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : "Failed to change password";
    throw new Error(message);
  }
};

// Station Admin data response interface
interface StationAdminDataResponse {
  success: boolean;
  message?: string;
  data?: {
    _id?: string;
    id?: string;
    username?: string;
    email?: string;
    name?: string;
    station_id?: string | {
      _id?: string;
      id?: string;
      name?: string;
    };
    isActive?: boolean;
    role?: string;
    tempPassword?: string;
    passwordResetRequired?: boolean;
    tempPasswordExpiry?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

// API function to fetch station admin data by station ID
const apiFetchStationAdminData = async (stationId: string): Promise<StationAdminDataResponse> => {
  try {
    // Use fetch API to avoid TypeScript issues with axios.get
    const response = await fetch(
      `${API_BASE_URL}/station-admin/station/${stationId}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: StationAdminDataResponse = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : "Failed to fetch station admin data";
    throw new Error(message);
  }
};

const apiCheckAuth = async (): Promise<UserRoleData | null> => {
  // Don't use localStorage - rely on cookies set by backend
  // The backend sets cookies via withCredentials: true
  // Return null to force re-authentication via cookies
  return null;
};

interface StationAdminAuthStore extends Omit<AuthStore, 'login'> {
  login: (credentials: AuthFormData) => Promise<{ requiresPasswordReset: boolean; username: string; adminId?: string } | void>;
  changePassword: (adminId: string, oldPassword: string | null, newPassword: string) => Promise<void>;
  fetchStationAdminData: (stationId: string) => Promise<{ hasTempPassword: boolean; adminData: StationAdmin }>;
}

export const useStationAdminAuthStore = create<StationAdminAuthStore>()(
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
          const result = await apiLogin(credentials);
          
          // If password reset is required, return early
          if (result.requiresPasswordReset) {
            set({ isLoading: false, error: null });
            return { requiresPasswordReset: true, username: result.username, adminId: result.adminId || "" };
          }

          // Normal login flow
          if (result.userData) {
            set({ 
              user: result.userData, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
            // Don't store in localStorage - rely on cookies set by backend
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      changePassword: async (adminId: string, oldPassword: string | null, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiChangePassword(adminId, oldPassword, newPassword);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          // Don't store in localStorage - rely on cookies set by backend
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to change password",
            isLoading: false,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call logout API endpoint
          const LOGOUT_ENDPOINT = `${API_BASE_URL}/station-admin/logout`;
          if (API_BASE_URL) {
            await axios.post(
              LOGOUT_ENDPOINT,
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
          error: null 
        });
        // Cookies are cleared by backend on logout
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
              error: null 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null 
            });
          }
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: error instanceof Error ? error.message : "Auth check failed"
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      fetchStationAdminData: async (stationId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchStationAdminData(stationId);
          
          if (!response.success || !response.data) {
            throw new Error(response.message || "Failed to fetch station admin data");
          }

          const responseData = response.data;
          const hasTempPassword = !!(responseData.tempPassword || responseData.passwordResetRequired);

          // Transform API response to StationAdmin format
          const adminData: StationAdmin = {
            _id: responseData._id,
            id: responseData.id || responseData._id,
            username: responseData.username || '',
            email: responseData.email || '',
            name: responseData.name,
            station: typeof responseData.station_id === 'string' 
              ? responseData.station_id 
              : responseData.station_id?._id || responseData.station_id?.id || '',
            stationId: typeof responseData.station_id === 'string' 
              ? responseData.station_id 
              : responseData.station_id?._id || responseData.station_id?.id,
            isActive: responseData.isActive ?? true,
            createdAt: responseData.createdAt,
            updatedAt: responseData.updatedAt,
          };

          set({ isLoading: false, error: null });
          return { hasTempPassword, adminData };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch station admin data";
          set({ 
            isLoading: false,
            error: errorMessage 
          });
          throw error;
        }
      },

      // Additional methods from AuthStore (not used but required by interface)
      register: async () => {
        throw new Error("Registration not available for station admin");
      },
      updateUser: () => {
        // Not implemented for station admin
      },
    }),
    {
      name: "gnfs-station-admin-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const selectStationAdminUser = (state: AuthStore) => state.user;
export const selectStationAdminIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectStationAdminIsLoading = (state: AuthStore) => state.isLoading;
export const selectStationAdminError = (state: AuthStore) => state.error;

