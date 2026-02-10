'use client';

import React, { useMemo, useEffect } from 'react';
import { useFirePersonnelAuthStore } from '@/lib/stores/firePersonnelAuth';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import OutlookPage, { LocationData, OutlookPageConfig } from '@/components/pages/OutlookPage';

const StationOutlookPage: React.FC = () => {
  const { user } = useFirePersonnelAuthStore();
  const stations = useStationsStore(selectStations);
  const fetchStations = useStationsStore((state) => state.fetchStations);
  const isLoadingStations = useStationsStore((state) => state.isLoading);

  const stationId = user?.stationId;

  useEffect(() => {
    fetchStations().catch((err) => {
      console.error('Failed to fetch stations:', err);
    });
  }, [fetchStations]);

  const currentStation = useMemo(() => {
    if (!stationId) return null;
    return stations.find(s => {
      const sId = typeof s._id === 'string' ? s._id : s.id;
      return sId === stationId || s.id === stationId;
    });
  }, [stations, stationId]);

  // Generate dummy data based on station coordinates
  const generateJurisdictionPlaces = (): LocationData[] => {
    if (!currentStation?.lat || !currentStation?.lng) {
      return [
        {
          id: '1',
          name: 'Central Business District',
          address: 'Makola Road, Accra',
          coordinates: '5.5500°N, 0.2000°W',
          lat: 5.5500,
          lng: -0.2000,
          type: 'Commercial',
          distance: '0.5 km',
          notes: 'Main commercial area',
        },
        {
          id: '2',
          name: 'Residential Complex',
          address: 'Kumasi Road, Accra',
          coordinates: '5.5550°N, 0.2050°W',
          lat: 5.5550,
          lng: -0.2050,
          type: 'Residential',
          distance: '1.2 km',
          notes: 'High-density residential area',
        },
        {
          id: '3',
          name: 'Industrial Zone',
          address: 'Kaneshie Road, Accra',
          coordinates: '5.5700°N, 0.2150°W',
          lat: 5.5700,
          lng: -0.2150,
          type: 'Industrial',
          distance: '2.5 km',
          notes: 'Manufacturing and warehouses',
        },
        {
          id: '4',
          name: 'University Campus',
          address: 'Legon, Accra',
          coordinates: '5.6500°N, -0.1867°W',
          lat: 5.6500,
          lng: -0.1867,
          type: 'Educational',
          distance: '3.8 km',
          notes: 'University of Ghana',
        },
        {
          id: '5',
          name: 'Public Square',
          address: 'Independence Square, Accra',
          coordinates: '5.5450°N, 0.1950°W',
          lat: 5.5450,
          lng: -0.1950,
          type: 'Public',
          distance: '0.8 km',
          notes: 'Large public events venue',
        },
      ];
    }
    
    const baseLat = currentStation.lat;
    const baseLng = currentStation.lng;
    
    return [
      {
        id: '1',
        name: 'Commercial District',
        address: 'Near Station',
        coordinates: `${(baseLat + 0.001).toFixed(4)}°N, ${(baseLng + 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.001,
        lng: baseLng + 0.001,
        type: 'Commercial',
        distance: '0.5 km',
        notes: 'Main commercial area',
      },
      {
        id: '2',
        name: 'Residential Area',
        address: 'Near Station',
        coordinates: `${(baseLat + 0.002).toFixed(4)}°N, ${(baseLng - 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.002,
        lng: baseLng - 0.001,
        type: 'Residential',
        distance: '1.2 km',
        notes: 'Residential community',
      },
      {
        id: '3',
        name: 'Industrial Zone',
        address: 'Near Station',
        coordinates: `${(baseLat - 0.003).toFixed(4)}°N, ${(baseLng + 0.002).toFixed(4)}°W`,
        lat: baseLat - 0.003,
        lng: baseLng + 0.002,
        type: 'Industrial',
        distance: '2.5 km',
        notes: 'Industrial facilities',
      },
    ];
  };

  const generatePlacesOfImportance = (): LocationData[] => {
    if (!currentStation?.lat || !currentStation?.lng) {
      return [
        {
          id: '1',
          name: 'Korle Bu Teaching Hospital',
          location: 'Korle Bu, Accra',
          coordinates: '5.5400°N, 0.1900°W',
          lat: 5.5400,
          lng: -0.1900,
          type: 'Hospital',
          description: 'Major teaching hospital',
          distance: '1.5 km',
          contact: '+233302665401',
        },
        {
          id: '2',
          name: 'University of Ghana',
          location: 'Legon, Accra',
          coordinates: '5.6500°N, -0.1867°W',
          lat: 5.6500,
          lng: -0.1867,
          type: 'School',
          description: 'Premier university',
          distance: '3.8 km',
          contact: '+233302213650',
        },
        {
          id: '3',
          name: 'Independence Square',
          location: '28th February Road, Accra',
          coordinates: '5.5450°N, 0.1950°W',
          lat: 5.5450,
          lng: -0.1950,
          type: 'Monument',
          description: 'National monument',
          distance: '0.8 km',
        },
        {
          id: '4',
          name: 'Makola Market',
          location: 'Makola Road, Accra',
          coordinates: '5.5500°N, 0.2000°W',
          lat: 5.5500,
          lng: -0.2000,
          type: 'Market',
          description: 'Major market hub',
          distance: '0.5 km',
        },
      ];
    }
    
    const baseLat = currentStation.lat;
    const baseLng = currentStation.lng;
    
    return [
      {
        id: '1',
        name: 'Regional Hospital',
        location: 'Near Station',
        coordinates: `${(baseLat + 0.002).toFixed(4)}°N, ${(baseLng + 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.002,
        lng: baseLng + 0.001,
        type: 'Hospital',
        description: 'Major hospital facility',
        distance: '1.2 km',
        contact: '+233302123456',
      },
      {
        id: '2',
        name: 'Central School',
        location: 'Near Station',
        coordinates: `${(baseLat - 0.001).toFixed(4)}°N, ${(baseLng + 0.002).toFixed(4)}°W`,
        lat: baseLat - 0.001,
        lng: baseLng + 0.002,
        type: 'School',
        description: 'Primary and secondary school',
        distance: '0.8 km',
        contact: '+233302123457',
      },
    ];
  };

  const generateSisterServices = (): LocationData[] => {
    if (!currentStation?.lat || !currentStation?.lng) {
      return [
        {
          id: '1',
          name: 'Accra Central Police Station',
          type: 'Police Station',
          location: 'Central Business District, Accra',
          coordinates: '5.5500°N, 0.2000°W',
          lat: 5.5500,
          lng: -0.2000,
          distance: '0.3 km',
          phone: '+233302123456',
        },
        {
          id: '2',
          name: '37 Military Hospital',
          type: 'Hospital',
          location: '37, Accra',
          coordinates: '5.6000°N, -0.1800°W',
          lat: 5.6000,
          lng: -0.1800,
          distance: '4.2 km',
          phone: '+233302665401',
        },
        {
          id: '3',
          name: 'Accra City Fire Station',
          type: 'Fire Station',
          location: 'Kojo Thompson Road, Accra',
          coordinates: '5.5550°N, 0.2050°W',
          lat: 5.5550,
          lng: -0.2050,
          distance: '1.5 km',
          phone: '+233302123458',
        },
        {
          id: '4',
          name: 'National Ambulance Service',
          type: 'Ambulance Service',
          location: 'Accra',
          coordinates: '5.5450°N, 0.1950°W',
          lat: 5.5450,
          lng: -0.1950,
          distance: '0.8 km',
          phone: '+233302123459',
        },
      ];
    }
    
    const baseLat = currentStation.lat;
    const baseLng = currentStation.lng;
    
    return [
      {
        id: '1',
        name: 'Nearby Police Station',
        type: 'Police Station',
        location: 'Near Station',
        coordinates: `${(baseLat + 0.001).toFixed(4)}°N, ${(baseLng + 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.001,
        lng: baseLng + 0.001,
        distance: '0.5 km',
        phone: '+233302123456',
      },
      {
        id: '2',
        name: 'Regional Hospital',
        type: 'Hospital',
        location: 'Near Station',
        coordinates: `${(baseLat + 0.003).toFixed(4)}°N, ${(baseLng - 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.003,
        lng: baseLng - 0.001,
        distance: '1.8 km',
        phone: '+233302123457',
      },
    ];
  };

  const generateHydrantLocations = (): LocationData[] => {
    if (!currentStation?.lat || !currentStation?.lng) {
      return [
        {
          id: '1',
          name: 'FH-ACC-001',
          number: 'FH-ACC-001',
          location: 'Makola Road, Accra Central Market',
          coordinates: '5.5500°N, 0.2000°W',
          lat: 5.5500,
          lng: -0.2000,
          type: 'Above Ground',
          status: 'Operational',
          waterPressure: '65 PSI',
          distance: '0.5 km',
          lastInspection: '2024-01-15',
          nextInspection: '2024-04-15',
        },
        {
          id: '2',
          name: 'FH-ACC-002',
          number: 'FH-ACC-002',
          location: 'Kumasi Road, Near Residential Complex',
          coordinates: '5.5550°N, 0.2050°W',
          lat: 5.5550,
          lng: -0.2050,
          type: 'Underground',
          status: 'Operational',
          waterPressure: '70 PSI',
          distance: '1.2 km',
          lastInspection: '2024-01-20',
          nextInspection: '2024-04-20',
        },
        {
          id: '3',
          name: 'FH-ACC-003',
          number: 'FH-ACC-003',
          location: 'Independence Square, North Side',
          coordinates: '5.5450°N, 0.1950°W',
          lat: 5.5450,
          lng: -0.1950,
          type: 'Wall Mounted',
          status: 'Operational',
          waterPressure: '60 PSI',
          distance: '0.8 km',
          lastInspection: '2024-01-10',
          nextInspection: '2024-04-10',
        },
        {
          id: '4',
          name: 'FH-ACC-004',
          number: 'FH-ACC-004',
          location: 'Barnes Road, Accra Technical University',
          coordinates: '5.5600°N, 0.2100°W',
          lat: 5.5600,
          lng: -0.2100,
          type: 'Above Ground',
          status: 'Under Maintenance',
          waterPressure: '55 PSI',
          distance: '2.1 km',
          lastInspection: '2024-01-08',
          nextInspection: '2024-04-08',
        },
      ];
    }
    
    const baseLat = currentStation.lat;
    const baseLng = currentStation.lng;
    
    return [
      {
        id: '1',
        name: 'FH-001',
        number: 'FH-001',
        location: 'Near Station - Main Road',
        coordinates: `${(baseLat + 0.001).toFixed(4)}°N, ${(baseLng + 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.001,
        lng: baseLng + 0.001,
        type: 'Above Ground',
        status: 'Operational',
        waterPressure: '65 PSI',
        distance: '0.3 km',
        lastInspection: '2024-01-15',
        nextInspection: '2024-04-15',
      },
      {
        id: '2',
        name: 'FH-002',
        number: 'FH-002',
        location: 'Near Station - Residential Area',
        coordinates: `${(baseLat + 0.002).toFixed(4)}°N, ${(baseLng - 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.002,
        lng: baseLng - 0.001,
        type: 'Underground',
        status: 'Operational',
        waterPressure: '70 PSI',
        distance: '0.8 km',
        lastInspection: '2024-01-20',
        nextInspection: '2024-04-20',
      },
    ];
  };

  const config: OutlookPageConfig = {
    mode: 'unit',
    showServicesTab: true,
    enableAddEdit: true,
    useLocalStorage: true,
    storageKey: stationId ? `station-outlook-${stationId}` : 'station-outlook',
    title: 'Station Outlook',
    description: 'Manage jurisdiction places, places of importance, sister services, and fire hydrant locations',
    initialLocations: generateJurisdictionPlaces(),
    initialLandmarks: generatePlacesOfImportance(),
    initialServices: generateSisterServices(),
    initialHydrants: generateHydrantLocations(),
  };

  if (isLoadingStations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading station data...</p>
      </div>
      </div>
    );
  }

  return <OutlookPage config={config} />;
};

export default StationOutlookPage;
