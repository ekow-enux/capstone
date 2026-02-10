'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, X, MapPin, Phone, Clock, Shield, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useEmergencyAlertsStore } from '@/lib/stores/emergencyAlerts';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import { useIncidentsStore } from '@/lib/stores/incidents';
import { useReferralsStore } from '@/lib/stores/referrals';
import toast from 'react-hot-toast';

interface ActiveIncidentNotificationData {
  alert: {
    _id: string;
    incidentType: string;
    incidentName: string;
    userName?: string;
    userContact?: {
      email?: string;
      phone?: string;
    };
    locationName: string;
    locationUrl?: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
    };
    stationInfo?: {
      _id: string;
      name: string;
      location?: string;
      phone?: string;
    };
    priority: string;
    timestamps: {
      createdAt: string;
      updatedAt: string;
      reportedAt: string;
    };
    status: string;
  };
  activeIncident: {
    _id: string;
    status: string;
    alertId: string;
    departmentOnDuty?: string;
    unitOnDuty?: string;
    createdAt: string;
  };
  stationId: string;
  message: string;
  requiresAction: boolean;
}

interface ActiveIncidentNotificationProps {
  notification: ActiveIncidentNotificationData | null;
  onClose: () => void;
  onRefer: (alertId: string) => void;
  onAccept: (alertId: string) => void;
}

