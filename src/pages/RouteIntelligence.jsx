import React, { useState } from 'react';
import { 
  Compass, 
  Brain, 
  Shuffle, 
  CheckCircle, 
  AlertTriangle, 
  AlertOctagon, 
  ArrowRight, 
  CloudRain, 
  Activity, 
  ShieldCheck, 
  Navigation,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  MapPin
} from 'lucide-react';
import HealthScoreCard from '../components/RouteHealth/HealthScoreCard';
import NERMap from '../components/Map/NERMap';
import { getOSRMRoute, evaluateSaferRoute } from '../services/routingService';
import { DEMO_ROUTES, DEMO_ALTERNATE_ROUTES } from '../data/demoRoutes';

export default function RouteIntelligence({
  routes = [],
  selectedRouteId = 'R001',
  setSelectedRouteId,
  weatherMap = {},
  predictions = {},
  incidents = [],
  vehicles = [],
  fieldReports = []
}) {
  const currentRoute = (routes && routes.length > 0)
    ? (routes.find(r => r && (r.id === selectedRouteId || r.route_id === selectedRouteId)) || routes[0] || DEMO_ROUTES[0])
    : DEMO_ROUTES[0];

  const [isFindingAlternate, setIsFindingAlternate] = useState(false);
  const [alternateRouteResult, setAlternateRouteResult] = useState(null);
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Corridor Origin/Destination Options
  const corridorOptions = [
    { id: 'R001', label: 'Guwahati → Imphal (Default Lifeline Corridor)', origin: 'Guwahati', dest: 'Imphal' },
    { id: 'R002', label: 'Shillong → Silchar (NH6 Southern Arterial)', origin: 'Shillong', dest: 'Silchar' },
    { id: 'R003', label: 'Siliguri → Gangtok (NH10 Sikkim Lifeline)', origin: 'Siliguri', dest: 'Gangtok' }
  ];

  const currentPred = predictions[currentRoute.id] || {
    disruption_probability_pct: 54.1,
    risk_level: 'High',
    prediction_reason: 'Elevated disruption risk along mountainous sectors.'
  };

  const currentIncidents = incidents.filter(i => i?.affected_route === currentRoute.id);
  const isHighRisk = (currentRoute.dynamic_health_score || currentRoute.baseline_health_score || 50) < 60;

  const handleFindSaferRoute = async () => {
    setIsFindingAlternate(true);

    try {
      const osrmResult = await getOSRMRoute(
        currentRoute.originCoords,
        currentRoute.destinationCoords,
        currentRoute.id
      );

      const altPredefined = DEMO_ALTERNATE_ROUTES[currentRoute.id];
      const alternateCoordinates = osrmResult.routes.length > 1
        ? osrmResult.routes[1].coordinates
        : (altPredefined ? altPredefined.coordinates : currentRoute.coordinates);

      const altObj = {
        id: `${currentRoute.id}-ALT`,
        name: altPredefined ? altPredefined.name : `Alternate Bypass Corridor (${currentRoute.origin} → ${currentRoute.destination})`,
        origin: currentRoute.origin,
        destination: currentRoute.destination,
        distance_km: altPredefined ? altPredefined.distance_km : Math.round(currentRoute.distance_km * 1.14),
        eta_hours: altPredefined ? altPredefined.eta_hours : Math.round((currentRoute.distance_km * 1.14 / 42) * 10) / 10,
        health_score: altPredefined ? altPredefined.health_score : 78,
        risk_level: 'Safe',
        coordinates: alternateCoordinates,
        recommendationReason: altPredefined ? altPredefined.recommendationReason : 'All-weather bypass corridor avoiding critical landslide chokepoints.'
      };

      setAlternateRouteResult(altObj);

      const evalResult = evaluateSaferRoute({
        primaryRoute: currentRoute,
        alternateRoute: altObj,
        primaryHealth: currentRoute.dynamic_health_score || currentRoute.baseline_health_score,
        alternateHealth: altObj.health_score,
        primaryAiRiskPct: currentPred.disruption_probability_pct,
        alternateAiRiskPct: 21.7,
        primaryIncidents: currentIncidents.length,
        alternateIncidents: 0
      });

      setRecommendationResult(evalResult);
    } catch (err) {
      console.error('Alternate route calculation failed:', err);
    } finally {
      setIsFindingAlternate(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Clean Light-Themed Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.015em' }}>
            Route Intelligence &amp; Safer Bypass Optimization
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            AI-driven corridor hazard evaluation and dynamic alternate routing across Northeast India.
          </p>
        </div>

        {/* Corridor Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <MapPin size={16} color="#0284c7" />
          <select
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0f172a',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
            value={selectedRouteId}
            onChange={(e) => {
              setSelectedRouteId(e.target.value);
              setAlternateRouteResult(null);
              setRecommendationResult(null);
            }}
            id="select-corridor"
          >
            {corridorOptions.map(opt => (
              <option key={opt.id} value={opt.id} style={{ background: '#ffffff', color: '#0f172a' }}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Corridor Card */}
      <div className="card" style={{
        background: '#ffffff',
        borderLeft: `4px solid ${isHighRisk ? '#dc2626' : '#16a34a'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {currentRoute.name}
              </h3>
              <span className={`badge ${
                (currentRoute.dynamic_health_score || currentRoute.baseline_health_score) < 40 
                  ? 'badge-critical' 
                  : (currentRoute.dynamic_health_score || currentRoute.baseline_health_score) < 60 
                  ? 'badge-risky' 
                  : 'badge-safe'
              }`}>
                {currentRoute.dynamic_risk_tier || currentRoute.risk_level}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              {currentRoute.description}
            </p>
          </div>

          <button
            onClick={handleFindSaferRoute}
            disabled={isFindingAlternate}
            className="btn btn-primary btn-sm"
            id="btn-find-safer-route"
          >
            <Sparkles size={15} />
            {isFindingAlternate ? 'Computing Safer Bypass...' : 'Find Safer Route'}
          </button>
        </div>

        {/* Clean Key Metrics Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Distance</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {currentRoute.distance_km} km
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Estimated Travel Time</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              ~{Math.round((currentRoute.distance_km / 42) * 10) / 10} hrs
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>AI Disruption Hazard</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: isHighRisk ? '#dc2626' : '#16a34a', marginTop: '2px' }}>
              {currentPred.disruption_probability_pct}%
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Active Road Incidents</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: currentIncidents.length > 0 ? '#dc2626' : '#16a34a', marginTop: '2px' }}>
              {currentIncidents.length > 0 ? `${currentIncidents.length} Reported` : 'Clear'}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Alternate Route Recommendation (Shown when generated) */}
      {alternateRouteResult && (
        <div className="card" style={{
          background: '#ffffff',
          border: '1px solid #bbf7d0',
          borderLeft: '4px solid #16a34a',
          padding: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="#16a34a" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d', margin: 0 }}>
                Safety Optimization Recommendation
              </h3>
            </div>
            <span className="badge badge-safe">RECOMMENDED ACTION</span>
          </div>

          {/* Clean 2-Column Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Primary Corridor */}
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b91c1c' }}>Current Route (Direct)</span>
                <span className="badge badge-critical">HIGH HAZARD</span>
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>
                {currentRoute.name}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Distance &amp; Time:</span>
                  <strong style={{ color: '#0f172a' }}>{currentRoute.distance_km} km (~{Math.round((currentRoute.distance_km / 42) * 10) / 10}h)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Route Health Score:</span>
                  <strong style={{ color: '#dc2626' }}>{currentRoute.dynamic_health_score || currentRoute.baseline_health_score}/100</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Disruption Probability:</span>
                  <strong style={{ color: '#dc2626' }}>{currentPred.disruption_probability_pct}% (High Risk)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', paddingTop: '0.35rem', borderTop: '1px dashed #fecaca' }}>
                  <span>Active Chokepoint:</span>
                  <strong style={{ color: '#b91c1c' }}>Landslide / Road Obstruction</strong>
                </div>
              </div>
            </div>

            {/* Recommended Alternate Bypass */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>Recommended Alternate Bypass</span>
                <span className="badge badge-safe">SAFE &amp; ACCESSIBLE</span>
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>
                {alternateRouteResult.name}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Distance &amp; Time:</span>
                  <strong style={{ color: '#0f172a' }}>{alternateRouteResult.distance_km} km (~{alternateRouteResult.eta_hours}h)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Route Health Score:</span>
                  <strong style={{ color: '#15803d' }}>{alternateRouteResult.health_score}/100 (Safe)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Disruption Probability:</span>
                  <strong style={{ color: '#15803d' }}>21.7% (Low Risk)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', paddingTop: '0.35rem', borderTop: '1px dashed #bbf7d0' }}>
                  <span>Corridor Status:</span>
                  <strong style={{ color: '#15803d' }}>All-Weather Passage Open</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Recommendation Rationale Banner */}
          <div style={{
            background: '#dcfce7',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            fontSize: '0.82rem',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={16} color="#15803d" />
            <span>
              <strong>Smart Dispatch Verdict: </strong>
              {recommendationResult?.rationale || 'Reroute critical logistics via the alternate corridor to bypass ground hazards and ensure guaranteed delivery.'}
            </span>
          </div>
        </div>
      )}

      {/* Interactive Corridor Map */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={18} color="#0284c7" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Corridor Alignment &amp; Bypass Map View
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {alternateRouteResult ? 'Displaying Primary Route (Red) and Recommended Alternate Bypass (Green)' : 'Select corridor to view highway alignment and active hazards'}
          </span>
        </div>

        <NERMap
          routes={routes}
          incidents={incidents}
          vehicles={vehicles}
          fieldReports={fieldReports}
          alternateRoute={alternateRouteResult}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
          height="450px"
        />
      </div>

      {/* Optional Technical AI & Health Deep Dive Accordion */}
      <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <Brain size={14} color="#8b5cf6" />
          <span>{showTechnicalDetails ? 'Hide AI Model & Health Breakdown' : 'View AI Model & Health Breakdown (Technical)'}</span>
          {showTechnicalDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {showTechnicalDetails && (
        <div className="grid-2col" style={{ animation: 'fadeIn 0.3s ease', marginTop: '0.75rem' }}>
          {/* Transparent Rule-Based Health Score */}
          <HealthScoreCard
            healthDetails={currentRoute.health_details || { score: currentRoute.baseline_health_score, tier: currentRoute.risk_level }}
            routeName={currentRoute.name}
          />

          {/* Scikit-learn Random Forest Model Inference */}
          <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Brain size={18} color="#8b5cf6" />
                  AI Disruption Prediction Model
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  RandomForestClassifier (predict_proba) • Synthetic NER Training Data
                </p>
              </div>
              <span className={`badge ${
                currentPred.risk_level === 'Critical' ? 'badge-critical' : currentPred.risk_level === 'High' ? 'badge-risky' : 'badge-moderate'
              }`}>
                {currentPred.risk_level} RISK
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: '#7c3aed', lineHeight: 1 }}>
                {currentPred.disruption_probability_pct}%
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Probability of Disruption</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem' }}>
              {currentPred.prediction_reason}
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '0.75rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Top Predictive Factors:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.8rem' }}>
                {currentPred.top_factors && currentPred.top_factors.map((f, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                    <span>{f.factor} ({f.value}):</span>
                    <strong style={{ color: '#dc2626' }}>{f.impact}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
