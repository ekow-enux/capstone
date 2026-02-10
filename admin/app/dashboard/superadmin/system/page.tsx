'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Mail, 
  Database, 
  Server,
  Lock,
  Bell,
  Globe,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const SystemConfigurationPage: React.FC = () => {
  const [settings, setSettings] = useState({
    // Security Settings
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    
    // Email Settings
    smtpHost: 'smtp.gnfs.gov.gh',
    smtpPort: 587,
    smtpUsername: 'noreply@gnfs.gov.gh',
    emailNotifications: true,
    
    // System Settings
    systemName: 'GNFS Admin Portal',
    systemVersion: '2.1.0',
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    
    // Notification Settings
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    alertThreshold: 5
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSaving(false);
    setLastSaved(new Date().toLocaleTimeString());
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      twoFactorAuth: false,
      smtpHost: 'smtp.gnfs.gov.gh',
      smtpPort: 587,
      smtpUsername: 'noreply@gnfs.gov.gh',
      emailNotifications: true,
      systemName: 'GNFS Admin Portal',
      systemVersion: '2.1.0',
      maintenanceMode: false,
      autoBackup: true,
      backupFrequency: 'daily',
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      alertThreshold: 5
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3">
              System Configuration
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Configure system settings, security, and preferences
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <Settings className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">v2.1.0</span>
              <p className="text-gray-500 text-sm">Current Version</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Server className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">Online</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">System Status</h3>
            <p className="text-3xl font-bold text-gray-900">Active</p>
            <p className="text-xs text-gray-500">all services running</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">Secure</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Security</h3>
            <p className="text-3xl font-bold text-gray-900">High</p>
            <p className="text-xs text-gray-500">security level</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Database className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-semibold">85%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Database</h3>
            <p className="text-3xl font-bold text-gray-900">Healthy</p>
            <p className="text-xs text-gray-500">storage usage</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">99.9%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Uptime</h3>
            <p className="text-3xl font-bold text-gray-900">99.9%</p>
            <p className="text-xs text-gray-500">last 30 days</p>
          </div>
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Settings */}
        <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-200 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-red-700" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Security Settings</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password Minimum Length</label>
              <input
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Require Special Characters</label>
              <input
                type="checkbox"
                checked={settings.passwordRequireSpecial}
                onChange={(e) => setSettings({...settings, passwordRequireSpecial: e.target.checked})}
                className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Login Attempts</label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Two-Factor Authentication</label>
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
                className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-200 p-2 rounded-lg">
              <Mail className="w-6 h-6 text-red-700" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Email Settings</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">SMTP Host</label>
              <input
                type="text"
                value={settings.smtpHost}
                onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">SMTP Port</label>
              <input
                type="number"
                value={settings.smtpPort}
                onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">SMTP Username</label>
              <input
                type="text"
                value={settings.smtpUsername}
                onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Email Notifications</label>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-200 p-2 rounded-lg">
              <Server className="w-6 h-6 text-red-700" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">System Settings</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">System Name</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">System Version</label>
              <input
                type="text"
                value={settings.systemVersion}
                onChange={(e) => setSettings({...settings, systemVersion: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Maintenance Mode</label>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Auto Backup</label>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Backup Frequency</label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-200 p-2 rounded-lg">
              <Bell className="w-6 h-6 text-red-700" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Notification Settings</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Email Alerts</label>
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})}
                className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">SMS Alerts</label>
              <input
                type="checkbox"
                checked={settings.smsAlerts}
                onChange={(e) => setSettings({...settings, smsAlerts: e.target.checked})}
                className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Push Notifications</label>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alert Threshold</label>
              <input
                type="number"
                value={settings.alertThreshold}
                onChange={(e) => setSettings({...settings, alertThreshold: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Save Configuration</h3>
            <p className="text-gray-600">
              {lastSaved ? `Last saved at ${lastSaved}` : 'Changes not saved yet'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm"
            >
              <RefreshCw className="w-5 h-5" />
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigurationPage;