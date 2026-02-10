// Base Dashboard Types
export interface MetricCard {
  title: string;
  value: string | number;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

// Station Data Types
export interface StationData {
  id: string;
  name: string;
  location: string;
  region: string;
  personnelCount: number;
  departmentCount: number;
  activeReports: number;
  averageResponseTime: number;
  performance: StationPerformance;
}

export interface StationPerformance {
  responseTime: number;
  incidentResolution: number;
  personnelUtilization: number;
  equipmentMaintenance: number;
  safetyScore: number;
}

export interface RegionalCoverage {
  region: string;
  stations: number;
  coverage: number;
  population: number;
}

// Personnel Data Types
export interface PersonnelData {
  id: string;
  name: string;
  rank: string;
  department: string;
  stationId: string;
  status: 'on_duty' | 'off_duty' | 'on_leave' | 'training';
  location?: string;
  performance: PersonnelPerformance;
}

export interface PersonnelPerformance {
  responseTime: number;
  incidentHandling: number;
  teamwork: number;
  safetyCompliance: number;
  overallRating: number;
}

export interface PersonnelByRole {
  role: string;
  count: number;
  onDuty: number;
  offDuty: number;
}

export interface PersonnelByStation {
  stationId: string;
  stationName: string;
  count: number;
  onDuty: number;
}

export interface PersonnelByDepartment {
  department: string;
  count: number;
  onDuty: number;
}

export interface PersonnelByRank {
  rank: string;
  count: number;
  onDuty: number;
}

export interface PersonnelStatus {
  id: string;
  name: string;
  status: 'on_duty' | 'off_duty' | 'on_leave' | 'training';
  location?: string;
  lastSeen: string;
}

export interface PersonnelLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  lastUpdate: string;
}

// Fire Report Types
export interface FireReportCardData {
  id: string;
  title: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled';
  type: 'fire' | 'rescue' | 'hazardous_material' | 'medical' | 'other';
  reportedAt: string;
  assignedPersonnel: string[];
  estimatedResponseTime: number;
  actualResponseTime?: number;
  description: string;
  stationId: string;
}

export interface ReportsByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface ReportsByPriority {
  priority: string;
  count: number;
  percentage: number;
}

export interface ReportsByType {
  type: string;
  count: number;
  percentage: number;
}

// Department Data Types
export interface DepartmentData {
  id: string;
  name: string;
  stationId: string;
  headOfDepartment: string;
  personnelCount: number;
  equipmentCount: number;
  performance: DepartmentPerformance;
}

export interface DepartmentPerformance {
  responseTime: number;
  incidentResolution: number;
  personnelUtilization: number;
  equipmentMaintenance: number;
  safetyCompliance: number;
}

export interface SubdivisionData {
  id: string;
  name: string;
  departmentId: string;
  supervisor: string;
  personnelCount: number;
}

export interface DepartmentPersonnel {
  departmentId: string;
  departmentName: string;
  personnel: PersonnelData[];
}

// Analytics Types
export interface UserActivity {
  date: string;
  activeUsers: number;
  loginCount: number;
  actionsPerformed: number;
}

export interface SystemPerformance {
  date: string;
  responseTime: number;
  uptime: number;
  errorRate: number;
  throughput: number;
}

export interface SecurityMetrics {
  date: string;
  loginAttempts: number;
  failedLogins: number;
  securityAlerts: number;
  blockedIPs: number;
}

export interface ComplianceReport {
  id: string;
  title: string;
  type: string;
  status: 'compliant' | 'non_compliant' | 'pending';
  score: number;
  lastAudit: string;
  nextAudit: string;
}

export interface ResponseTimeTrend {
  date: string;
  averageResponseTime: number;
  targetResponseTime: number;
}

export interface IncidentTrend {
  date: string;
  totalIncidents: number;
  resolvedIncidents: number;
  pendingIncidents: number;
}

export interface PersonnelUtilization {
  date: string;
  utilizationRate: number;
  onDutyPersonnel: number;
  totalPersonnel: number;
}

// System Configuration Types
export interface OTPSettings {
  enabled: boolean;
  expirationTime: number;
  maxAttempts: number;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  webhook: boolean;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  sessionTimeout: number;
  maxLoginAttempts: number;
  twoFactorAuth: boolean;
}

export interface BackupSettings {
  frequency: 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  cloudBackup: boolean;
  localBackup: boolean;
}

