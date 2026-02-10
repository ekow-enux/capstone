import { z } from 'zod';

// Role Types
export type UserRole = 'SuperAdmin' | 'Admin' | 'Operations' | 'Safety' | 'PR';
export type OperationsSubRole = 'main' | 'watchroom' | 'crew';

// Permission Types
export type Permission = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'manage_users' 
  | 'system_config'
  | 'manage_personnel' 
  | 'manage_reports'
  | 'update_reports'
  | 'assign_personnel'
  | 'create_reports'
  | 'dispatch_personnel'
  | 'update_status'
  | 'report_progress'
  | 'update_safety'
  | 'compliance_reports'
  | 'create_announcements'
  | 'media_reports';

// Dashboard Access Types
export type DashboardAccess = 
  | 'system_admin'
  | 'analytics'
  | 'user_management'
  | 'station_admin'
  | 'personnel_management'
  | 'reports_management'
  | 'operations_dashboard'
  | 'incident_management'
  | 'watchroom_dashboard'
  | 'dispatch_management'
  | 'crew_dashboard'
  | 'field_operations'
  | 'safety_dashboard'
  | 'compliance_monitoring'
  | 'pr_dashboard'
  | 'media_management';

// Station Admin Data (optional additional data)
export interface StationAdminData {
  username?: string;
  email?: string;
  name?: string;
  station?: string | any;
  isActive?: boolean;
}

// User Role Interface
export interface UserRoleData {
  userId: string;
  role: UserRole;
  subRole?: OperationsSubRole; // For Operations role
  stationId?: string; // For Admin and Operations
  departmentId?: string; // For Operations sub-roles
  unitId?: string; // For Operations personnel assigned to a unit
  permissions: Permission[];
  dashboardAccess: DashboardAccess[];
  stationAdminData?: StationAdminData; // Optional: Additional station admin data
}

// Role-Based Access Control Configuration
export interface RoleBasedAccess {
  SuperAdmin: {
    access: 'full_system';
    dashboards: ['system_admin', 'analytics', 'user_management'];
    permissions: ['create', 'read', 'update', 'delete', 'manage_users', 'system_config'];
  };
  Admin: {
    access: 'station_level';
    dashboards: ['station_admin', 'personnel_management', 'reports_management'];
    permissions: ['read', 'update', 'manage_personnel', 'manage_reports'];
  };
  Operations: {
    main: {
      access: 'operations_main';
      dashboards: ['operations_dashboard', 'incident_management'];
      permissions: ['read', 'update_reports', 'assign_personnel'];
    };
    watchroom: {
      access: 'watchroom_operations';
      dashboards: ['watchroom_dashboard', 'dispatch_management'];
      permissions: ['read', 'create_reports', 'dispatch_personnel'];
    };
    crew: {
      access: 'crew_operations';
      dashboards: ['crew_dashboard', 'field_operations'];
      permissions: ['read', 'update_status', 'report_progress'];
    };
  };
  Safety: {
    access: 'safety_management';
    dashboards: ['safety_dashboard', 'compliance_monitoring'];
    permissions: ['read', 'update_safety', 'compliance_reports'];
  };
  PR: {
    access: 'public_relations';
    dashboards: ['pr_dashboard', 'media_management'];
    permissions: ['read', 'create_announcements', 'media_reports'];
  };
}

// Authentication Schema
export const authSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'), // No case requirements
  confirmPassword: z.string(),
  role: z.enum(['SuperAdmin', 'Admin', 'Operations', 'Safety', 'PR']),
  subRole: z.enum(['main', 'watchroom', 'crew']).optional(),
  stationId: z.string().optional(),
  departmentId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type AuthFormData = z.infer<typeof authSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Auth State Interface
export interface AuthState {
  user: UserRoleData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions Interface
export interface AuthActions {
  login: (credentials: AuthFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<UserRoleData>) => void;
  clearError: () => void;
}

// Complete Auth Store Type
export type AuthStore = AuthState & AuthActions;
