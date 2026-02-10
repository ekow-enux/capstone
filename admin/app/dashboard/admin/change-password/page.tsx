"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStationAdminAuthStore } from "@/lib/stores/stationAdminAuth";
import { User, Lock, AlertCircle, Key, CheckCircle, Building2 } from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { resolveDashboardPath } from "@/lib/constants/roles";

const ChangePasswordPage = () => {
  const router = useRouter();
  const { changePassword, isLoading, error, clearError, user, fetchStationAdminData } = useStationAdminAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({});
  const [checkingPassword, setCheckingPassword] = useState(true);

  // Check if user has temp password on mount
  useEffect(() => {
    const checkTempPassword = async () => {
      if (!user?.stationId) {
        toast.error("Station ID not found. Redirecting...");
        setTimeout(() => router.replace("/dashboard/admin"), 2000);
        return;
      }

      try {
        const result = await fetchStationAdminData(user.stationId);
        if (!result.hasTempPassword) {
          // No temp password, redirect to dashboard
          router.replace("/dashboard/admin");
        }
        setCheckingPassword(false);
      } catch (error) {
        console.error("Error checking password status:", error);
        setCheckingPassword(false);
        // Continue to show password change form even if check fails
      }
    };

    checkTempPassword();
  }, [user, fetchStationAdminData, router]);

  const validatePasswordChange = () => {
    const errors: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {};
    
    if (!currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }
    
    if (!newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    
    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validatePasswordChange()) {
      return;
    }

    if (!user?.userId) {
      toast.error("User ID not found");
      return;
    }

    try {
      // Backend expects: POST /station-admin/{id}/change-password
      // Body: { oldPassword?: string, newPassword: string }
      // oldPassword can be null if using temp password (backend will check tempPassword)
      await changePassword(user.userId, currentPassword || null, newPassword);
      
      // Get updated user data to determine redirect path based on role
      const updatedUser = useStationAdminAuthStore.getState().user;
      const dashboardPath = updatedUser ? resolveDashboardPath(updatedUser.role) : "/dashboard/admin";
      
      toast.success("Password changed successfully! Redirecting...");
      setTimeout(() => {
        router.replace(dashboardPath);
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      toast.error(errorMessage);
    }
  };

  if (checkingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 dark:from-gray-950 dark:via-red-900/20 dark:to-orange-900/20">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-red-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Checking password status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 dark:from-gray-950 dark:via-red-900/20 dark:to-orange-900/20 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Key className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Change Password</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You are using a temporary password. Please create a new password to continue.
          </p>
        </div>

        {/* Username Display (Read-only) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={user?.stationAdminData?.username || ""}
              readOnly
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-800 dark:text-yellow-300 font-semibold mb-1">Password Change Required</p>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                You are using a temporary password. Please create a new password to access your dashboard.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          {/* Current Password Field */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Current Password (Temporary) <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setFormErrors({ ...formErrors, currentPassword: undefined });
                }}
                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                  formErrors.currentPassword || error
                    ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-gray-700 focus:border-red-400 focus:bg-red-50/30 dark:focus:bg-red-900/10"
                }`}
                placeholder="Enter your temporary password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formErrors.currentPassword && (
              <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {formErrors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              New Password <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setFormErrors({ ...formErrors, newPassword: undefined });
                }}
                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                  formErrors.newPassword || error
                    ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-gray-700 focus:border-red-400 focus:bg-red-50/30 dark:focus:bg-red-900/10"
                }`}
                placeholder="Enter your new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formErrors.newPassword && (
              <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {formErrors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFormErrors({ ...formErrors, confirmPassword: undefined });
                }}
                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                  formErrors.confirmPassword || error
                    ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-gray-700 focus:border-red-400 focus:bg-red-50/30 dark:focus:bg-red-900/10"
                }`}
                placeholder="Confirm your new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-3">
              <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Changing password...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Change Password
              </>
            )}
          </button>
        </form>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default ChangePasswordPage;

