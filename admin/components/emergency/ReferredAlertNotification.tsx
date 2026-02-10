'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, MapPin, Phone, Clock, Shield, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useReferralsStore } from '@/lib/stores/referrals';
import { useEmergencyAlertsStore } from '@/lib/stores/emergencyAlerts';
import toast from 'react-hot-toast';

interface ReferredAlertNotificationProps {
  notification: any;
  onClose: () => void;
}

const ReferredAlertNotification: React.FC<ReferredAlertNotificationProps> = ({
  notification,
  onClose,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');

  const acceptReferral = useReferralsStore((state) => state.acceptReferral);
  const rejectReferral = useReferralsStore((state) => state.rejectReferral);
  const updateAlert = useEmergencyAlertsStore((state) => state.updateAlert);

  const handleAccept = async () => {
    if (!notification?.referral?.referralId) {
      toast.error('Invalid referral ID');
      return;
    }

    setIsProcessing(true);
    try {
      // Accept the referral
      await acceptReferral(notification.referral.referralId, responseNotes.trim() || undefined);
      
      // Update alert status to accepted if needed
      if (notification._id) {
        await updateAlert(notification._id, { status: 'accepted' });
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
                  <h2 className="text-2xl font-black text-white">🔔 Referred Alert Received</h2>
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

            {/* Alert Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Alert Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Incident Type</label>
                      <div className="mt-1 text-lg font-bold text-gray-900 capitalize">
                        {notification?.incidentType || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Incident Name</label>
                      <div className="mt-1 text-lg font-semibold text-gray-900">
                        {notification?.incidentName || 'N/A'}
                      </div>
                    </div>
                    {notification?.priority && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Priority</label>
                        <div className="mt-1">
                          <span className={`px-3 py-1 text-sm font-bold text-white rounded-full ${getPriorityColor(notification.priority)}`}>
                            {notification.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                {notification?.locationName && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Location
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                        <div className="mt-1 text-gray-900">{notification.locationName}</div>
                      </div>
                      {notification?.gpsCoordinates && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Coordinates</label>
                          <div className="mt-1 text-gray-900 font-mono text-sm">
                            {notification.gpsCoordinates.latitude?.toFixed(6)}, {notification.gpsCoordinates.longitude?.toFixed(6)}
                          </div>
                        </div>
                      )}
                      {notification?.locationUrl && (
                        <div>
                          <a
                            href={notification.locationUrl}
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

                {/* Reporter Info */}
                {(notification?.userName || notification?.userContact) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-green-600" />
                      Reporter Information
                    </h3>
                    <div className="space-y-2">
                      {notification.userName && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                          <div className="mt-1 text-gray-900">{notification.userName}</div>
                        </div>
                      )}
                      {notification.userContact?.phone && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                          <div className="mt-1 text-gray-900 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            {notification.userContact.phone}
                          </div>
                        </div>
                      )}
                      {notification.userContact?.email && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                          <div className="mt-1 text-gray-900">{notification.userContact.email}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Station Info */}
                {notification?.stationInfo && (
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Station
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-semibold text-blue-700 uppercase">Name</label>
                        <div className="mt-1 text-blue-900 font-semibold">{notification.stationInfo.name}</div>
                      </div>
                      {notification.stationInfo.location && (
                        <div>
                          <label className="text-xs font-semibold text-blue-700 uppercase">Location</label>
                          <div className="mt-1 text-blue-900 text-sm">{notification.stationInfo.location}</div>
                        </div>
                      )}
                      {notification.stationInfo.phone_number && (
                        <div>
                          <label className="text-xs font-semibold text-blue-700 uppercase">Phone</label>
                          <div className="mt-1 text-blue-900 text-sm">{notification.stationInfo.phone_number}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                {notification?.timestamps && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      Timestamps
                    </h3>
                    <div className="space-y-2 text-sm">
                      {notification.timestamps.createdAt && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Created</label>
                          <div className="mt-1 text-gray-900">
                            {new Date(notification.timestamps.createdAt).toLocaleString()}
                          </div>
                        </div>
                      )}
                      {notification.timestamps.reportedAt && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Reported</label>
                          <div className="mt-1 text-gray-900">
                            {new Date(notification.timestamps.reportedAt).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
            <p className="text-gray-600 mb-4">You are about to accept this referred alert. Add optional notes:</p>
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

export default ReferredAlertNotification;

