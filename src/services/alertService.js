/**
 * SIH NER Smart Logistics Platform - Alert Engine & Dispatch Service
 * 
 * Rules & Idempotency:
 * - Before creating an alert:
 *   1. Query Supabase alerts using the alert_id.
 *   2. Check whether an active alert already exists.
 *   3. If it exists, do NOT insert another row.
 *   4. If it does not exist, insert the alert.
 *   5. Idempotent evaluation: Prevents duplicate insertions across evaluations and renders.
 * - Enforces UNIQUE alert_id constraint on Supabase table.
 */

import { INITIAL_ALERTS } from '../data/demoAlerts';
import { supabase, isSupabaseConfigured } from './supabaseClient';

class AlertEngineManager {
  constructor() {
    this.alerts = [...INITIAL_ALERTS];
    this.subscribers = new Set();
    this.knownAlertIds = new Set(INITIAL_ALERTS.map(a => a.alert_id));
    this.inFlightAlertIds = new Set();
    this.isEvaluating = false;

    // Sync known existing active alerts from Supabase on init
    this.syncFromSupabase();
  }

  async syncFromSupabase() {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { data, error } = await supabase.from('alerts').select('*');
      if (!error && data) {
        data.forEach(dbA => {
          if (dbA.alert_id) {
            this.knownAlertIds.add(dbA.alert_id);
            const existsLocally = this.alerts.some(a => a.alert_id === dbA.alert_id);
            if (!existsLocally) {
              this.alerts.push({
                alert_id: dbA.alert_id,
                title: dbA.title,
                type: dbA.cause || dbA.title,
                severity: dbA.severity || 'High',
                description: dbA.cause || dbA.title,
                route_id: dbA.affected_route,
                vehicle_id: null,
                timestamp: dbA.timestamp || dbA.created_at || new Date().toISOString(),
                is_acknowledged: dbA.status === 'Resolved' || dbA.status === 'Acknowledged',
                action_required: dbA.recommended_action || 'Operational review advised.'
              });
            }
          }
        });
        this.notifySubscribers();
      }
    } catch (err) {
      console.warn('Initial Supabase alert sync notice:', err);
    }
  }

  getAlerts() {
    return this.alerts;
  }

  getActiveAlerts() {
    return this.alerts.filter(a => !a.is_acknowledged);
  }

  async acknowledgeAlert(alertId) {
    this.alerts = this.alerts.map(a => 
      a.alert_id === alertId ? { ...a, is_acknowledged: true } : a
    );
    this.notifySubscribers();

    // Update status in Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('alerts')
          .update({ status: 'Resolved' })
          .eq('alert_id', alertId);
      } catch (err) {
        console.warn('Supabase alert acknowledge update notice:', err);
      }
    }
  }

  /**
   * Evaluates system conditions idempotently without duplicate insertions
   */
  async evaluateSystemConditions({ vehicles = [], routes = [], predictions = {}, weatherMap = {} }) {
    if (this.isEvaluating) return;
    this.isEvaluating = true;

    try {
      const v001 = vehicles.find(v => v.id === 'V001');
      const r001 = routes.find(r => r.id === 'R001');
      const pred001 = predictions['R001'];

      // 1. Critical Medicine Delivery at Risk Rule
      if (v001 && r001) {
        const isMedicine = (v001.cargo || '').toLowerCase().includes('medicine');
        const isCriticalPriority = v001.priority === 'Critical';
        const isRouteHighOrCritical = r001.dynamic_risk_tier === 'High' || r001.dynamic_risk_tier === 'Critical' || r001.risk_level === 'Critical';
        const isDisruptionSevere = pred001 && (pred001.disruption_probability >= 0.75 || pred001.disruption_probability_pct >= 75);

        if (isMedicine && isCriticalPriority && (isRouteHighOrCritical || isDisruptionSevere)) {
          await this.createAlertIfNotExists({
            alert_id: 'ALT-CRIT-MED-V001',
            title: 'Critical Medicine Delivery at Risk',
            type: 'Critical Medicine Delivery at Risk',
            severity: 'Critical',
            description: `Emergency medical supply convoy V001 is compromised on Guwahati → Imphal corridor due to ${r001.risk_level} Route Risk and active bridge impassability. Immediate alternate routing advised.`,
            route_id: 'R001',
            vehicle_id: 'V001',
            action_required: 'Execute emergency rerouting via Lumding-Silchar southern bypass.'
          });
        }
      }

      // 2. Critical Route Health Rule
      for (const route of routes) {
        if (route.dynamic_health_score < 40) {
          await this.createAlertIfNotExists({
            alert_id: `ALT-HEALTH-${route.id}`,
            title: 'Critical Route Health',
            type: 'Critical Route Health',
            severity: 'Critical',
            description: `Corridor ${route.name} health score degraded to ${route.dynamic_health_score}/100. Impassable for standard heavy commercial transit.`,
            route_id: route.id,
            vehicle_id: null,
            action_required: 'Coordinate with State Disaster Authority and BRO for clearance.'
          });
        }
      }

      // 3. Severe Weather Risk Rule
      for (const [city, w] of Object.entries(weatherMap)) {
        if (w.rainfall_mm > 20 || (w.condition || '').toLowerCase().includes('thunderstorm')) {
          await this.createAlertIfNotExists({
            alert_id: `ALT-WEATHER-${city.toUpperCase()}`,
            title: 'Severe Weather Risk',
            type: 'Severe Weather Risk',
            severity: 'High',
            description: `Heavy precipitation (${w.rainfall_mm}mm) and convective squalls recorded in ${city}. High risk of flash hill inundation.`,
            route_id: null,
            vehicle_id: null,
            action_required: 'Issue flood safety advisories to all dispatched freight units.'
          });
        }
      }

      // 4. Vehicle Delivery Delayed Rule
      for (const v of vehicles) {
        if (v.status === 'Delayed') {
          await this.createAlertIfNotExists({
            alert_id: `ALT-DELAY-${v.id}`,
            title: 'Vehicle Delivery Delayed',
            type: 'Vehicle Delivery Delayed',
            severity: 'Moderate',
            description: `Vehicle ${v.id} (${v.cargo}) reporting transit halt at ${v.current_location}. ETA expanded to ${v.eta_hours}h.`,
            route_id: v.route_id,
            vehicle_id: v.id,
            action_required: 'Monitor telemetry and arrange intermediate cold/dry holding if required.'
          });
        }
      }
    } finally {
      this.isEvaluating = false;
    }
  }

  /**
   * Idempotent Alert Creator with Supabase unique pre-check
   */
  async createAlertIfNotExists(alertPayload) {
    const targetAlertId = alertPayload.alert_id;

    // Fast in-memory idempotency check: already known or currently in-flight
    if (this.knownAlertIds.has(targetAlertId) || this.inFlightAlertIds.has(targetAlertId)) {
      return this.alerts.find(a => a.alert_id === targetAlertId);
    }

    // Check if an equivalent active alert already exists in memory
    const existingLocal = this.alerts.find(a => 
      a.alert_id === targetAlertId ||
      (a.type === alertPayload.type && a.vehicle_id === alertPayload.vehicle_id && a.route_id === alertPayload.route_id && !a.is_acknowledged)
    );

    if (existingLocal) {
      this.knownAlertIds.add(targetAlertId);
      return existingLocal;
    }

    // Lock targetAlertId to prevent concurrent evaluations from duplicate requests
    this.inFlightAlertIds.add(targetAlertId);

    try {
      // 1. Query Supabase alerts using the alert_id
      if (isSupabaseConfigured && supabase) {
        const { data: existingRows, error: checkError } = await supabase
          .from('alerts')
          .select('id, alert_id, status')
          .eq('alert_id', targetAlertId);

        // 2. Check whether an active alert already exists in Supabase
        if (!checkError && existingRows && existingRows.length > 0) {
          // 3. If it exists, do NOT insert another row
          this.knownAlertIds.add(targetAlertId);
          return existingRows[0];
        }
      }

      // 4. If it does not exist, insert the alert
      const newAlert = {
        ...alertPayload,
        timestamp: new Date().toISOString(),
        is_acknowledged: false
      };

      // Update in-memory collections
      this.knownAlertIds.add(targetAlertId);
      this.alerts = [newAlert, ...this.alerts];
      this.notifySubscribers();

      // Insert into Supabase
      if (isSupabaseConfigured && supabase) {
        let dbSeverity = newAlert.severity;
        if (dbSeverity === 'Moderate') {
          dbSeverity = 'Medium';
        }

        const dbPayload = {
          alert_id: newAlert.alert_id,
          severity: dbSeverity,
          title: newAlert.title,
          location: newAlert.route_id || 'NER Regional Corridor',
          cause: newAlert.type,
          recommended_action: newAlert.action_required || 'Operational review advised.',
          status: newAlert.is_acknowledged ? 'Resolved' : 'Active',
          timestamp: newAlert.timestamp || new Date().toISOString(),
          affected_route: newAlert.route_id
        };

        const { error: insertError } = await supabase.from('alerts').insert([dbPayload]);
        if (insertError) {
          // If code is 23505 (unique constraint violation), handle gracefully as idempotent no-op
          if (insertError.code !== '23505') {
            console.warn('Supabase alert insert failed:', insertError);
          }
        }
      }

      return newAlert;
    } catch (err) {
      console.warn('createAlertIfNotExists error:', err);
    } finally {
      this.inFlightAlertIds.delete(targetAlertId);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.alerts);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.alerts);
      } catch (err) {
        console.error('Subscriber error in alertService:', err);
      }
    });
  }
}

export const alertEngine = new AlertEngineManager();
