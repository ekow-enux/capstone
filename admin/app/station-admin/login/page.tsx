"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStationAdminAuthStore } from "@/lib/stores/stationAdminAuth";
import { User, Lock, AlertCircle, Building2, Key, CheckCircle } from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { resolveDashboardPath } from "@/lib/constants/roles";

const StationAdminLoginPage = () => {
  const router = useRouter();
  const { login, changePassword, isLoading, error, clearError, isAuthenticated, user } = useStationAdminAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ username?: string; password?: string; newPassword?: string; confirmPassword?: string }>({});
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  // Redirect if already authenticated - use role-based redirect
  // Only redirect if we have a user (don't check localStorage)
  useEffect(() => {
    // Check if user is authenticated via cookies (not localStorage)
    // Only redirect if we have actual authenticated state from the store
    if (isAuthenticated && user) {
      const dashboardPath = resolveDashboardPath(user.role);
      router.replace(dashboardPath);
    }
  }, [isAuthenticated, user, router]);

  const validateForm = () => {
    const errors: { username?: string; password?: string } = {};
    
    if (!username.trim()) {
      errors.username = "Username is required";
    }
    
    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordChange = () => {
    const errors: { newPassword?: string; confirmPassword?: string } = {};
    
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
    
    setFormErrors({ ...formErrors, ...errors });
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await login({ username: username.trim(), password });
      
      // Check if password reset is required
      if (result && 'requiresPasswordReset' in result && result.requiresPasswordReset) {
        setMustChangePassword(true);
        setCurrentPassword(password); // Store current password (temp password) for password change
        
        // Store adminId from login response if available
        if ('adminId' in result && result.adminId) {
          setAdminId(result.adminId);
        }
        
        toast("Please create a new password", {
          icon: "ℹ️",
          duration: 4000,
        });
        return;
      }

      // Normal login success - redirect based on role
      // Station admin role is "Admin", so redirect to admin dashboard
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        router.replace("/dashboard/admin");
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      toast.error(errorMessage);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validatePasswordChange()) {
      return;
    }

    try {
      // Get adminId from state (set during login) or fetch it
      let finalAdminId = adminId;
      
      if (!finalAdminId) {
        // Fetch admin data by username to get the adminId
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        const adminResponse = await fetch(
          `${API_BASE_URL}/station-admin?username=${encodeURIComponent(username)}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!adminResponse.ok) {
          throw new Error("Failed to fetch admin data");
        }

        const adminDataResponse = await adminResponse.json();
        finalAdminId = adminDataResponse.data?.[0]?._id || adminDataResponse.data?.[0]?.id || adminDataResponse._id || adminDataResponse.id;

        if (!finalAdminId) {
          throw new Error("Admin ID not found");
        }
      }

      // Call change password with adminId
      // oldPassword can be null if using temp password (backend will check tempPassword)
      await changePassword(finalAdminId, currentPassword || null, newPassword);
      
      // Get user data after password change to determine redirect path
      const updatedUser = useStationAdminAuthStore.getState().user;
      const dashboardPath = updatedUser ? resolveDashboardPath(updatedUser.role) : "/dashboard/admin";
      
      toast.success("Password changed successfully! Redirecting...");
      setTimeout(() => {
        router.replace(dashboardPath);
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 dark:from-gray-950 dark:via-red-900/20 dark:to-orange-900/20 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Station Admin Login</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to manage your fire station
          </p>
        </div>

        {!mustChangePassword ? (
          <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setFormErrors({ ...formErrors, username: undefined });
                }}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                  formErrors.username || error
                    ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-gray-700 focus:border-red-400 focus:bg-red-50/30 dark:focus:bg-red-900/10"
                }`}
                placeholder="Enter your username"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            {formErrors.username && (
              <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {formErrors.username}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormErrors({ ...formErrors, password: undefined });
                }}
                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                  formErrors.password || error
                    ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-gray-700 focus:border-red-400 focus:bg-red-50/30 dark:focus:bg-red-900/10"
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
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
            {formErrors.password && (
              <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {formErrors.password}
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-5">
            {/* Username Display (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={username}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Key className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-800 dark:text-yellow-300 font-semibold mb-1">Password Change Required</p>
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                    You are using a temporary password. Please create a new password to continue.
                  </p>
                </div>
              </div>
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
        )}

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default StationAdminLoginPage;

