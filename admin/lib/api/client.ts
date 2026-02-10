// API service for role-based endpoints
import { UserRoleData } from '@/lib/types/auth';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// API client with role-based headers
class RoleBasedAPIClient {
  private baseURL: string;
  private user: UserRoleData | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setUser(user: UserRoleData | null) {
    this.user = user;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.user) {
      headers['x-user-role'] = this.user.role;
      if (this.user.subRole) {
        headers['x-user-sub-role'] = this.user.subRole;
      }
      if (this.user.stationId) {
        headers['x-user-station-id'] = this.user.stationId;
      }
      if (this.user.departmentId) {
        headers['x-user-department-id'] = this.user.departmentId;
      }
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const apiClient = new RoleBasedAPIClient(API_BASE_URL);

// Role-based API endpoints
export const roleBasedAPI = {
  // SuperAdmin endpoints
  superAdmin: {
    getDashboard: () => apiClient.get('/admin/superadmin/dashboard'),
    getAllStations: () => apiClient.get('/admin/superadmin/stations'),
    getAllPersonnel: () => apiClient.get('/admin/superadmin/personnel'),
    getSystemAnalytics: () => apiClient.get('/admin/superadmin/analytics'),
    getUserManagement: () => apiClient.get('/admin/superadmin/users'),
    getAuditLogs: () => apiClient.get('/admin/superadmin/audit-logs'),
    updateSystemConfig: (config: unknown) => apiClient.put('/admin/superadmin/config', config),
  },

  // Admin endpoints
  admin: {
    getDashboard: (stationId: string) => apiClient.get(`/admin/station/${stationId}/dashboard`),
    getStationPersonnel: (stationId: string) => apiClient.get(`/admin/station/${stationId}/personnel`),
    getStationReports: (stationId: string) => apiClient.get(`/admin/station/${stationId}/reports`),
    getStationAnalytics: (stationId: string) => apiClient.get(`/admin/station/${stationId}/analytics`),
    getDepartments: (stationId: string) => apiClient.get(`/admin/station/${stationId}/departments`),
    updatePersonnel: (stationId: string, personnelId: string, data: unknown) => 
      apiClient.put(`/admin/station/${stationId}/personnel/${personnelId}`, data),
    updateStationConfig: (stationId: string, config: unknown) => 
      apiClient.put(`/admin/station/${stationId}/config`, config),
  },

  // Operations endpoints
  operations: {
    getMainDashboard: (stationId: string) => 
      apiClient.get(`/operations/${stationId}/main/dashboard`),
    getWatchroomDashboard: (stationId: string) => 
      apiClient.get(`/operations/${stationId}/watchroom/dashboard`),
    getCrewDashboard: (stationId: string, departmentId: string) => 
      apiClient.get(`/operations/${stationId}/crew/${departmentId}/dashboard`),
    getActiveIncidents: (stationId: string) => 
      apiClient.get(`/operations/${stationId}/incidents`),
    getPersonnelStatus: (stationId: string) => 
      apiClient.get(`/operations/${stationId}/personnel/status`),
    getDispatchQueue: (stationId: string) => 
      apiClient.get(`/operations/${stationId}/dispatch/queue`),
    assignPersonnel: (stationId: string, incidentId: string, personnelIds: string[]) => 
      apiClient.post(`/operations/${stationId}/incidents/${incidentId}/assign`, { personnelIds }),
    updateIncidentStatus: (stationId: string, incidentId: string, status: string) => 
      apiClient.put(`/operations/${stationId}/incidents/${incidentId}/status`, { status }),
    dispatchUnit: (stationId: string, unitId: string, incidentId: string) => 
      apiClient.post(`/operations/${stationId}/dispatch/${unitId}`, { incidentId }),
  },

  // Safety endpoints
  safety: {
    getDashboard: () => apiClient.get('/safety/dashboard'),
    getSafetyIncidents: () => apiClient.get('/safety/incidents'),
    getComplianceReports: () => apiClient.get('/safety/compliance'),
    getSafetyPersonnel: () => apiClient.get('/safety/personnel'),
    getSafetyAnalytics: () => apiClient.get('/safety/analytics'),
    reportIncident: (incident: unknown) => apiClient.post('/safety/incidents', incident),
    updateCompliance: (complianceId: string, data: unknown) => 
      apiClient.put(`/safety/compliance/${complianceId}`, data),
    scheduleAudit: (audit: unknown) => apiClient.post('/safety/audits', audit),
  },

  // PR endpoints
  pr: {
    getDashboard: () => apiClient.get('/pr/dashboard'),
    getMediaReports: () => apiClient.get('/pr/media'),
    getPublicAnnouncements: () => apiClient.get('/pr/announcements'),
    getCampaigns: () => apiClient.get('/pr/campaigns'),
    getPRAnalytics: () => apiClient.get('/pr/analytics'),
    createPressRelease: (release: unknown) => apiClient.post('/pr/press-releases', release),
    createAnnouncement: (announcement: unknown) => apiClient.post('/pr/announcements', announcement),
    launchCampaign: (campaign: unknown) => apiClient.post('/pr/campaigns', campaign),
    updateMediaCoverage: (coverageId: string, data: unknown) => 
      apiClient.put(`/pr/media/${coverageId}`, data),
  },

  // Common endpoints
  common: {
    login: (credentials: { email: string; password: string }) => 
      apiClient.post('/auth/login', credentials),
    register: (userData: unknown) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    refreshToken: () => apiClient.post('/auth/refresh'),
    getProfile: () => apiClient.get('/auth/profile'),
    updateProfile: (data: unknown) => apiClient.put('/auth/profile', data),
  },
};

// Helper function to set user context for API calls
export const setAPIUser = (user: UserRoleData | null) => {
  apiClient.setUser(user);
};

// Export the API client for direct use if needed
export default apiClient;
