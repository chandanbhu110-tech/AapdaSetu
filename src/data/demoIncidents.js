/**
 * SIH NER Smart Logistics Platform - Demo Road & Terrain Incidents
 * Clearly marked: DEMO INCIDENT
 */

export const DEMO_INCIDENTS = [
  {
    id: 'INC-001',
    type: 'Critical Bridge Damage',
    severity: 'Critical',
    latitude: 24.8010,
    longitude: 93.1250,
    description: 'DEMO INCIDENT: Critical bridge damage near Jiribam due to flash floods. Single-lane movement restricted for heavy transport.',
    affected_route: 'R001',
    location_name: 'Jiribam Bridge Sector (NH37/NH2 Connector)',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'Active',
    reported_by: 'State PWD Road Division',
    is_demo: true,
    estimated_clearance_hours: 18.0
  },
  {
    id: 'INC-002',
    type: 'High-Risk Landslide',
    severity: 'High',
    latitude: 25.1200,
    longitude: 92.3800,
    description: 'DEMO INCIDENT: High-risk landslide near Sonapur tunnel corridor on NH6. Heavy mudflow and rock debris blocking uphill lane.',
    affected_route: 'R002',
    location_name: 'Sonapur Tunnel Approach, NH6',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'Active',
    reported_by: 'BRO / Highway Patrol',
    is_demo: true,
    estimated_clearance_hours: 6.5
  },
  {
    id: 'INC-003',
    type: 'Flood & Road Damage',
    severity: 'High',
    latitude: 26.9800,
    longitude: 88.5100,
    description: 'DEMO INCIDENT: Flood/road damage near Teesta corridor on NH10. River water overtopping lower retaining walls; heavy trucks diverted.',
    affected_route: 'R003',
    location_name: 'Teesta River Basin / NH10',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: 'Active',
    reported_by: 'District Disaster Management',
    is_demo: true,
    estimated_clearance_hours: 12.0
  }
];
