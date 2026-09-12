import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Navigation/Header';
import Sidebar from './components/Navigation/Sidebar';
import Dashboard from './pages/Dashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import RouteIntelligence from './pages/RouteIntelligence';
import LiveMap from './pages/LiveMap';
import Vehicles from './pages/Vehicles';
import Alerts from './pages/Alerts';
import FieldReports from './pages/FieldReports';

// Services
import { fetchAllMonitoredWeather, fetchCityWeather } from './services/weatherService';
import { getAllRoutes, fetchLiveRoutesFromSupabase } from './services/routeService';
import { vehicleTracker } from './services/vehicleService';
import { incidentService } from './services/incidentService';
import { alertEngine } from './services/alertService';
import { getAllPredictions } from './services/predictionService';
import { isSupabaseConfigured } from './services/supabaseClient';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedRouteId, setSelectedRouteId] = useState('R001');

  // Core Data States
  const [weatherMap, setWeatherMap] = useState({});
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [routes, setRoutes] = useState(() => getAllRoutes({}));
  const [vehicles, setVehicles] = useState(vehicleTracker.getVehicles());
  const [incidents, setIncidents] = useState(incidentService.getIncidents());
  const [fieldReports, setFieldReports] = useState(incidentService.getFieldReports());
  const [alerts, setAlerts] = useState(alertEngine.getAlerts());
  const [predictions] = useState(getAllPredictions());

  // Offline Intelligence States
  const [isOnline, setIsOnline] = useState(() => incidentService.isOnline());
  const [offlineQueueCount, setOfflineQueueCount] = useState(() => incidentService.getOfflineQueueCount());
  const [simulatedOffline, setSimulatedOffline] = useState(() => incidentService.getSimulatedOffline());

  // 1. Initial Weather & Supabase Fetch
  const refreshWeather = useCallback(async () => {
    setIsWeatherLoading(true);
    try {
      const data = await fetchAllMonitoredWeather();
      setWeatherMap(data);
      // Re-evaluate routes with live weather and Supabase database records
      const liveRoutes = await fetchLiveRoutesFromSupabase(data);
      setRoutes(liveRoutes);
    } catch (err) {
      console.warn('Weather fetch encountered an issue, keeping existing state:', err);
    } finally {
      setIsWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWeather();
  }, [refreshWeather]);

  // 2. Subscribe to Vehicle simulated GPS tracking updates
  useEffect(() => {
    const unsubscribe = vehicleTracker.subscribe((updatedVehicles) => {
      setVehicles([...updatedVehicles]);
    });
    return unsubscribe;
  }, []);

  // 3. Subscribe to Incidents and Field Reports (including network status & queue)
  useEffect(() => {
    const unsubscribe = incidentService.subscribe(({ incidents: incs, fieldReports: reports, isOnline: online, offlineQueueCount: qCount, simulatedOffline: simOff }) => {
      setIncidents([...incs]);
      setFieldReports([...reports]);
      setIsOnline(online);
      setOfflineQueueCount(qCount);
      setSimulatedOffline(simOff);
    });
    return unsubscribe;
  }, []);

  // 4. Subscribe to Alerts Engine
  useEffect(() => {
    const unsubscribe = alertEngine.subscribe((updatedAlerts) => {
      setAlerts([...updatedAlerts]);
    });
    return unsubscribe;
  }, []);

  // 5. Trigger automated Alert Engine condition evaluation only when relevant alert states change
  // Do NOT re-trigger on continuous simulated GPS coordinate advancements
  const alertEvaluationSignature = useMemo(() => {
    const vSig = vehicles.map(v => `${v.id}:${v.status}:${v.priority}:${v.cargo}`).join('|');
    const rSig = routes.map(r => `${r.id}:${r.dynamic_risk_tier}:${r.dynamic_health_score}`).join('|');
    const wSig = Object.keys(weatherMap).map(c => `${c}:${weatherMap[c]?.rainfall_mm > 20}:${(weatherMap[c]?.condition || '').toLowerCase().includes('thunderstorm')}`).join('|');
    const pSig = Object.keys(predictions).map(k => `${k}:${predictions[k]?.risk_level}:${predictions[k]?.disruption_probability_pct >= 75}`).join('|');
    return `${vSig}##${rSig}##${wSig}##${pSig}`;
  }, [vehicles, routes, weatherMap, predictions]);

  useEffect(() => {
    if (routes.length > 0 && vehicles.length > 0) {
      alertEngine.evaluateSystemConditions({
        vehicles,
        routes,
        predictions,
        weatherMap
      });
    }
  }, [alertEvaluationSignature]);

  // Handlers
  const handleAcknowledgeAlert = (alertId) => {
    alertEngine.acknowledgeAlert(alertId);
  };

  const handleToggleSimulatedOffline = () => {
    incidentService.setSimulatedOffline(!simulatedOffline);
  };

  const handleSyncOfflineReports = async () => {
    return await incidentService.syncOfflineReports();
  };

  const handleSubmitFieldReport = async (reportData) => {
    const addedReport = await incidentService.addFieldReport(reportData);
    // Refresh routes if incident affects a specific route
    setRoutes(getAllRoutes(weatherMap));
    return addedReport;
  };

  const handleVerifyFieldReport = async (reportId) => {
    await incidentService.verifyReport(reportId);
  };

  const handleAddVehicle = (newVehicle) => {
    return vehicleTracker.addVehicle(newVehicle);
  };

  const activeAlertsCount = alerts.filter(a => !a.is_acknowledged).length;

  return (
    <div className="app-layout">
      {/* Top Horizontal Header */}
      <Header
        onNavigate={(page) => setActivePage(page)}
        activeAlertCount={activeAlertsCount}
        isOnline={isOnline}
        isSupabaseConnected={isSupabaseConfigured}
      />

      {/* App Body: Fixed Left Sidebar + Main Content */}
      <div className="app-body">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          activeAlertCount={activeAlertsCount}
        />

        <main className="app-main-content">
          {activePage === 'dashboard' && (
            <Dashboard
              routes={routes}
              vehicles={vehicles}
              incidents={incidents}
              fieldReports={fieldReports}
              alerts={alerts}
              weatherMap={weatherMap}
              predictions={predictions}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              onNavigate={(page) => setActivePage(page)}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onRefreshWeather={refreshWeather}
              isWeatherLoading={isWeatherLoading}
            />
          )}

          {activePage === 'authority' && (
            <AuthorityDashboard
              routes={routes}
              vehicles={vehicles}
              incidents={incidents}
              fieldReports={fieldReports}
              alerts={alerts}
              predictions={predictions}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              onNavigate={(page) => setActivePage(page)}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              isDemoDataMode={!import.meta.env.VITE_OPENWEATHER_API_KEY}
            />
          )}

          {activePage === 'route-intel' && (
            <RouteIntelligence
              routes={routes}
              selectedRouteId={selectedRouteId}
              setSelectedRouteId={setSelectedRouteId}
              weatherMap={weatherMap}
              predictions={predictions}
              incidents={incidents}
              vehicles={vehicles}
              fieldReports={fieldReports}
            />
          )}

          {activePage === 'live-map' && (
            <LiveMap
              routes={routes}
              incidents={incidents}
              vehicles={vehicles}
              fieldReports={fieldReports}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === 'vehicles' && (
            <Vehicles
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === 'alerts' && (
            <Alerts
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
          )}

          {activePage === 'field-reports' && (
            <FieldReports
              fieldReports={fieldReports}
              onSubmitReport={handleSubmitFieldReport}
              onVerifyReport={handleVerifyFieldReport}
              routes={routes}
              isOnline={isOnline}
              offlineQueueCount={offlineQueueCount}
              simulatedOffline={simulatedOffline}
              onToggleSimulatedOffline={handleToggleSimulatedOffline}
              onSyncOfflineReports={handleSyncOfflineReports}
            />
          )}
        </main>
      </div>
    </div>
  );
}
