import React, { useState } from 'react';
import { Map as MapIcon, Layers, Filter, Eye, EyeOff, Radio } from 'lucide-react';
import NERMap from '../components/Map/NERMap';

export default function LiveMap({
  routes = [],
  incidents = [],
  vehicles = [],
  fieldReports = [],
  onSelectRoute,
  onNavigate
}) {
  const [showRoutes, setShowRoutes] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showFieldReports, setShowFieldReports] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Layer Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            NER Strategic Geospatial Map
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            OpenStreetMap GIS visualization of North Eastern highway corridors, DEMO hazards, and live vehicle telemetry.
          </p>
        </div>

        {/* Layer Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`btn btn-sm ${showRoutes ? 'btn-primary' : 'btn-outline'}`}
          >
            {showRoutes ? <Eye size={12} /> : <EyeOff size={12} />}
            Routes ({routes.length})
          </button>
          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`btn btn-sm ${showIncidents ? 'btn-primary' : 'btn-outline'}`}
          >
            {showIncidents ? <Eye size={12} /> : <EyeOff size={12} />}
            Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setShowVehicles(!showVehicles)}
            className={`btn btn-sm ${showVehicles ? 'btn-primary' : 'btn-outline'}`}
          >
            {showVehicles ? <Eye size={12} /> : <EyeOff size={12} />}
            Vehicles ({vehicles.length})
          </button>
          <button
            onClick={() => setShowFieldReports(!showFieldReports)}
            className={`btn btn-sm ${showFieldReports ? 'btn-primary' : 'btn-outline'}`}
          >
            {showFieldReports ? <Eye size={12} /> : <EyeOff size={12} />}
            Field Reports ({fieldReports.length})
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="card" style={{ padding: '0.75rem' }}>
        <NERMap
          routes={showRoutes ? routes : []}
          incidents={showIncidents ? incidents : []}
          vehicles={showVehicles ? vehicles : []}
          fieldReports={showFieldReports ? fieldReports : []}
          onSelectRoute={(id) => {
            if (onSelectRoute) onSelectRoute(id);
            if (onNavigate) onNavigate('route-intel');
          }}
          height="620px"
          showControls={true}
        />
      </div>
    </div>
  );
}
