// Incident Types matching API response structure
import { Station } from './station';

export interface IncidentLocation {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  locationUrl: string;
  locationName: string;
}

export interface IncidentUser {
  _id: string;
  id: string;
  name: string;
  phone: string;
}

export interface IncidentStation {
  _id: string;
  id: string;
  name: string;
  location: string;
  lat?: number;
  lng?: number;
  phone_number?: string | null;
}

export type IncidentType = 'fire' | 'medical' | 'rescue' | 'flood' | 'hazardous' | 'other';
export type IncidentStatus = 'pending' | 'dispatched' | 'en_route' | 'on_scene' | 'completed' | 'cancelled' | 'active';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';
export type DamageLevel = 'none' | 'minimal' | 'moderate' | 'major' | 'severe';

// Alert ID structure (nested in incident)
export interface IncidentAlertId {
  _id: string;
  id: string;
  incidentType: IncidentType;
  incidentName: string;
  location: IncidentLocation;
  station: string; // Station ID
  status: 'active' | 'pending' | 'accepted' | 'rejected' | 'referred';
  priority: IncidentPriority;
  responseTimeMinutes: number | null;
}

// Department structure
export interface IncidentDepartment {
  _id: string;
  id: string;
  name: string;
  description?: string;
}

// Unit structure
export interface IncidentUnit {
  _id: string;
  id: string;
  name: string;
  department: string; // Department ID
  isActive: boolean;
}

// New Incident structure from /incidents endpoint
export interface Incident {
  _id: string;
  id: string;
  alertId: IncidentAlertId | null; // Can be null
  departmentOnDuty: IncidentDepartment;
  unitOnDuty: IncidentUnit;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  responseTimeMinutes: number | null;
  resolutionTimeMinutes: number | null;
  totalIncidentTimeMinutes: number | null;
}

export interface IncidentResponse {
  success: boolean;
  data: Incident | Incident[];
  total?: number;
  count?: number;
  message?: string;
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}