const ActiveIncidentNotification: React.FC<ActiveIncidentNotificationProps> = ({
  notification,
  onClose,
  onRefer,
  onAccept,
}) => {
  const [showReferDialog, setShowReferDialog] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [referReason, setReferReason] = useState('');
  const [stationSearchTerm, setStationSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const stations = useStationsStore(selectStations);
  const fetchStations = useStationsStore((state) => state.fetchStations);
  const isLoadingStations = useStationsStore((state) => state.isLoading);
  
  // Get alerts and incidents to check for active ones
  const alerts = useEmergencyAlertsStore((state) => state.alerts);
  const incidents = useIncidentsStore((state) => state.incidents);
  const fetchIncidents = useIncidentsStore((state) => state.fetchIncidents);
  
  // Referrals store
  const createReferral = useReferralsStore((state) => state.createReferral);

  useEffect(() => {
    if (showReferDialog) {
      if (stations.length === 0) {
        fetchStations();
      }
      if (incidents.length === 0) {
        fetchIncidents();
      }
    }
  }, [showReferDialog, stations.length, incidents.length, fetchStations, fetchIncidents]);

  // Check if a station should be disabled
  const isStationDisabled = useMemo(() => {
    return (stationId: string) => {
      const station = stations.find(s => (s.id || s._id) === stationId);
      if (!station) return { disabled: false, reason: '' };
      
      // Check if station is out of commission
      if (station.status === 'out of commission') {
        return { disabled: true, reason: 'Station is out of commission' };
      }
      
      // Check if station has active alerts
      const stationActiveAlerts = alerts.filter(a => {
        const alertStationId = typeof a.station === 'string' ? a.station : a.station?._id || a.station?.id;
        return (alertStationId === stationId || alertStationId === station._id) && 
               (a.status === 'active' || a.status === 'pending');
      });
      if (stationActiveAlerts.length > 0) {
        return { disabled: true, reason: `Station has ${stationActiveAlerts.length} active alert(s)` };
      }
      
      // Check if station has active incidents
      const stationActiveIncidents = incidents.filter(i => {
        const incidentStationId = typeof i.alertId === 'object' && i.alertId !== null 
          ? (typeof (i.alertId as any).station === 'string' 
              ? (i.alertId as any).station 
              : (i.alertId as any).station?._id || (i.alertId as any).station?.id)
          : null;
        return (incidentStationId === stationId || incidentStationId === station._id) && 
               (i.status === 'active' || i.status === 'pending');
      });
      if (stationActiveIncidents.length > 0) {
        return { disabled: true, reason: `Station has ${stationActiveIncidents.length} active incident(s)` };
      }
      
      return { disabled: false, reason: '' };
    };
  }, [stations, alerts, incidents]);

  const filteredStations = React.useMemo(() => {
    if (!stationSearchTerm) return stations;
    const searchLower = stationSearchTerm.toLowerCase();
    return stations.filter(station =>
      station.name?.toLowerCase().includes(searchLower) ||
      station.location?.toLowerCase().includes(searchLower) ||
      station.call_sign?.toLowerCase().includes(searchLower)
    );
  }, [stations, stationSearchTerm]);

  const handleAcceptClick = async () => {
    if (!notification) return;
    setIsProcessing(true);
    try {
      await onAccept(notification.alert._id);
      onClose();
    } catch (error) {
      console.error('Error accepting alert:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReferClick = async () => {
    if (!notification) return;
    if (!selectedStationId) {
      window.alert('Please select a station to refer this alert to.');
      return;
    }
    if (!referReason.trim()) {
      window.alert('Please provide a reason for referring this alert.');
      return;
    }
    setIsProcessing(true);
    try {
      // Get the current station ID from notification
      const fromStationId = notification.stationId;
      
      if (!fromStationId) {
        window.alert('Unable to determine source station. Cannot create referral.');
        setIsProcessing(false);
        return;
      }
      
      // Create referral using the new referrals API
      await createReferral({
        data_id: notification.alert._id,
        data_type: 'EmergencyAlert',
        from_station_id: fromStationId,
        to_station_id: selectedStationId,
        reason: referReason.trim() || undefined,
      });
      
      // Call the onRefer callback if provided (for updating alert status)
      await onRefer(notification.alert._id);
      
      toast.success('Alert referred successfully');
      setShowReferDialog(false);
      setSelectedStationId('');
      setReferReason('');
      setStationSearchTerm('');
      onClose();
    } catch (error: any) {
      console.error('Error referring alert:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to refer alert');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (!notification) return null;

  return (
    <>
      {/* Floating Card at Top-Right */}
      <div className="fixed top-4 right-4 z-[60] w-96 max-w-sm bg-white rounded-xl shadow-2xl border-4 border-orange-500 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 animate-pulse" />
              <div>
                <h2 className="text-xl font-black uppercase tracking-wide">
                  ⚠️ Active Incident Detected
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  {notification.message}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close"
              disabled={isProcessing}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Compact */}
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {notification.alert.incidentName}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {notification.alert.locationName}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.alert.priority)} text-white`}>
                {notification.alert.priority.toUpperCase()}
              </span>
              <span className="text-gray-500">
                {formatDate(notification.alert.timestamps.reportedAt)}
              </span>
            </div>

            <div className="text-xs text-gray-600 bg-orange-50 p-2 rounded">
              ⚠️ Station already has an active incident. This alert requires special attention.
            </div>
          </div>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 border-t">
          <button
            onClick={() => setShowReferDialog(true)}
            disabled={isProcessing}
            className="flex-1 px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <ArrowRight className="w-4 h-4" />
            Refer
          </button>
          <button
            onClick={handleAcceptClick}
            disabled={isProcessing}
            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <CheckCircle className="w-4 h-4" />
            Accept
          </button>
        </div>
      </div>

      {/* Refer Dialog */}
      {showReferDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-orange-600" />
                Refer Alert to Another Station
              </h3>
              <button
                onClick={() => {
                  setShowReferDialog(false);
                  setSelectedStationId('');
                  setReferReason('');
                  setStationSearchTerm('');
                }}
                disabled={isProcessing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Station Search */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Fire Station
              </label>
              <input
                type="text"
                value={stationSearchTerm}
                onChange={(e) => setStationSearchTerm(e.target.value)}
                placeholder="Search stations..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                disabled={isProcessing}
              />
              <div className="mt-2 max-h-48 overflow-y-auto border-2 border-gray-200 rounded-lg">
                {isLoadingStations ? (
                  <div className="p-4 text-center text-gray-500">Loading stations...</div>
                ) : filteredStations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No stations found</div>
                ) : (
                  filteredStations.map((station) => {
                    const stationId = station.id || station._id;
                    const stationStatus = isStationDisabled(stationId);
                    return (
                      <button
                        key={stationId}
                        onClick={() => {
                          if (!stationStatus.disabled) {
                            setSelectedStationId(stationId);
                          }
                        }}
                        disabled={isProcessing || stationStatus.disabled}
                        className={`w-full text-left p-3 transition-colors border-b border-gray-100 last:border-b-0 ${
                          stationStatus.disabled
                            ? 'bg-gray-100 opacity-60 cursor-not-allowed'
                            : selectedStationId === stationId
                            ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                            : 'hover:bg-gray-50'
                        } disabled:opacity-50`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{station.name}</div>
                            {station.location && (
                              <div className="text-sm text-gray-600">{station.location}</div>
                            )}
                            {station.call_sign && (
                              <div className="text-xs text-gray-500">Call Sign: {station.call_sign}</div>
                            )}
                            {stationStatus.disabled && (
                              <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {stationStatus.reason}
                              </div>
                            )}
                          </div>
                          {stationStatus.disabled && (
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              {selectedStationId && (
                <div className="mt-2 text-sm text-green-600 font-semibold">
                  Selected: {filteredStations.find(s => (s.id || s._id) === selectedStationId)?.name}
                </div>
              )}
            </div>

            {/* Refer Reason */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Referral
              </label>
              <textarea
                value={referReason}
                onChange={(e) => setReferReason(e.target.value)}
                placeholder="Enter reason for referring this alert..."
                className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                disabled={isProcessing}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowReferDialog(false);
                  setSelectedStationId('');
                  setReferReason('');
                  setStationSearchTerm('');
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReferClick}
                disabled={isProcessing || !selectedStationId || !referReason.trim()}
                className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Refer Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActiveIncidentNotification;

