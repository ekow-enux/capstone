/**
 * Example usage of StationAdminForm component
 * 
 * This file demonstrates how to use the StationAdminForm component
 * for both creating and editing Station Admin users.
 */

'use client';

import React, { useState } from 'react';
import StationAdminForm from './StationAdminForm';
import { StationAdminFormData, StationAdmin } from '@/lib/types/stationAdmin';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

// Example: Create Station Admin
export const CreateStationAdminExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: StationAdminFormData) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // await createStationAdmin(data);
      console.log('Creating station admin:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Station Admin created successfully!');
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create station admin');
      throw error; // Re-throw to prevent form reset
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold transition-all duration-200"
      >
        Add Station Admin
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-gray-900">Create Station Admin</h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <StationAdminForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

// Example: Edit Station Admin
export const EditStationAdminExample: React.FC<{ stationAdmin: StationAdmin }> = ({ stationAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: StationAdminFormData) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // await updateStationAdmin(stationAdmin.id, data);
      console.log('Updating station admin:', stationAdmin.id, data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Station Admin updated successfully!');
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update station admin');
      throw error; // Re-throw to prevent form reset
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-gray-900">Edit Station Admin</h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <StationAdminForm
            initialData={stationAdmin}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

