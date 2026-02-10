"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthStore, UserRoleData, AuthFormData, UserRole } from "@/lib/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const LOGIN_ENDPOINT = `${API_BASE_URL}/fire/personnel/login`;

// Backend login response interface (matches backend structure)
interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  requiresPasswordReset?: boolean;
  data?: {
    _id?: string;
    id?: string;
    serviceNumber?: string;
    name?: string;
    station_id?: string | {
      _id?: string;
      id?: string;
      name?: string;
    };
    department?: string | {
      _id?: string;
      id?: string;
      name?: string;
    };
    unit?: string | {
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

// API function for fire personnel login (matches backend structure)
const apiLogin = async (credentials: AuthFormData): Promise<{ userData?: UserRoleData; requiresPasswordReset: boolean; serviceNumber: string; personnelId?: string }> => {
  try {
    const { data } = await axios.post<LoginResponse>(
      LOGIN_ENDPOINT,
      { serviceNumber: credentials.username, password: credentials.password },
      { withCredentials: true }
    );

    // Check if request was successful
    if (!data.success) {
      throw new Error(data.message || "Login failed");
    }

    // Extract personnel data from response
    const personnelData = data.data;
    if (!personnelData) {
      throw new Error("No personnel data received");
    }

    // Check if password reset is required
    const requiresPasswordReset = data.requiresPasswordReset || false;
    const serviceNumber = personnelData.serviceNumber || credentials.username;

    // If password reset is required, return early without full user data
    // But include personnelId so we can use it for password change
    if (requiresPasswordReset) {
      return {
        requiresPasswordReset: true,
        serviceNumber,
        personnelId: personnelData._id || personnelData.id || "", // Include personnelId for password change
      };
    }

    // Extract station ID (handle both string and populated object)
    let stationId = "";
    if (personnelData.station_id) {
      if (typeof personnelData.station_id === "string") {
        stationId = personnelData.station_id;
      } else {
        stationId = personnelData.station_id._id || personnelData.station_id.id || "";
      }
    }

    // Extract department ID
    let departmentId = "";
    if (personnelData.department) {
      if (typeof personnelData.department === "string") {
        departmentId = personnelData.department;
      } else {
        departmentId = personnelData.department._id || personnelData.department.id || "";
      }
    }

    // Extract unit ID
    let unitId = "";
    if (personnelData.unit) {
      if (typeof personnelData.unit === "string") {
        unitId = personnelData.unit;
      } else {
        unitId = personnelData.unit._id || personnelData.unit.id || "";
      }
    }

    // Transform API response to UserRoleData format
    const userData: UserRoleData = {
      userId: personnelData._id || personnelData.id || "",
      role: (personnelData.role || "Operations") as UserRole,
      stationId: stationId,
      departmentId: departmentId,
      unitId: unitId || undefined,
      permissions: ["read", "update_reports", "assign_personnel"],
      dashboardAccess: ["operations_dashboard", "incident_management"],
    };

    return { userData, requiresPasswordReset: false, serviceNumber };
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

// API function to change password (for fire personnel to change their own password)
// Backend endpoint: POST /fire/personnel/{id}/change-password
// Body: { oldPassword?: string, newPassword: string }
const apiChangePassword = async (personnelId: string, oldPassword: string | null, newPassword: string): Promise<UserRoleData> => {
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
      `${API_BASE_URL}/fire/personnel/${personnelId}/change-password`,
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
    // Fetch personnel data to get serviceNumber
    const personnelResponse = await fetch(
      `${API_BASE_URL}/fire/personnel/${personnelId}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!personnelResponse.ok) {
      throw new Error("Failed to fetch personnel data after password change");
    }

    const personnelDataResponse = await personnelResponse.json();
    const personnelData = personnelDataResponse.data || personnelDataResponse;
    const serviceNumber = personnelData.serviceNumber;

    if (!serviceNumber) {
      throw new Error("Service number not found. Please log in again.");
    }

    // Login again with new password
    const loginResponse = await axios.post<LoginResponse>(
      LOGIN_ENDPOINT,
      { serviceNumber, password: newPassword },
      { withCredentials: true }
    );

    const loginData = loginResponse.data;
    
    if (!loginData.success || !loginData.data) {
      throw new Error("Failed to login after password change");
    }

    const personnelDataFromLogin = loginData.data;
    let stationId = "";
    if (personnelDataFromLogin.station_id) {
      if (typeof personnelDataFromLogin.station_id === "string") {
        stationId = personnelDataFromLogin.station_id;
      } else {
        stationId = personnelDataFromLogin.station_id._id || personnelDataFromLogin.station_id.id || "";
      }
    }

    let departmentId = "";
    if (personnelDataFromLogin.department) {
      if (typeof personnelDataFromLogin.department === "string") {
        departmentId = personnelDataFromLogin.department;
      } else {
        departmentId = personnelDataFromLogin.department._id || personnelDataFromLogin.department.id || "";
      }
    }

    let unitId = "";
    if (personnelDataFromLogin.unit) {
      if (typeof personnelDataFromLogin.unit === "string") {
        unitId = personnelDataFromLogin.unit;
      } else {
        unitId = personnelDataFromLogin.unit._id || personnelDataFromLogin.unit.id || "";
      }
    }

    const userData: UserRoleData = {
      userId: personnelDataFromLogin._id || personnelDataFromLogin.id || "",
      role: (personnelDataFromLogin.role || "Operations") as UserRole,
      stationId: stationId,
      departmentId: departmentId,
      unitId: unitId || undefined,
      permissions: ["read", "update_reports", "assign_personnel"],
      dashboardAccess: ["operations_dashboard", "incident_management"],
    };

    return userData;
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : "Failed to change password";
    throw new Error(message);
  }
};

const apiCheckAuth = async (): Promise<UserRoleData | null> => {
  // Don't use localStorage - rely on cookies set by backend
  // The backend sets cookies via withCredentials: true
  // Return null to force re-authentication via cookies
  return null;
};

interface FirePersonnelAuthStore extends Omit<AuthStore, 'login'> {
  login: (credentials: AuthFormData) => Promise<{ requiresPasswordReset: boolean; serviceNumber: string; personnelId?: string } | void>;
  changePassword: (personnelId: string, oldPassword: string | null, newPassword: string) => Promise<void>;
}

export const useFirePersonnelAuthStore = create<FirePersonnelAuthStore>()(
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
            return { requiresPasswordReset: true, serviceNumber: result.serviceNumber, personnelId: result.personnelId || "" };
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

      changePassword: async (personnelId: string, oldPassword: string | null, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiChangePassword(personnelId, oldPassword, newPassword);
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

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Fire personnel registration might not be available
          throw new Error("Registration not available for fire personnel");
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
          const LOGOUT_ENDPOINT = `${API_BASE_URL}/fire/personnel/logout`;
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
          // Don't store in localStorage - rely on cookies set by backend
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "gnfs-fire-personnel-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors - using Pick to ensure type compatibility
export const selectFirePersonnelUser = (state: Pick<FirePersonnelAuthStore, 'user'>) => state.user;
export const selectFirePersonnelIsLoading = (state: Pick<FirePersonnelAuthStore, 'isLoading'>) => state.isLoading;
export const selectFirePersonnelError = (state: Pick<FirePersonnelAuthStore, 'error'>) => state.error;

