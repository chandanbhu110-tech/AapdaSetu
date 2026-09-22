import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Truck, AlertTriangle, Building, FileText, CheckCircle } from 'lucide-react';
import RouteMapLegend from './RouteMapLegend';

// North Eastern Region (NER) Geographic Bounds:
// Covers Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura
// with an operational buffer (from 20.5°N to 30.5°N and 87.0°E to 98.0°E).
const NER_BOUNDS = [
  [20.5, 87.0], // South-West corner (Bengal / Bay of Bengal buffer)
  [30.5, 98.0]  // North-East corner (Upper Arunachal frontier)
];

// NER Regional Center: centered across Assam, Meghalaya, Manipur, and Nagaland corridors
const NER_CENTER = [25.80, 92.80];
const DEFAULT_ZOOM = 7;
const MIN_ZOOM = 6;  // Prevents zooming out to entire continent/world
const MAX_ZOOM = 16; // Detailed road and chokepoint level zoom

// Hub Coordinates
const NER_HUBS = [
  { name: 'Guwahati', coords: [26.1445, 91.7362], state: 'Assam', role: 'Main Inbound Logistics Hub' },
  { name: 'Shillong', coords: [25.5788, 91.8933], state: 'Meghalaya', role: 'Sub-Regional Distribution Base' },
  { name: 'Imphal', coords: [24.8170, 93.9368], state: 'Manipur', role: 'Critical Supply Destination' },
  { name: 'Silchar', coords: [24.8333, 92.7789], state: 'Assam', role: 'Barak Valley Gateway' },
  { name: 'Gangtok', coords: [27.3389, 88.6065], state: 'Sikkim', role: 'Northern Hill Corridor Depot' }
];

// Helper to create clean Leaflet DivIcons
function createDivIcon(htmlContent, className = '', size = [32, 32]) {
  return L.divIcon({
    html: htmlContent,
    className: `custom-leaflet-icon ${className}`,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    popupAnchor: [0, -size[1] / 2]
  });
}