export interface SystemConfig {
  otpSettings: OTPSettings;
  notificationSettings: NotificationSettings;
  securitySettings: SecuritySettings;
  backupSettings: BackupSettings;
}

// Station Configuration Types
export interface StationSettings {
  name: string;
  location: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  operatingHours: {
    start: string;
    end: string;
  };
  coverageArea: {
    radius: number;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface DepartmentSettings {
  departments: DepartmentData[];
  subdivisions: SubdivisionData[];
}

export interface PersonnelSettings {
  ranks: string[];
  departments: string[];
  trainingRequirements: string[];
}

// Audit Log Types
export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
  userId?: string;
}

export interface UserLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  details: string;
  ipAddress: string;
}

export interface AdminAction {
  id: string;
  timestamp: string;
  adminId: string;
  action: string;
  target: string;
  details: string;
  result: 'success' | 'failure';
}

// Operations Specific Types
export interface IncidentQueue {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  location: string;
  reportedAt: string;
  estimatedResponseTime: number;
}

export interface DispatchedUnit {
  id: string;
  unitId: string;
  personnel: string[];
  incidentId: string;
  dispatchedAt: string;
  estimatedArrival: string;
  status: 'dispatched' | 'en_route' | 'arrived' | 'completed';
}

export interface ResponseTracking {
  incidentId: string;
  unitId: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
  };
  lastUpdate: string;
}

export interface DispatchQueue {
  id: string;
  incidentId: string;
  priority: string;
  assignedUnits: string[];
  status: 'pending' | 'dispatched' | 'in_progress' | 'completed';
}

export interface UnitAssignment {
  unitId: string;
  personnel: string[];
  incidentId: string;
  assignedAt: string;
  status: string;
}

export interface ResourceAllocation {
  resourceType: string;
  available: number;
  allocated: number;
  required: number;
}

export interface CommunicationLog {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  message: string;
  type: 'voice' | 'text' | 'data';
}

// Safety Specific Types
export interface SafetyIncident {
  id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedAt: string;
  reportedBy: string;
  description: string;
  location: string;
  affectedPersonnel: string[];
  correctiveActions: string[];
}

export interface SafetyIncidentTrend {
  date: string;
  incidents: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SafetyIncidentType {
  type: string;
  count: number;
  percentage: number;
}

export interface SafetyIncidentSeverity {
  severity: string;
  count: number;
  percentage: number;
}

export interface SafetyOfficer {
  id: string;
  name: string;
  rank: string;
  certifications: string[];
  lastTraining: string;
  performance: SafetyPerformance;
}

export interface SafetyTraining {
  id: string;
  title: string;
  type: string;
  participants: string[];
  completedAt: string;
  score: number;
}

export interface CertificationStatus {
  personnelId: string;
  name: string;
  certifications: {
    name: string;
    status: 'valid' | 'expired' | 'pending';
    expiryDate: string;
  }[];
}

export interface SafetyPerformance {
  incidentPrevention: number;
  complianceScore: number;
  trainingCompletion: number;
  safetyLeadership: number;
}

// PR Specific Types
export interface MediaReport {
  id: string;
  title: string;
  source: string;
  type: 'news' | 'social_media' | 'press_release';
  sentiment: 'positive' | 'neutral' | 'negative';
  publishedAt: string;
  url: string;
  summary: string;
}

export interface PressRelease {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  status: 'draft' | 'published' | 'archived';
  mediaContacts: string[];
}

export interface MediaContact {
  id: string;
  name: string;
  organization: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  relationship: 'friendly' | 'neutral' | 'hostile';
}

export interface MediaCoverage {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface PublicAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'emergency' | 'general' | 'safety_tip';
  priority: 'low' | 'medium' | 'high';
  publishedAt: string;
  channels: string[];
  reach: number;
}

export interface AnnouncementSchedule {
  id: string;
  announcementId: string;
  scheduledAt: string;
  channels: string[];
  status: 'scheduled' | 'sent' | 'failed';
}

export interface AnnouncementReach {
  announcementId: string;
  channel: string;
  reach: number;
  engagement: number;
  timestamp: string;
}

export interface PRCampaign {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  budget: number;
  targetAudience: string;
}

export interface CampaignPerformance {
  campaignId: string;
  reach: number;
  engagement: number;
  conversions: number;
  costPerReach: number;
}

export interface CampaignMetrics {
  campaignId: string;
  impressions: number;
  clicks: number;
  shares: number;
  comments: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}
