'use client';

import React from 'react';
import StationsPage, { StationsPageConfig } from '@/components/pages/StationsPage';

const AdminStationsPage: React.FC = () => {
  const config: StationsPageConfig = {
    viewMode: 'table',
    enableEdit: false,
    enableDelete: false,
    showMetrics: true,
    title: 'Station Management',
    description: 'Manage fire stations across all regions',
  };

  return <StationsPage config={config} />;
};

export default AdminStationsPage;
