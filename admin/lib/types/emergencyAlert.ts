// Emergency Alert Types matching API response structure

export type EmergencyAlertType = 'fire' | 'medical' | 'rescue' | 'flood' | 'hazardous' | 'other';
export type EmergencyAlertStatus = 'active' | 'pending' | 'accepted' | 'rejected' | 'referred';
export type EmergencyAlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface EmergencyAlertLocation {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  locationUrl?: string;
  locationName: string;
}

export interface EmergencyAlertStation {
  _id: string;
  id: string;
  name: string;
  location?: string;
  phone_number?: string;
}

export interface EmergencyAlertUser {
  _id: string;
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface EmergencyAlert {
  _id: string;
  id: string;
  alertType: EmergencyAlertType;
  title: string;
  message: string;
  location: EmergencyAlertLocation;
  stationId?: string;
  station?: EmergencyAlertStation | null;
  userId?: string;
  user?: EmergencyAlertUser | null;
  status: EmergencyAlertStatus;
  priority: EmergencyAlertPriority;
  description?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  __v?: number;
}

export interface EmergencyAlertResponse {
  success: boolean;
  data: EmergencyAlert | EmergencyAlert[];
  count?: number;
  message?: string;
}

export interface CreateEmergencyAlertData {
  alertType: EmergencyAlertType;
  title: string;
  message: string;
  location: EmergencyAlertLocation;
  stationId?: string;
  userId?: string;
  priority: EmergencyAlertPriority;
  description?: string;
  expiresAt?: string;
}

export interface UpdateEmergencyAlertData {
  status?: EmergencyAlertStatus;
  priority?: EmergencyAlertPriority;
  title?: string;
  message?: string;
  description?: string;
  stationId?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  expiresAt?: string;
}

