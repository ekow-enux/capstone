'use client';

import React from 'react';
import StationsPage, { StationsPageConfig } from '@/components/pages/StationsPage';

const UnitStationsPage: React.FC = () => {
  const config: StationsPageConfig = {
    viewMode: 'grid',
    enableEdit: false,
    enableDelete: false,
    showMetrics: false,
    title: 'Fire Stations',
    description: 'View all fire stations',
  };

  return <StationsPage config={config} />;
};

export default UnitStationsPage;
