'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  Mail, 
  Lock, 
  Building2, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  CheckCircle,
  X,
  Key,
  RefreshCw
} from 'lucide-react';
import { 
  StationAdminFormData, 
  StationAdmin,
  createStationAdminSchema,
  editStationAdminSchema 
} from '@/lib/types/stationAdmin';
import { 
  useStationsStore, 
  selectStations, 
  selectStationsIsLoading, 
  selectStationsError 
} from '@/lib/stores/stations';
import toast from 'react-hot-toast';

interface StationAdminFormProps {
  initialData?: StationAdmin | null;
  onSubmit: (data: StationAdminFormData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const StationAdminForm: React.FC<StationAdminFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditMode = !!initialData;
  const [showPassword, setShowPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const stations = useStationsStore(selectStations);
  const stationsLoading = useStationsStore(selectStationsIsLoading);
  const stationsError = useStationsStore(selectStationsError);
  const fetchStations = useStationsStore((state) => state.fetchStations);
  const clearStationsError = useStationsStore((state) => state.clearError);

  // Fetch stations from backend when form opens
  useEffect(() => {
    fetchStations().catch((err) => {
      console.error('Failed to fetch stations:', err);
      // Error will be shown via toast in the store
    });
  }, [fetchStations]);

  // Show error toast if stations fail to load
  useEffect(() => {
    if (stationsError) {
      toast.error(stationsError);
      clearStationsError();
    }
  }, [stationsError, clearStationsError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<StationAdminFormData>({
    resolver: zodResolver(
      isEditMode ? editStationAdminSchema : createStationAdminSchema
    ) as any,
    defaultValues: {
      username: initialData?.username || '',
      password: '',
      email: initialData?.email || '',
      name: initialData?.name || '',
      station: initialData?.stationId || initialData?.station || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  // Watch password field to conditionally validate
  const passwordValue = watch('password');

  // Generate temporary password function
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(password);
    setValue('password', password, { shouldValidate: true });
  };

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        username: initialData.username || '',
        password: '',
        email: initialData.email || '',
        name: initialData.name || '',
        station: initialData.stationId || initialData.station || '',
        isActive: initialData.isActive ?? true,
      });
      setTempPassword('');
    } else {
      // Generate temp password on create mode
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setTempPassword(password);
      setValue('password', password, { shouldValidate: true });
    }
  }, [initialData, reset, setValue]);

  // Sync tempPassword with form password field when tempPassword changes
  useEffect(() => {
    if (!isEditMode && tempPassword) {
      setValue('password', tempPassword, { shouldValidate: true });
    }
  }, [tempPassword, isEditMode, setValue]);

  const onFormSubmit = async (data: StationAdminFormData) => {
    try {
      // If editing and password is empty, remove it from submission
      const submitData = { ...data };
      if (isEditMode && !submitData.password) {
        delete submitData.password;
      }
      
      await onSubmit(submitData);
      
      // Reset form after successful submission (parent handles success toast)
      if (!isEditMode) {
        reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Parent component handles error toast, just re-throw
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit as (data: StationAdminFormData) => void)} className="space-y-6" noValidate>
      {/* Username Field */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-bold text-gray-900 mb-2.5"
        >
          Username <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            id="username"
            type="text"
            autoComplete="username"
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
              errors.username
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
            }`}
            placeholder="e.g., admin_station1"
            {...register('username')}
            disabled={isLoading}
          />
        </div>
        {errors.username && (
          <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {errors.username.message}
          </p>
        )}
        {!errors.username && (
          <p className="text-gray-500 text-xs mt-1.5">
            Username must be unique and contain only letters, numbers, and underscores
          </p>
        )}
      </div>

      {/* Password Field */}
      {!isEditMode ? (
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-bold text-gray-900 mb-2.5"
          >
            Temporary Password <span className="text-red-600">*</span>
          </label>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-bold text-green-900">Temporary Password</h3>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                    errors.password
                      ? 'border-red-400 bg-red-50'
                      : 'border-green-300 focus:border-green-400 focus:bg-white'
                  }`}
                  placeholder="Type or auto-generate password"
                  value={tempPassword || watch('password') || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTempPassword(value);
                    setValue('password', value, { shouldValidate: true });
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={generateTempPassword}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 font-semibold flex items-center gap-2 whitespace-nowrap"
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4" />
                Generate
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.password.message}
              </p>
            )}
            {!errors.password && (
              <p className="text-green-700 text-xs mt-2">
                A temporary password will be generated automatically. You can customize it or use the generated one.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-bold text-gray-900 mb-2.5"
          >
            Password <span className="text-gray-500 text-xs font-normal">(Optional - leave blank to keep current)</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                errors.password
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
              }`}
              placeholder="Leave blank to keep current password"
              {...register('password')}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errors.password.message}
            </p>
          )}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-bold text-gray-900 mb-2.5"
        >
          Email <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
              errors.email
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
            }`}
            placeholder="e.g., admin@station1.gnfs.gov.gh"
            {...register('email')}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {errors.email.message}
          </p>
        )}
        {!errors.email && (
          <p className="text-gray-500 text-xs mt-1.5">
            Email must be unique
          </p>
        )}
      </div>

      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-gray-700 mb-2.5"
        >
          Name <span className="text-gray-500 text-xs font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
              errors.name
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 focus:border-blue-400 focus:bg-blue-50/30'
            }`}
            placeholder="e.g., John Doe"
            {...register('name')}
            disabled={isLoading}
          />
        </div>
        {errors.name && (
          <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Station Field */}
      <div>
        <label
          htmlFor="station"
          className="block text-sm font-bold text-gray-900 mb-2.5"
        >
          Station <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none z-10" />
          <select
            id="station"
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 appearance-none bg-white ${
              errors.station
                ? 'border-red-400 bg-red-50'
                : stationsLoading
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
            }`}
            {...register('station')}
            disabled={isLoading || stationsLoading}
          >
            <option value="">
              {stationsLoading ? 'Loading stations...' : 'Select a station'}
            </option>
            {stationsLoading ? (
              <option value="" disabled>Loading stations from backend...</option>
            ) : stations.length === 0 ? (
              <option value="" disabled>No stations available</option>
            ) : (
              stations.map((station) => (
                <option key={station.id || station._id} value={station.id || station._id}>
                  {station.name || 'Unnamed Station'}
                </option>
              ))
            )}
          </select>
        </div>
        {errors.station && (
          <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {errors.station.message}
          </p>
        )}
        {!errors.station && stationsLoading && (
          <p className="text-blue-600 text-xs mt-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Loading stations from backend...
          </p>
        )}
        {!errors.station && !stationsLoading && stations.length === 0 && (
          <p className="text-yellow-600 text-xs mt-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            No stations available. Please add stations first.
          </p>
        )}
      </div>

      {/* isActive Field - Only visible when editing */}
      {isEditMode && (
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                {...register('isActive')}
                disabled={isLoading}
              />
              <div
                className={`w-14 h-8 rounded-full transition-colors duration-200 ${
                  watch('isActive')
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    watch('isActive') ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {watch('isActive') ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm font-semibold text-gray-900">
                {watch('isActive') ? 'Active' : 'Inactive'}
              </span>
            </div>
          </label>
          <p className="text-gray-500 text-xs mt-1.5 ml-20">
            Toggle to activate or deactivate this station admin account
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            isEditMode ? 'Update Station Admin' : 'Create Station Admin'
          )}
        </button>
      </div>
    </form>
  );
};

export default StationAdminForm;

