'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { EmergencyAlert } from '@/lib/types/emergencyAlert';
import { AlertTriangle, X, MapPin, Phone, Clock, Shield, Volume2, VolumeX, CheckCircle, XCircle, ArrowRight, Search } from 'lucide-react';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import { useEmergencyAlertsStore } from '@/lib/stores/emergencyAlerts';
import { useIncidentsStore } from '@/lib/stores/incidents';
import { useReferralsStore } from '@/lib/stores/referrals';
import toast from 'react-hot-toast';

interface EmergencyAlertPopupProps {
  alert: EmergencyAlert | null;
  onClose: () => void;
  onAcknowledge?: (alertId: string) => void;
  onReject?: (alertId: string, reason: string) => Promise<void>;
  onRefer?: (alertId: string, stationId: string, reason: string) => Promise<void>;
}

// Helper function to capitalize first letter
const capitalize = (str: string | undefined | null) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Helper function to format date
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

// Generate danger/warning alarm sound using Web Audio API
const playDangerAlarm = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a danger/warning alarm pattern (like a smoke detector or security alarm)
    const createDangerTone = (startTime: number, frequency: number, duration: number, volume: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'square'; // Square wave for a more harsh, warning-like sound
      
      // Sharp attack and decay for a piercing sound
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.setValueAtTime(volume, startTime + duration - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    const volume = 0.9; // Very loud
    
    // Danger alarm pattern: Three sharp, piercing beeps (like smoke detector)
    // High frequency (around 3000Hz) for maximum attention-grabbing
    createDangerTone(now, 3000, 0.1, volume);        // First beep
    createDangerTone(now + 0.15, 3000, 0.1, volume); // Second beep
    createDangerTone(now + 0.3, 3000, 0.1, volume);  // Third beep
    
    // Add a lower frequency component for depth and urgency
    createDangerTone(now, 1500, 0.1, volume * 0.6);
    createDangerTone(now + 0.15, 1500, 0.1, volume * 0.6);
    createDangerTone(now + 0.3, 1500, 0.1, volume * 0.6);
    
  } catch (error) {
    console.error('Error playing danger alarm sound:', error);
    // Fallback: try simple danger beep if complex sound fails
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 3000; // High frequency for danger
      oscillator.type = 'square'; // Harsh sound
      
      gainNode.gain.setValueAtTime(0.9, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (fallbackError) {
      console.error('Error playing fallback sound:', fallbackError);
    }
  }
};

const EmergencyAlertPopup: React.FC<EmergencyAlertPopupProps> = ({ 
  alert, 
  onClose, 
  onAcknowledge,
  onReject,
  onRefer
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showReferDialog, setShowReferDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [referReason, setReferReason] = useState('');
  const [selectedStationId, setSelectedStationId] = useState('');
  const [stationSearchTerm, setStationSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const beepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch stations for refer dialog
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

  // Filter stations based on search term
  const filteredStations = useMemo(() => {
    if (!stationSearchTerm) return stations;
    const searchLower = stationSearchTerm.toLowerCase();
    return stations.filter(station => 
      station.name?.toLowerCase().includes(searchLower) ||
      station.location?.toLowerCase().includes(searchLower) ||
      station.call_sign?.toLowerCase().includes(searchLower)
    );
  }, [stations, stationSearchTerm]);

  useEffect(() => {
    if (alert) {
      // Only show popup if status is 'active' or 'pending'
      const shouldShow = alert.status === 'active' || alert.status === 'pending';
      
      if (shouldShow) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        return;
      }
      
      // Play danger alarm sound if not muted
      if (!isMuted) {
        // Play initial danger alarm sequence
        playDangerAlarm();
        
        // Continue playing danger alarm every 2.5 seconds
        beepIntervalRef.current = setInterval(() => {
          if (!isMuted) {
            playDangerAlarm();
          }
        }, 2500);
      }
    } else {
      setIsVisible(false);
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = null;
      }
    }

    return () => {
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = null;
      }
    };
  }, [alert, isMuted]);

  console.log('Alert:', alert); 

  if (!alert || !isVisible) return null;

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
  };

  const handleAccept = async () => {
    if (onAcknowledge) {
      setIsProcessing(true);
      try {
        await onAcknowledge(alert.id || alert._id);
        onClose();
      } catch (error) {
        console.error('Error acknowledging alert:', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      onClose();
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      window.alert('Please provide a reason for rejecting this alert.');
      return;
    }
    if (onReject) {
      setIsProcessing(true);
      try {
        await onReject(alert.id || alert._id, rejectReason);
        setShowRejectDialog(false);
        setRejectReason('');
        onClose();
      } catch (error) {
        console.error('Error rejecting alert:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleRefer = async () => {
    if (!selectedStationId) {
      toast.error('Please select a station to refer this alert to.');
      return;
    }
    if (!referReason.trim()) {
      toast.error('Please provide a reason for referring this alert.');
      return;
    }
    setIsProcessing(true);
    try {
      // Determine source station from alert or fallback ids
      const fromStationId =
        (typeof alert.station === 'string' && alert.station) ||
        alert.station?._id ||
        alert.station?.id ||
        alert.stationId;
      
      if (!fromStationId) {
        toast.error('Unable to determine source station. Cannot create referral.');
        setIsProcessing(false);
        return;
      }
      
      // Create referral using the referrals API
      await createReferral({
        data_id: alert.id || alert._id,
        data_type: 'EmergencyAlert',
        from_station_id: fromStationId,
        to_station_id: selectedStationId,
        reason: referReason.trim() || undefined,
      });
      
      // Update alert status if callback provided
      if (onRefer) {
        await onRefer(alert.id || alert._id, selectedStationId, referReason);
      }
      
      toast.success('Referral sent successfully');
      setShowReferDialog(false);
      setReferReason('');
      setSelectedStationId('');
      setStationSearchTerm('');
      onClose();
    } catch (error) {
      console.error('Error referring alert:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to refer alert');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'fire':
        return 'bg-red-100 text-red-800';
      case 'medical':
        return 'bg-blue-100 text-blue-800';
      case 'rescue':
        return 'bg-green-100 text-green-800';
      case 'flood':
        return 'bg-cyan-100 text-cyan-800';
      case 'hazardous':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 bg-opacity-90 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-2xl animate-pulse border-4 border-red-600 flex flex-col">
        {/* Header with pulsing red background - Fixed */}
        <div className={`${getPriorityColor(alert.priority)} text-white p-3 sm:p-4 rounded-t-lg flex-shrink-0`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide truncate">
                  Emergency Alert
                </h2>
                <p className="text-xs sm:text-sm opacity-90 mt-0.5">
                  {formatDate(alert.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={handleMuteToggle}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Alert Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {/* Title and Type */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
              {alert.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getAlertTypeColor(alert.alertType)}`}>
                {capitalize(alert.alertType)}
              </span>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getPriorityColor(alert.priority)} text-white`}>
                {capitalize(alert.priority)} Priority
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                {alert.status}
              </span>
            </div>
          </div>

          {/* Message */}
          {alert.message && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-800 text-sm sm:text-base line-clamp-3">{alert.message}</p>
            </div>
          )}

          {/* Description */}
          {alert.description && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-700 text-sm line-clamp-4">{alert.description}</p>
            </div>
          )}

          {/* Compact Grid Layout for Info Cards - 3 columns on large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Location */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">Location</p>
                <p className="text-gray-700 text-xs sm:text-sm line-clamp-2">
                  {alert.location?.locationName || 'Unknown Location'}
                </p>
                {(alert.location?.locationUrl) && (
                  <a
                    href={alert.location.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs mt-1 inline-flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    View Map
                  </a>
                )}
              </div>
            </div>

            {/* Reporter Information */}
            {alert.user && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Phone className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">Reporter</p>
                  <p className="text-gray-700 text-xs sm:text-sm truncate">
                    {alert.user.name || 'Unknown'}
                  </p>
                  {alert.user.phone && (
                    <p className="text-gray-600 text-xs mt-0.5 truncate">
                      {alert.user.phone}
                    </p>
                  )}
                  {alert.user.email && (
                    <p className="text-gray-600 text-xs mt-0.5 truncate">
                      {alert.user.email}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Station */}
            {alert.station && (
              <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Shield className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">Assigned Station</p>
                  <p className="text-gray-700 text-xs sm:text-sm truncate">{alert.station.name}</p>
                  {alert.station.location && (
                    <p className="text-gray-600 text-xs mt-0.5 line-clamp-1">
                      {alert.station.location}
                    </p>
                  )}
                  {alert.station.phone_number && (
                    <p className="text-gray-600 text-xs mt-0.5 truncate">
                      {alert.station.phone_number}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Status - Only show if station doesn't exist, otherwise it's redundant */}
            {!alert.station && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900 capitalize text-xs sm:text-sm">{alert.status}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-b-lg border-t flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {onReject && (
              <button
                onClick={() => setShowRejectDialog(true)}
                disabled={isProcessing}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            )}
            {onRefer && (
              <button
                onClick={() => setShowReferDialog(true)}
                disabled={isProcessing}
                className="px-3 sm:px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <ArrowRight className="w-4 h-4" />
                Refer
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              Dismiss
            </button>
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="px-3 sm:px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </button>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-600" />
                Reject Alert
              </h3>
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                }}
                disabled={isProcessing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this emergency alert.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none resize-none"
              disabled={isProcessing}
            />
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Reject Alert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refer Dialog */}
      {showReferDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-orange-600" />
                Refer Alert
              </h3>
              <button
                onClick={() => {
                  setShowReferDialog(false);
                  setReferReason('');
                  setSelectedStationId('');
                  setStationSearchTerm('');
                }}
                disabled={isProcessing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Select a fire station to refer this emergency alert to and provide a reason.
            </p>
            
            {/* Station Search */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Fire Station
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={stationSearchTerm}
                  onChange={(e) => setStationSearchTerm(e.target.value)}
                  placeholder="Search stations..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  disabled={isProcessing}
                />
              </div>
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

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReferDialog(false);
                  setReferReason('');
                  setSelectedStationId('');
                  setStationSearchTerm('');
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRefer}
                disabled={isProcessing || !selectedStationId || !referReason.trim()}
                className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Refer Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyAlertPopup;

