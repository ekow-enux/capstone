'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Incident, IncidentStatus } from '@/lib/types/incident';
import { useIncidentsStore, selectIncidents } from '@/lib/stores/incidents';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import { useEmergencyAlertsStore } from '@/lib/stores/emergencyAlerts';
import { useReferralsStore } from '@/lib/stores/referrals';
import { AlertTriangle, X, CheckCircle, ArrowRight, Search, Send, XCircle, MapPin, Clock, Activity, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ActiveIncidentsBannerProps {
  className?: string;
  isFloating?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const INCIDENTS_ENDPOINT = `${API_BASE_URL}/incidents`;

const ActiveIncidentsBanner: React.FC<ActiveIncidentsBannerProps> = ({ 
  className = '', 
  isFloating = false 
}) => {
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showReferDialog, setShowReferDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [closeReason, setCloseReason] = useState('');
  const [referReason, setReferReason] = useState('');
  const [selectedStationId, setSelectedStationId] = useState('');
  const [stationSearchTerm, setStationSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const incidents = useIncidentsStore(selectIncidents);
  const fetchIncidents = useIncidentsStore((state) => state.fetchIncidents);
  const updateIncident = useIncidentsStore((state) => state.updateIncident);
  const stations = useStationsStore(selectStations);
  const fetchStations = useStationsStore((state) => state.fetchStations);
  const isLoadingStations = useStationsStore((state) => state.isLoading);
  
  // Get alerts and incidents to check for active ones
  const alerts = useEmergencyAlertsStore((state) => state.alerts);
  const allIncidents = useIncidentsStore((state) => state.incidents);
  
  // Referrals store
  const createReferral = useReferralsStore((state) => state.createReferral);

  // Fetch incidents on mount
  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Filter active incidents (exclude dispatched, en_route, on_scene - only show active/pending)
  const activeIncidents = useMemo(() => {
    return incidents.filter(incident => 
      incident.status === 'active' || 
      incident.status === 'pending'
    );
  }, [incidents]);

  // Fetch stations when refer dialog opens
  useEffect(() => {
    if (showReferDialog) {
      if (stations.length === 0) {
        fetchStations();
      }
      if (allIncidents.length === 0) {
        fetchIncidents();
      }
    }
  }, [showReferDialog, stations.length, allIncidents.length, fetchStations, fetchIncidents]);

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
      const stationActiveIncidents = allIncidents.filter(i => {
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
  }, [stations, alerts, allIncidents]);

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

  const handleDispatch = async (incident: Incident) => {
    setIsProcessing(true);
    try {
      await axios.patch(
        `${INCIDENTS_ENDPOINT}/${incident.id || incident._id}`,
        { status: 'dispatched' },
        { withCredentials: true }
      );
      toast.success('Incident dispatched successfully');
      await fetchIncidents();
    } catch (error: any) {
      console.error('Error dispatching incident:', error);
      toast.error(error.response?.data?.message || 'Failed to dispatch incident');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = async () => {
    if (!selectedIncident) return;
    if (!closeReason.trim()) {
      toast.error('Please provide a reason for closing this incident.');
      return;
    }

    setIsProcessing(true);
    try {
      const incidentId = selectedIncident.id || selectedIncident._id;
      await updateIncident(incidentId, { 
        status: 'completed'
      });
      toast.success('Incident closed successfully');
      setShowCloseDialog(false);
      setCloseReason('');
      setSelectedIncident(null);
      await fetchIncidents();
    } catch (error: any) {
      console.error('Error closing incident:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to close incident');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefer = async () => {
    if (!selectedIncident) return;
    if (!selectedStationId) {
      toast.error('Please select a station to refer this incident to.');
      return;
    }
    if (!referReason.trim()) {
      toast.error('Please provide a reason for referring this incident.');
      return;
    }

    setIsProcessing(true);
    try {
      // Get the current station ID from the incident
      const fromStationId = typeof selectedIncident.alertId === 'object' && selectedIncident.alertId !== null
        ? (typeof (selectedIncident.alertId as any).station === 'string'
            ? (selectedIncident.alertId as any).station
            : (selectedIncident.alertId as any).station?._id || (selectedIncident.alertId as any).station?.id)
        : null;
      
      if (!fromStationId) {
        toast.error('Unable to determine source station. Cannot create referral.');
        setIsProcessing(false);
        return;
      }
      
      // Create referral using the new referrals API
      await createReferral({
        data_id: selectedIncident.id || selectedIncident._id,
        data_type: 'Incident',
        from_station_id: fromStationId,
        to_station_id: selectedStationId,
        reason: referReason.trim() || undefined,
      });
      
      toast.success('Incident referred successfully');
      setShowReferDialog(false);
      setReferReason('');
      setSelectedStationId('');
      setStationSearchTerm('');
      setSelectedIncident(null);
      await fetchIncidents();
    } catch (error: any) {
      console.error('Error referring incident:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to refer incident');
    } finally {
      setIsProcessing(false);
    }
  };

  if (activeIncidents.length === 0) {
    return null;
  }

  const capitalize = (str: string | undefined | null) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'dispatched':
        return 'bg-blue-100 text-blue-800';
      case 'en_route':
        return 'bg-purple-100 text-purple-800';
      case 'on_scene':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isFloating) {
    return (
      <>
        <div className={`fixed top-20 right-4 z-40 max-w-lg w-full space-y-4 ${className}`}>
          {activeIncidents.map((incident) => (
            <div 
              key={incident.id || incident._id}
              className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-2xl border-4 border-red-800 p-4 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
                  </div>
                  <div className="flex-1 text-white">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-black">🚨 ACTIVE INCIDENT</h3>
                      {incident.alertId?.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          incident.alertId.priority === 'critical' ? 'bg-red-900 text-white' :
                          incident.alertId.priority === 'high' ? 'bg-orange-600 text-white' :
                          'bg-yellow-500 text-black'
                        }`}>
                          {capitalize(incident.alertId.priority)}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold">
                        {capitalize(incident.status.replace('_', ' '))}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-bold">Incident:</span>
                        <span className="text-sm font-semibold">
                          {incident.alertId?.incidentName || 'Incident #' + (incident.id?.slice(-8) || incident._id?.slice(-8))}
                        </span>
                      </div>
                      {incident.alertId?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-bold">Location:</span>
                          <span className="text-xs">{incident.alertId.location.locationName}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {incident.status === 'active' || incident.status === 'pending' ? (
                        <button
                          onClick={() => handleDispatch(incident)}
                          disabled={isProcessing}
                          className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center gap-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-3 h-3" />
                          Dispatch
                        </button>
                      ) : null}
                      <button
                        onClick={() => {
                          setSelectedIncident(incident);
                          setShowReferDialog(true);
                        }}
                        disabled={isProcessing}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowRight className="w-3 h-3" />
                        Refer
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIncident(incident);
                          setShowCloseDialog(true);
                        }}
                        disabled={isProcessing}
                        className="bg-red-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-900 transition-colors flex items-center gap-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-3 h-3" />
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Close Dialog */}
        {showCloseDialog && selectedIncident && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  Close Incident
                </h3>
                <button
                  onClick={() => {
                    setShowCloseDialog(false);
                    setCloseReason('');
                    setSelectedIncident(null);
                  }}
                  disabled={isProcessing}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Please provide a reason for closing this incident.
              </p>
              <textarea
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                placeholder="Enter closure reason..."
                className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none resize-none"
                disabled={isProcessing}
              />
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCloseDialog(false);
                    setCloseReason('');
                    setSelectedIncident(null);
                  }}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClose}
                  disabled={isProcessing || !closeReason.trim()}
                  className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Close Incident'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Refer Dialog */}
        {showReferDialog && selectedIncident && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ArrowRight className="w-6 h-6 text-orange-600" />
                  Refer Incident
                </h3>
                <button
                  onClick={() => {
                    setShowReferDialog(false);
                    setReferReason('');
                    setSelectedStationId('');
                    setStationSearchTerm('');
                    setSelectedIncident(null);
                  }}
                  disabled={isProcessing}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Select a fire station to refer this incident to and provide a reason.
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
                  placeholder="Enter reason for referring this incident..."
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
                    setSelectedIncident(null);
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
                  {isProcessing ? 'Processing...' : 'Refer Incident'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Banner style for dashboard - matching the emergency alert banner design
  return (
    <>
      {activeIncidents.length > 0 && (
        <div className={`space-y-4 mb-6 ${className}`}>
          {activeIncidents.map((incident) => (
            <div 
              key={incident.id || incident._id} 
              className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-2xl border-4 border-red-800 p-6 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-white animate-bounce" />
                  </div>
                  <div className="flex-1 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-2xl font-black">🚨 ACTIVE INCIDENT</h2>
                      {incident.alertId?.priority && (
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          incident.alertId.priority === 'critical' ? 'bg-red-900 text-white' :
                          incident.alertId.priority === 'high' ? 'bg-orange-600 text-white' :
                          'bg-yellow-500 text-black'
                        }`}>
                          {capitalize(incident.alertId.priority)} Priority
                        </span>
                      )}
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                        {capitalize(incident.status.replace('_', ' '))}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-bold">Incident:</span>
                          <span className="font-semibold">
                            {incident.alertId?.incidentName || 'Incident #' + (incident.id?.slice(-8) || incident._id?.slice(-8))}
                          </span>
                        </div>
                        {incident.alertId && (
                          <>
                            <div className="flex items-center gap-2">
                              <Activity className="w-5 h-5" />
                              <span className="font-bold">Type:</span>
                              <span className="capitalize">{incident.alertId.incidentType}</span>
                            </div>
                            {incident.departmentOnDuty && (
                              <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                <span className="font-bold">Department:</span>
                                <span>{incident.departmentOnDuty.name}</span>
                              </div>
                            )}
                            {incident.unitOnDuty && (
                              <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                <span className="font-bold">Unit:</span>
                                <span>{incident.unitOnDuty.name}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="space-y-2">
                        {incident.alertId?.location && (
                          <>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5" />
                              <span className="font-bold">Location:</span>
                              <span className="text-sm">{incident.alertId.location.locationName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5" />
                              <span className="font-bold">Coordinates:</span>
                              <span className="text-sm font-mono">
                                {incident.alertId.location.coordinates.latitude.toFixed(6)}, {incident.alertId.location.coordinates.longitude.toFixed(6)}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          <span className="font-bold">Created:</span>
                          <span className="text-sm">{new Date(incident.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 flex-wrap">
                      {incident.status === 'active' || incident.status === 'pending' ? (
                        <button
                          onClick={() => handleDispatch(incident)}
                          disabled={isProcessing}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4" />
                          Dispatch
                        </button>
                      ) : null}
                      <button
                        onClick={() => {
                          setSelectedIncident(incident);
                          setShowReferDialog(true);
                        }}
                        disabled={isProcessing}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Refer
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIncident(incident);
                          setShowCloseDialog(true);
                        }}
                        disabled={isProcessing}
                        className="bg-red-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-900 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Close Dialog - Same as floating version */}
      {showCloseDialog && selectedIncident && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-600" />
                Close Incident
              </h3>
              <button
                onClick={() => {
                  setShowCloseDialog(false);
                  setCloseReason('');
                  setSelectedIncident(null);
                }}
                disabled={isProcessing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Please provide a reason for closing this incident.
            </p>
            <textarea
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder="Enter closure reason..."
              className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none resize-none"
              disabled={isProcessing}
            />
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCloseDialog(false);
                  setCloseReason('');
                  setSelectedIncident(null);
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={isProcessing || !closeReason.trim()}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Close Incident'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refer Dialog - Same as floating version */}
      {showReferDialog && selectedIncident && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-orange-600" />
                Refer Incident
              </h3>
              <button
                onClick={() => {
                  setShowReferDialog(false);
                  setReferReason('');
                  setSelectedStationId('');
                  setStationSearchTerm('');
                  setSelectedIncident(null);
                }}
                disabled={isProcessing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Select a fire station to refer this incident to and provide a reason.
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
                placeholder="Enter reason for referring this incident..."
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
                  setSelectedIncident(null);
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
                {isProcessing ? 'Processing...' : 'Refer Incident'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActiveIncidentsBanner;