export default function NERMap({
  routes = [],
  incidents = [],
  vehicles = [],
  fieldReports = [],
  alternateRoute = null,
  selectedRouteId = 'R001',
  onSelectRoute = null,
  height = '520px',
  showControls = true
}) {
  // Custom marker icons
  const hubIcon = useMemo(() => createDivIcon(`
    <div style="background: #0284c7; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(2, 132, 199, 0.8);">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
    </div>
  `, 'hub-marker', [26, 26]), []);

  const vehicleIcon = useMemo(() => createDivIcon(`
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <div class="vehicle-marker-pulse" style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(168, 85, 247, 0.45);"></div>
      <div style="background: #9333ea; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; z-index: 2; box-shadow: 0 0 10px rgba(147, 51, 234, 0.9);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
      </div>
    </div>
  `, 'vehicle-marker', [34, 34]), []);

  const incidentIcon = useMemo(() => createDivIcon(`
    <div style="background: #ef4444; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 0 12px rgba(239, 68, 68, 0.85);">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    </div>
  `, 'incident-marker', [28, 28]), []);

  const reportIcon = useMemo(() => createDivIcon(`
    <div style="background: #f59e0b; color: #000; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 0 8px rgba(245, 158, 11, 0.8);">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
    </div>
  `, 'report-marker', [24, 24]), []);

  // Helper for Route Color
  const getRouteColor = (healthScore) => {
    if (healthScore >= 80) return '#22c55e'; // Green Safe
    if (healthScore >= 60) return '#eab308'; // Yellow Moderate
    if (healthScore >= 40) return '#f97316'; // Orange Risky
    return '#ef4444'; // Red Critical
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div className="map-container" style={{ height }}>
        <MapContainer
          center={NER_CENTER}
          zoom={DEFAULT_ZOOM}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          maxBounds={NER_BOUNDS}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Base OpenStreetMap Tile Provider */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 1. Core Strategic NER Hubs */}
          {NER_HUBS.map(hub => (
            <Marker key={hub.name} position={hub.coords} icon={hubIcon}>
              <Popup>
                <div style={{ padding: '4px', maxWidth: '200px' }}>
                  <h4 style={{ color: '#0284c7', marginBottom: '2px', fontSize: '0.9rem', fontWeight: 700 }}>{hub.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>State: {hub.state}</p>
                  <p style={{ fontSize: '0.75rem', color: '#334155' }}>{hub.role}</p>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -14]} opacity={0.9} permanent={false}>
                <span style={{ fontWeight: 600 }}>{hub.name}</span>
              </Tooltip>
            </Marker>
          ))}

          {/* 2. Routes (Color-Coded by Route Health Score) */}
          {routes.map(r => {
            const score = r.dynamic_health_score !== undefined ? r.dynamic_health_score : r.baseline_health_score;
            const color = getRouteColor(score);
            const isSelected = selectedRouteId === r.id;
            const eta = Math.round((r.distance_km / 42) * 10) / 10;

            return (
              <Polyline
                key={r.id}
                positions={r.coordinates}
                pathOptions={{
                  color: color,
                  weight: isSelected ? 6 : 4,
                  opacity: isSelected ? 0.95 : 0.75,
                  dashArray: isSelected ? null : '6, 6'
                }}
                eventHandlers={{
                  click: () => onSelectRoute && onSelectRoute(r.id)
                }}
              >
                <Popup>
                  <div style={{ padding: '6px', minWidth: '220px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#0284c7' }}>{r.id}: {r?.origin || ''} → {r?.destination || ''}</span>
                      <span className={`badge ${
                        score >= 80 ? 'badge-safe' : score >= 60 ? 'badge-moderate' : score >= 40 ? 'badge-risky' : 'badge-critical'
                      }`}>
                        {r.dynamic_risk_tier || r.risk_level}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '4px' }}>
                      <strong>Distance:</strong> {r.distance_km} km | <strong>ETA:</strong> ~{eta} hrs
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '4px' }}>
                      <strong>Route Health Score:</strong> <span style={{ color, fontWeight: 700 }}>{score}/100</span> (Rule-Based)
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '6px' }}>
                      <strong>Active Incidents:</strong> {r.active_incidents ? r.active_incidents.length : 1}
                    </p>
                    <button
                      onClick={() => onSelectRoute && onSelectRoute(r.id)}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      Inspect Route Intelligence
                    </button>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* 2b. Alternate Safe Route (If calculated / active) */}
          {alternateRoute && (
            <Polyline
              positions={alternateRoute.coordinates}
              pathOptions={{
                color: '#10b981',
                weight: 5,
                opacity: 0.9,
                dashArray: '2, 6'
              }}
            >
              <Popup>
                <div style={{ padding: '6px', minWidth: '220px' }}>
                  <span className="badge badge-safe" style={{ marginBottom: '6px' }}>RECOMMENDED SAFER ALTERNATE</span>
                  <h4 style={{ color: '#059669', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 700 }}>{alternateRoute.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '4px' }}>
                    <strong>Distance:</strong> {alternateRoute.distance_km} km | <strong>ETA:</strong> {alternateRoute.eta_hours} hrs
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{alternateRoute.recommendationReason}</p>
                </div>
              </Popup>
            </Polyline>
          )}

          {/* 3. Incidents (Clearly marked DEMO INCIDENT) */}
          {incidents.map(inc => (
            <Marker key={inc.id} position={[inc.latitude, inc.longitude]} icon={incidentIcon}>
              <Popup>
                <div style={{ padding: '6px', maxWidth: '240px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <span className="badge badge-demo-mode">DEMO INCIDENT</span>
                    <span className={`badge ${inc.severity === 'Critical' ? 'badge-critical' : 'badge-risky'}`}>
                      {inc.severity}
                    </span>
                  </div>
                  <h4 style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 700 }}>{inc.type}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '6px' }}>{inc.description}</p>
                  <p style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Status: <strong style={{ color: '#0f172a' }}>{inc.status}</strong> | Route: {inc.affected_route}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 4. Vehicles (Simulated GPS position along corridor) */}
          {vehicles.map(v => (
            <Marker key={v.id} position={[v.current_lat, v.current_lng]} icon={vehicleIcon}>
              <Popup>
                <div style={{ padding: '6px', minWidth: '230px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#7c3aed' }}>{v.id} • {v.vehicle_number}</span>
                    <span className="badge badge-gps-simulated">GPS: SIMULATED</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '2px' }}>
                    <strong>Cargo:</strong> <span style={{ color: '#0284c7' }}>{v.cargo}</span>
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '2px' }}>
                    <strong>Route:</strong> {v?.origin || ''} → {v?.destination || ''}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '2px' }}>
                    <strong>Location:</strong> {v.current_location}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '4px' }}>
                    <strong>Progress:</strong> {v.progress_percent}% | <strong>Speed:</strong> {v.speed_kmh} km/h | <strong>ETA:</strong> {v.eta_hours}h
                  </p>
                  {v.temp_sensitive && (
                    <p style={{ fontSize: '0.75rem', color: '#059669', background: 'rgba(5, 150, 105, 0.1)', padding: '3px 6px', borderRadius: '4px' }}>
                      Cold Chain Monitored: {v.storage_temp_c}°C (Nominal)
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 5. Field Reports */}
          {fieldReports.map(rep => (
            <Marker key={rep.id} position={[rep.latitude, rep.longitude]} icon={reportIcon}>
              <Popup>
                <div style={{ padding: '6px', maxWidth: '220px' }}>
                  <span className="badge badge-moderate" style={{ marginBottom: '4px' }}>FIELD REPORT</span>
                  <h4 style={{ color: '#d97706', fontSize: '0.85rem', fontWeight: 700 }}>{rep.incident_type}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#334155', marginTop: '2px', marginBottom: '4px' }}>
                    {rep.description}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Reporter: {rep.reporter_role} ({rep.status})
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {showControls && (
        <div style={{ marginTop: '0.75rem' }}>
          <RouteMapLegend />
        </div>
      )}
    </div>
  );
}
