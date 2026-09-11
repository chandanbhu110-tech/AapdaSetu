/**
 * SIH NER Smart Logistics Platform - Route Intelligence & State Service
 */

import { DEMO_ROUTES } from '../data/demoRoutes';
import { DEMO_INCIDENTS } from '../data/demoIncidents';
import { calculateRouteHealthScore } from '../utils/routeHealth';
import { calculateWeatherRisk } from '../utils/weatherRisk';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export function getAllRoutes(weatherMap = {}) {
  return DEMO_ROUTES.map(route => {
    // Determine incidents affecting this route
    const routeIncidents = DEMO_INCIDENTS.filter(inc => inc.affected_route === route.id);
    const incidentCount = routeIncidents.length;
    let maxSeverity = 0;
    routeIncidents.forEach(inc => {
      const sMap = { 'Low': 1, 'Moderate': 2, 'High': 3, 'Critical': 4 };
      if ((sMap[inc.severity] || 0) > maxSeverity) {
        maxSeverity = sMap[inc.severity];
      }
    });

    // Evaluate weather for the destination/origin
    const originWeather = weatherMap[route.origin];
    const destWeather = weatherMap[route.destination];
    const weatherRiskOrigin = calculateWeatherRisk(originWeather).riskScore;
    const weatherRiskDest = calculateWeatherRisk(destWeather).riskScore;
    const combinedWeatherRisk = Math.max(weatherRiskOrigin, weatherRiskDest);

    // Compute live rule-based Route Health Score
    // Using route's specific baseline road condition
    const roadConditionMap = { 'R001': 30, 'R002': 45, 'R003': 50 };
    const healthResult = calculateRouteHealthScore({
      roadConditionScore: roadConditionMap[route.id] || 60,
      weatherRiskScore: combinedWeatherRisk,
      incidentCount,
      incidentSeverity: maxSeverity
    });

    return {
      ...route,
      dynamic_health_score: healthResult.score,
      dynamic_risk_tier: healthResult.tier,
      health_details: healthResult,
      active_incidents: routeIncidents,
      weather_risk_score: combinedWeatherRisk
    };
  });
}

/**
 * Fetch and enrich routes from Supabase when database credentials exist
 */
export async function fetchLiveRoutesFromSupabase(weatherMap = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return getAllRoutes(weatherMap);
  }

  try {
    const { data, error } = await supabase.from('routes').select('*');
    if (error || !data || data.length === 0) {
      console.warn('Supabase routes query empty or error, using baseline demo routes:', error);
      return getAllRoutes(weatherMap);
    }

    return data.map(dbRoute => {
      const routeId = dbRoute.route_id || dbRoute.id;
      const demoMatch = DEMO_ROUTES.find(dr => dr.id === routeId) || DEMO_ROUTES[0];
      const cleanOrigin = (dbRoute.origin || '').split(' ')[0] || demoMatch.origin;
      const cleanDest = (dbRoute.destination || '').split(' ')[0] || demoMatch.destination;

      const originWeather = weatherMap[cleanOrigin];
      const destWeather = weatherMap[cleanDest];
      const weatherRiskOrigin = calculateWeatherRisk(originWeather).riskScore;
      const weatherRiskDest = calculateWeatherRisk(destWeather).riskScore;
      const combinedWeatherRisk = Math.max(weatherRiskOrigin, weatherRiskDest);

      const routeIncidents = DEMO_INCIDENTS.filter(inc => inc.affected_route === routeId);
      const healthResult = calculateRouteHealthScore({
        roadConditionScore: dbRoute.health_score || demoMatch.baseline_health_score,
        weatherRiskScore: combinedWeatherRisk,
        incidentCount: routeIncidents.length,
        incidentSeverity: routeIncidents.length > 0 ? 3 : 0
      });

      return {
        ...demoMatch,
        id: routeId,
        name: `${dbRoute.origin} → ${dbRoute.destination}`,
        origin: cleanOrigin,
        destination: cleanDest,
        distance_km: dbRoute.distance_km || demoMatch.distance_km,
        baseline_health_score: dbRoute.health_score || demoMatch.baseline_health_score,
        risk_level: dbRoute.risk_level || demoMatch.risk_level,
        road_condition: dbRoute.road_condition || demoMatch.road_condition,
        accessibility: dbRoute.accessibility_status || demoMatch.accessibility,
        dynamic_health_score: healthResult.score,
        dynamic_risk_tier: healthResult.tier,
        health_details: healthResult,
        active_incidents: routeIncidents,
        weather_risk_score: combinedWeatherRisk,
        isFromSupabase: true
      };
    });
  } catch (err) {
    console.warn('Failed to load routes from Supabase, using local fallback:', err);
    return getAllRoutes(weatherMap);
  }
}

export function getRouteById(routeId, weatherMap = {}) {
  const routes = getAllRoutes(weatherMap);
  return routes.find(r => r.id === routeId) || routes[0];
}
