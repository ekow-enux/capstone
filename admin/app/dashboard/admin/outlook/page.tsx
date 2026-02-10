'use client';

import React from 'react';
import OutlookPage, { LocationData, OutlookPageConfig } from '@/components/pages/OutlookPage';

// Mock data - Locations
const locations: LocationData[] = [
  {
    id: '1',
    name: 'Accra Central Market',
    address: 'Makola Road, Accra',
    coordinates: '5.5500°N, 0.2000°W',
    type: 'Commercial',
    accessibility: 'Easy',
    notes: 'Main market area, high foot traffic'
  },
  {
    id: '2',
    name: 'Kumasi Road Residential Complex',
    address: 'Kumasi Road, Accra',
    coordinates: '5.5550°N, 0.2050°W',
    type: 'Residential',
    accessibility: 'Moderate',
    notes: 'Multi-story residential buildings'
  },
  {
    id: '3',
    name: 'Independence Square',
    address: '28th February Road, Accra',
    coordinates: '5.5450°N, 0.1950°W',
    type: 'Public',
    accessibility: 'Easy',
    notes: 'Large public square, events venue'
  },
  {
    id: '4',
    name: 'Accra Technical University',
    address: 'Barnes Road, Accra',
    coordinates: '5.5600°N, 0.2100°W',
    type: 'Educational',
    accessibility: 'Easy',
    notes: 'University campus with multiple buildings'
  },
  {
    id: '5',
    name: 'Kaneshie Industrial Estate',
    address: 'Kaneshie Road, Accra',
    coordinates: '5.5700°N, 0.2150°W',
    type: 'Industrial',
    accessibility: 'Moderate',
    notes: 'Warehouses and manufacturing facilities'
  },
];

// Mock data - Landmarks
const landmarks: LocationData[] = [
  {
    id: '1',
    name: 'Independence Arch',
    location: 'Independence Square, Accra',
    coordinates: '5.5450°N, 0.1950°W',
    type: 'Monument',
    description: 'National monument and symbol of Ghana\'s independence',
    proximityToStation: '2.5 km'
  },
  {
    id: '2',
    name: 'Korle Lagoon',
    location: 'Korle Gonno, Accra',
    coordinates: '5.5350°N, 0.1900°W',
    type: 'Water Body',
    description: 'Large lagoon, important environmental feature',
    proximityToStation: '3.8 km'
  },
  {
    id: '3',
    name: 'Makola Market Tower',
    location: 'Makola Road, Accra',
    coordinates: '5.5500°N, 0.2000°W',
    type: 'Building',
    description: 'Historic market building, landmark structure',
    proximityToStation: '1.2 km'
  },
  {
    id: '4',
    name: 'W.E.B. Du Bois Memorial Centre',
    location: 'Cantonments, Accra',
    coordinates: '5.5800°N, 0.1800°W',
    type: 'Monument',
    description: 'Historic site and memorial center',
    proximityToStation: '5.2 km'
  },
  {
    id: '5',
    name: 'Kokrobite Beach',
    location: 'Kokrobite, Accra',
    coordinates: '5.5200°N, 0.2200°W',
    type: 'Park',
    description: 'Popular beach area with recreational facilities',
    proximityToStation: '12.5 km'
  },
];

// Mock data - Fire Hydrants
const fireHydrants: LocationData[] = [
  {
    id: '1',
    number: 'FH-ACC-001',
    location: 'Makola Road, Accra Central Market',
    coordinates: '5.5500°N, 0.2000°W',
    type: 'Above Ground',
    status: 'Operational',
    waterPressure: '65 PSI',
    lastInspection: '2024-01-15',
    nextInspection: '2024-04-15'
  },
  {
    id: '2',
    number: 'FH-ACC-002',
    location: 'Kumasi Road, Near Residential Complex',
    coordinates: '5.5550°N, 0.2050°W',
    type: 'Underground',
    status: 'Operational',
    waterPressure: '70 PSI',
    lastInspection: '2024-01-20',
    nextInspection: '2024-04-20'
  },
  {
    id: '3',
    number: 'FH-ACC-003',
    location: 'Independence Square, North Side',
    coordinates: '5.5450°N, 0.1950°W',
    type: 'Wall Mounted',
    status: 'Operational',
    waterPressure: '60 PSI',
    lastInspection: '2024-01-10',
    nextInspection: '2024-04-10'
  },
  {
    id: '4',
    number: 'FH-ACC-004',
    location: 'Barnes Road, Accra Technical University',
    coordinates: '5.5600°N, 0.2100°W',
    type: 'Above Ground',
    status: 'Under Maintenance',
    waterPressure: '0 PSI',
    lastInspection: '2024-01-05',
    nextInspection: '2024-02-05'
  },
  {
    id: '5',
    number: 'FH-ACC-005',
    location: 'Kaneshie Road, Industrial Estate',
    coordinates: '5.5700°N, 0.2150°W',
    type: 'Underground',
    status: 'Operational',
    waterPressure: '75 PSI',
    lastInspection: '2024-01-25',
    nextInspection: '2024-04-25'
  },
  {
    id: '6',
    number: 'FH-ACC-006',
    location: '28th February Road, Near Circle',
    coordinates: '5.5480°N, 0.1980°W',
    type: 'Above Ground',
    status: 'Out of Service',
    waterPressure: '0 PSI',
    lastInspection: '2023-12-15',
    nextInspection: '2024-02-15'
  },
];

const StationOverviewPage: React.FC = () => {
  const config: OutlookPageConfig = {
    mode: 'admin',
    showServicesTab: false,
    enableAddEdit: false,
    useLocalStorage: false,
    title: 'Station Outlook',
    description: 'District locations, landmarks, and fire hydrant information',
    initialLocations: locations,
    initialLandmarks: landmarks,
    initialHydrants: fireHydrants,
  };

  return <OutlookPage config={config} />;
};

export default StationOverviewPage;
