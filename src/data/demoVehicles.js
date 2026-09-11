/**
 * SIH NER Smart Logistics Platform - Demo Fleet Data
 * Required vehicle V001 (Critical Medicine Guwahati -> Imphal)
 * Optional vehicle V002 (Food Shillong -> Silchar)
 */

export const DEMO_VEHICLES = [
  {
    id: 'V001',
    vehicle_number: 'AS-01-MD-9012',
    cargo: 'Medicine (Emergency Antibiotics & Vaccines)',
    origin: 'Guwahati',
    destination: 'Imphal',
    route_id: 'R001',
    priority: 'Critical',
    status: 'On Route',
    current_location: 'Approaching Jiribam Sector, NH29/NH37 Junction',
    current_lat: 25.7500,
    current_lng: 93.1800,
    progress_percent: 44.0,
    speed_kmh: 38,
    eta_hours: 5.5,
    gps_mode: 'SIMULATED', // Clearly marked: GPS MODE: SIMULATED
    driver_name: 'B. Bora',
    contact: '+91 98640-XXXXX',
    temp_sensitive: true,
    storage_temp_c: 4.2,
    last_ping: new Date().toLocaleTimeString()
  },
  {
    id: 'V002',
    vehicle_number: 'ML-05-FD-4421',
    cargo: 'Food Grain & Nutritional Aid',
    origin: 'Shillong',
    destination: 'Silchar',
    route_id: 'R002',
    priority: 'High',
    status: 'Delayed',
    current_location: 'Queued near Sonapur Landslide Bypass, NH6',
    current_lat: 25.1200,
    current_lng: 92.3800,
    progress_percent: 62.0,
    speed_kmh: 0,
    eta_hours: 7.2,
    gps_mode: 'SIMULATED',
    driver_name: 'K. Nongrum',
    contact: '+91 94361-XXXXX',
    temp_sensitive: false,
    storage_temp_c: null,
    last_ping: new Date().toLocaleTimeString()
  }
];
