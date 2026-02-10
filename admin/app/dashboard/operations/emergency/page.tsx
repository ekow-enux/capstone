'use client';

import React from 'react';
import { Phone } from 'lucide-react';

// This page redirects to the main emergency response page
// In production, this would show emergency responses filtered by department
const OperationsEmergencyPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="bg-white border-2 border-gray-200 p-8 rounded-xl">
        <div className="text-center py-12">
          <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Response</h2>
          <p className="text-gray-600">
            Emergency response is accessible through the main emergency page.
            In production, this will show emergency responses filtered by your department.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperationsEmergencyPage;

