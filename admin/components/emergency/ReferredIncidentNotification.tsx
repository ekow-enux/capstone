'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, MapPin, Clock, Shield, CheckCircle, XCircle, ArrowRight, Users, Activity } from 'lucide-react';
import { useReferralsStore } from '@/lib/stores/referrals';
import { useIncidentsStore } from '@/lib/stores/incidents';
import toast from 'react-hot-toast';

interface ReferredIncidentNotificationProps {
  notification: any;
  onClose: () => void;
}

const ReferredIncidentNotification: React.FC<ReferredIncidentNotificationProps> = ({
  notification,
  onClose,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');

  const acceptReferral = useReferralsStore((state) => state.acceptReferral);
  const rejectReferral = useReferralsStore((state) => state.rejectReferral);
  const updateIncident = useIncidentsStore((state) => state.updateIncident);

  const handleAccept = async () => {
    if (!notification?.referral?.referralId) {
      toast.error('Invalid referral ID');
      return;
    }

    setIsProcessing(true);
    try {
      // Accept the referral
      await acceptReferral(notification.referral.referralId, responseNotes.trim() || undefined);
      
      // Update incident status if needed
      if (notification._id) {
        await updateIncident(notification._id, { status: 'active' });
      }
      
      toast.success('Referral accepted successfully');
      setShowAcceptDialog(false);
      setResponseNotes('');
      onClose();
    } catch (error: any) {
      console.error('Error accepting referral:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to accept referral');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!notification?.referral?.referralId) {
      toast.error('Invalid referral ID');
      return;
    }

    if (!responseNotes.trim()) {
      toast.error('Please provide a reason for rejecting this referral');
      return;
    }

    setIsProcessing(true);
    try {
      // Reject the referral
      await rejectReferral(notification.referral.referralId, responseNotes.trim());
      
      toast.success('Referral rejected');
      setShowRejectDialog(false);
      setResponseNotes('');
      onClose();
    } catch (error: any) {
      console.error('Error rejecting referral:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject referral');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-orange-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">🔔 Referred Incident Received</h2>
                  <p className="text-orange-100 text-sm mt-1">
                    From: {notification?.referral?.fromStation?.name || 'Unknown Station'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Referral Info Banner */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-orange-900 mb-1">Referral Details</h3>
                  <p className="text-sm text-orange-800 mb-2">
                    <strong>From Station:</strong> {notification?.referral?.fromStation?.name}
                  </p>
                  {notification?.referral?.reason && (
                    <p className="text-sm text-orange-800">
                      <strong>Reason:</strong> {notification.referral.reason}
                    </p>
                  )}
                  <p className="text-xs text-orange-700 mt-2">
                    Referred at: {new Date(notification?.referral?.referredAt || Date.now()).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-600" />
                    Incident Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Incident ID</label>
                      <div className="mt-1 text-gray-900 font-mono text-sm">
                        {notification?._id || 'N/A'}
                      </div>
                    </div>
                    {notification?.alertId && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Alert ID</label>
                        <div className="mt-1 text-gray-900 font-mono text-sm">
                          {typeof notification.alertId === 'string' ? notification.alertId : notification.alertId._id || notification.alertId.id}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                      <div className="mt-1">
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {notification?.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Department and Unit */}
                {(notification?.departmentOnDuty || notification?.unitOnDuty) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Assigned Resources
                    </h3>
                    <div className="space-y-2">
                      {notification.departmentOnDuty && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Department</label>
                          <div className="mt-1 text-gray-900">
                            {typeof notification.departmentOnDuty === 'string' 
                              ? notification.departmentOnDuty 
                              : notification.departmentOnDuty.name || 'N/A'}
                          </div>
                        </div>
                      )}
                      {notification.unitOnDuty && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Unit</label>
                          <div className="mt-1 text-gray-900">
                            {typeof notification.unitOnDuty === 'string' 
                              ? notification.unitOnDuty 
                              : notification.unitOnDuty.name || 'N/A'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Alert Details if available */}
                {notification?.alertId && typeof notification.alertId === 'object' && notification.alertId.location && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Location
                    </h3>
                    <div className="space-y-2">
                      {notification.alertId.location.locationName && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                          <div className="mt-1 text-gray-900">{notification.alertId.location.locationName}</div>
                        </div>
                      )}
                      {notification.alertId.location.coordinates && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Coordinates</label>
                          <div className="mt-1 text-gray-900 font-mono text-sm">
                            {notification.alertId.location.coordinates.latitude?.toFixed(6)}, {notification.alertId.location.coordinates.longitude?.toFixed(6)}
                          </div>
                        </div>
                      )}
                      {notification.alertId.location.locationUrl && (
                        <div>
                          <a
                            href={notification.alertId.location.locationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Station Info */}
                {notification?.station && (
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Station
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-semibold text-blue-700 uppercase">Name</label>
                        <div className="mt-1 text-blue-900 font-semibold">
                          {typeof notification.station === 'string' ? notification.station : notification.station.name}
                        </div>
                      </div>
                      {notification.station.location && (
                        <div>
                          <label className="text-xs font-semibold text-blue-700 uppercase">Location</label>
                          <div className="mt-1 text-blue-900 text-sm">{notification.station.location}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    Timestamps
                  </h3>
                  <div className="space-y-2 text-sm">
                    {notification?.createdAt && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Created</label>
                        <div className="mt-1 text-gray-900">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                    {notification?.updatedAt && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Updated</label>
                        <div className="mt-1 text-gray-900">
                          {new Date(notification.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-200">
              <button
                onClick={() => setShowRejectDialog(true)}
                disabled={isProcessing}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Reject Referral
              </button>
              <button
                onClick={() => setShowAcceptDialog(true)}
                disabled={isProcessing}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Accept Referral
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Accept Dialog */}
      {showAcceptDialog && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Accept Referral</h3>
            <p className="text-gray-600 mb-4">You are about to accept this referred incident. Add optional notes:</p>
            <textarea
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              placeholder="Optional response notes..."
              className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none resize-none mb-4"
              disabled={isProcessing}
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAcceptDialog(false);
                  setResponseNotes('');
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Referral</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this referral:</p>
            <textarea
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              placeholder="Reason for rejection (required)..."
              className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none resize-none mb-4"
              disabled={isProcessing}
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setResponseNotes('');
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !responseNotes.trim()}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReferredIncidentNotification;

