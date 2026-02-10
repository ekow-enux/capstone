import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthStore, UserRoleData, AuthFormData, RegisterFormData } from '@/lib/types/auth';
import { STATION_IDS } from '@/lib/types/station';

// Mock API functions - replace with actual API calls
const mockLogin = async (credentials: AuthFormData): Promise<UserRoleData> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock user data based on username - using real station IDs
  const mockUsers: Record<string, UserRoleData> = {
    superadmin: {
      userId: '1',
      role: 'SuperAdmin',
      permissions: ['create', 'read', 'update', 'delete', 'manage_users', 'system_config'],
      dashboardAccess: ['system_admin', 'analytics', 'user_management'],
    },
    admin: {
      userId: '2',
      role: 'Admin',
      stationId: STATION_IDS.ACCRA_CENTRAL, // Accra Central Fire Station
      permissions: ['read', 'update', 'manage_personnel', 'manage_reports'],
      dashboardAccess: ['station_admin', 'personnel_management', 'reports_management'],
    },
    operations: {
      userId: '3',
      role: 'Operations',
      subRole: 'main',
      stationId: STATION_IDS.ACCRA_CENTRAL, // Accra Central Fire Station
      departmentId: 'dept-1',
      permissions: ['read', 'update_reports', 'assign_personnel'],
      dashboardAccess: ['operations_dashboard', 'incident_management'],
    },
    watchroom: {
      userId: '4',
      role: 'Operations',
      subRole: 'watchroom',
      stationId: STATION_IDS.ACCRA_CENTRAL, // Accra Central Fire Station
      departmentId: 'dept-2',
      permissions: ['read', 'create_reports', 'dispatch_personnel'],
      dashboardAccess: ['watchroom_dashboard', 'dispatch_management'],
    },
    crew: {
      userId: '5',
      role: 'Operations',
      subRole: 'crew',
      stationId: STATION_IDS.ACCRA_CENTRAL, // Accra Central Fire Station
      departmentId: 'dept-3',
      permissions: ['read', 'update_status', 'report_progress'],
      dashboardAccess: ['crew_dashboard', 'field_operations'],
    },
    safety: {
      userId: '6',
      role: 'Safety',
      permissions: ['read', 'update_safety', 'compliance_reports'],
      dashboardAccess: ['safety_dashboard', 'compliance_monitoring'],
    },
    pr: {
      userId: '7',
      role: 'PR',
      permissions: ['read', 'create_announcements', 'media_reports'],
      dashboardAccess: ['pr_dashboard', 'media_management'],
    },
  };

  const username = credentials.username.toLowerCase();
  const user = mockUsers[username];
  if (!user) {
    throw new Error('Invalid credentials');
  }

  return user;
};

const mockRegister = async (userData: RegisterFormData): Promise<UserRoleData> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create new user based on registration data
  const newUser: UserRoleData = {
    userId: Math.random().toString(36).substr(2, 9),
    role: userData.role,
    subRole: userData.subRole,
    stationId: userData.stationId,
    departmentId: userData.departmentId,
    permissions: [], // Will be set based on role
    dashboardAccess: [], // Will be set based on role
  };

  // Set permissions and dashboard access based on role
  switch (userData.role) {
    case 'SuperAdmin':
      newUser.permissions = ['create', 'read', 'update', 'delete', 'manage_users', 'system_config'];
      newUser.dashboardAccess = ['system_admin', 'analytics', 'user_management'];
      break;
    case 'Admin':
      newUser.permissions = ['read', 'update', 'manage_personnel', 'manage_reports'];
      newUser.dashboardAccess = ['station_admin', 'personnel_management', 'reports_management'];
      break;
    case 'Operations':
      if (userData.subRole === 'main') {
        newUser.permissions = ['read', 'update_reports', 'assign_personnel'];
        newUser.dashboardAccess = ['operations_dashboard', 'incident_management'];
      } else if (userData.subRole === 'watchroom') {
        newUser.permissions = ['read', 'create_reports', 'dispatch_personnel'];
        newUser.dashboardAccess = ['watchroom_dashboard', 'dispatch_management'];
      } else if (userData.subRole === 'crew') {
        newUser.permissions = ['read', 'update_status', 'report_progress'];
        newUser.dashboardAccess = ['crew_dashboard', 'field_operations'];
      }
      break;
    case 'Safety':
      newUser.permissions = ['read', 'update_safety', 'compliance_reports'];
      newUser.dashboardAccess = ['safety_dashboard', 'compliance_monitoring'];
      break;
    case 'PR':
      newUser.permissions = ['read', 'create_announcements', 'media_reports'];
      newUser.dashboardAccess = ['pr_dashboard', 'media_management'];
      break;
  }

  return newUser;
};

const mockCheckAuth = async (): Promise<UserRoleData | null> => {
  // Simulate checking stored token
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if user is stored in localStorage
  const storedUser = localStorage.getItem('gnfs-user');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  
  return null;
};

export const useAuthStore = create<AuthStore>()(
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
          const user = await mockLogin(credentials);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          // Store user in localStorage for persistence
          localStorage.setItem('gnfs-user', JSON.stringify(user));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
            isAuthenticated: false 
          });
        }
      },

      register: async (userData: RegisterFormData) => {
        set({ isLoading: true, error: null });
        try {
          const user = await mockRegister(userData);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          // Store user in localStorage for persistence
          localStorage.setItem('gnfs-user', JSON.stringify(user));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
            isAuthenticated: false 
          });
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
        localStorage.removeItem('gnfs-user');
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const user = await mockCheckAuth();
          if (user) {
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Auth check failed',
            isLoading: false,
            isAuthenticated: false 
          });
        }
      },

      updateUser: (userData: Partial<UserRoleData>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'gnfs-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Selectors for easy access to specific parts of the auth state
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectError = (state: AuthStore) => state.error;
export const selectUserRole = (state: AuthStore) => state.user?.role;
export const selectUserPermissions = (state: AuthStore) => state.user?.permissions || [];
export const selectDashboardAccess = (state: AuthStore) => state.user?.dashboardAccess || [];

// Helper functions for role-based access control
export const hasPermission = (permission: string): boolean => {
  const user = useAuthStore.getState().user;
  return user?.permissions.includes(permission as any) || false;
};

export const hasDashboardAccess = (dashboard: string): boolean => {
  const user = useAuthStore.getState().user;
  return user?.dashboardAccess.includes(dashboard as any) || false;
};

export const isRole = (role: string): boolean => {
  const user = useAuthStore.getState().user;
  return user?.role === role;
};

export const isOperationsSubRole = (subRole: string): boolean => {
  const user = useAuthStore.getState().user;
  return user?.role === 'Operations' && user?.subRole === subRole;
};
