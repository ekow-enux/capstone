'use client';

import React from 'react';
import { Wrench } from 'lucide-react';

// This page redirects to the main equipment tracking page
// In production, this would show equipment filtered by department
const OperationsEquipmentPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="bg-white border-2 border-gray-200 p-8 rounded-xl">
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Equipment Tracking</h2>
          <p className="text-gray-600">
            Equipment tracking is accessible through the main equipment page.
            In production, this will show equipment filtered by your department.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperationsEquipmentPage;

