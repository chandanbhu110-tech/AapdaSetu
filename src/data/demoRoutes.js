/**
 * SIH NER Smart Logistics Platform - Demo Route Definitions
 * Contains primary NER highway corridors, baseline health scores,
 * and high-accuracy regional highway coordinate paths.
 */

export const DEMO_ROUTES = [
  {
    id: 'R001',
    name: 'Guwahati – Imphal Corridor (NH27 / NH29 / NH2)',
    origin: 'Guwahati',
    originCoords: [26.1445, 91.7362],
    destination: 'Imphal',
    destinationCoords: [24.8170, 93.9368],
    distance_km: 360,
    baseline_health_score: 25,
    risk_level: 'Critical',
    road_condition: 'Severely Degraded (Bridge closure & landslide debris)',
    accessibility: 'Restricted / Single-lane convoy only',
    critical_chokepoints: ['Jiribam Bridge Sector', 'Kohima-Mao Ridge'],
    color: '#ef4444', // Red for Critical
    description: 'Vital medical & supplies lifeline connecting Brahmaputra Valley to Manipur through steep hill passes.',
    // Fallback geometry if OSRM is slow or offline
    coordinates: [
      [26.1445, 91.7362], // Guwahati
      [26.1833, 91.9500], // Jagiroad
      [26.3452, 92.6841], // Nagaon
      [26.0667, 93.2000], // Doboka
      [25.9000, 93.7200], // Diphu
      [25.9100, 93.7300], // Dimapur
      [25.6751, 94.1086], // Kohima
      [25.5000, 94.1300], // Mao
      [25.1000, 93.9500], // Kangpokpi
      [24.8010, 93.1250], // Jiribam Chokepoint
      [24.8170, 93.9368]  // Imphal
    ]
  },
  {
    id: 'R002',
    name: 'Shillong – Silchar Corridor (NH6)',
    origin: 'Shillong',
    originCoords: [25.5788, 91.8933],
    destination: 'Silchar',
    destinationCoords: [24.8333, 92.7789],
    distance_km: 220,
    baseline_health_score: 35,
    risk_level: 'Risky',
    road_condition: 'Unstable (Active landslide zone at Sonapur)',
    accessibility: 'Slow Moving / Intermittent closures',
    critical_chokepoints: ['Sonapur Tunnel Cut', 'Ratacherra Pass'],
    color: '#f97316', // Orange for Risky
    description: 'Crucial southern Meghalaya arterial link into Barak Valley.',
    coordinates: [
      [25.5788, 91.8933], // Shillong
      [25.4500, 92.2000], // Jowai
      [25.1500, 92.3500], // Lad Rymbai
      [25.1200, 92.3800], // Sonapur Tunnel (Landslide zone)
      [24.9500, 92.5500], // Badarpur
      [24.8333, 92.7789]  // Silchar
    ]
  },
  {
    id: 'R003',
    name: 'Siliguri – Gangtok Corridor (NH10)',
    origin: 'Siliguri',
    originCoords: [26.7271, 88.3953],
    destination: 'Gangtok',
    destinationCoords: [27.3389, 88.6065],
    distance_km: 115,
    baseline_health_score: 40,
    risk_level: 'Risky',
    road_condition: 'Vulnerable (Teesta river inundation & slope slippage)',
    accessibility: 'Light vehicles only / Heavy trucks diverted',
    critical_chokepoints: ['Teesta Bazaar Corridor', '29th Mile'],
    color: '#f97316', // Orange for Risky
    description: 'Sole national highway access corridor connecting Sikkim to mainland India.',
    coordinates: [
      [26.7271, 88.3953], // Siliguri
      [26.8800, 88.4700], // Sevoke Coronation Bridge
      [26.9800, 88.5100], // Teesta Corridor
      [27.0500, 88.5300], // Kalijhora
      [27.1700, 88.5100], // Rangpo
      [27.2300, 88.5400], // Singtam
      [27.3389, 88.6065]  // Gangtok
    ]
  }
];

// Alternate Route Recommendation profile for Guwahati -> Imphal
export const DEMO_ALTERNATE_ROUTES = {
  R001: {
    id: 'R001-ALT',
    name: 'Southern Bypass via Lumding & Silchar (NH27 / NH37 Bypass)',
    origin: 'Guwahati',
    destination: 'Imphal',
    distance_km: 410,
    eta_hours: 9.5,
    health_score: 78,
    risk_level: 'Safe',
    color: '#22c55e', // Green for Safe
    description: 'Bypasses the damaged Jiribam bridge bottleneck and unstable Kohima slopes. Slightly longer (+50 km) but continuous all-weather traffic flow.',
    recommendationReason: '40% Route Health (78/100) + 30% AI Disruption Risk (Low: 21.7%) makes this 3.2x more reliable for critical medicine transport.',
    coordinates: [
      [26.1445, 91.7362], // Guwahati
      [26.3452, 92.6841], // Nagaon
      [25.7500, 93.1800], // Lumding
      [25.1700, 93.0200], // Haflong
      [24.8333, 92.7789], // Silchar Valley
      [24.7500, 93.3000], // Nungba High Road
      [24.8170, 93.9368]  // Imphal
    ]
  }
};
