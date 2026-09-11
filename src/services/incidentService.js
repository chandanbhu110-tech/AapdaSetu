/**
 * SIH NER Smart Logistics Platform - Incident & Field Reports Service
 * 
 * Features:
 * - Full offline-first capability with localStorage persistence.
 * - Detects navigator.onLine and supports simulated offline mode for demonstration.
 * - Marks offline reports as "Pending Sync".
 * - Auto-synchronizes with Supabase when online connectivity is restored,
 *   updating status to "Pending Verification".
 */

import { DEMO_INCIDENTS } from '../data/demoIncidents';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_REPORTS = 'ner_field_reports_cache';
const STORAGE_KEY_QUEUE = 'ner_offline_field_reports_queue';

const INITIAL_FIELD_REPORTS = [
  {
    id: 'FR-101',
    incident_type: 'Mud Accumulation',
    description: 'Citizen report: 2 feet mud buildup near Nungba curve. Heavy vehicles slipping.',
    severity: 'Moderate',
    latitude: 24.7800,
    longitude: 93.3100,
    affected_route: 'R001',
    reporter_role: 'Local Transport Union Driver',
    status: 'Verified',
    photo_url: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'FR-102',
    incident_type: 'Tree Fall & Power Cable Obstruction',
    description: 'Field volunteer report: Heavy eucalyptus branch down over single lane NH6 approach.',
    severity: 'High',
    latitude: 25.2000,
    longitude: 92.3100,
    affected_route: 'R002',
    reporter_role: 'District Disaster Volunteer',
    status: 'Pending Verification',
    photo_url: null,
    created_at: new Date(Date.now() - 1800000).toISOString()
  }
];

class IncidentServiceManager {
  constructor() {
    this.incidents = [...DEMO_INCIDENTS];
    this.subscribers = new Set();
    this.simulatedOffline = false;

    // Load persisted reports and offline queue from localStorage
    this.fieldReports = this.loadStoredReports();
    this.offlineQueue = this.loadOfflineQueue();

    // Listen to browser network changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkOnline());
      window.addEventListener('offline', () => this.notifySubscribers());
    }

    // Try initial sync if online
    if (this.isOnline() && this.offlineQueue.length > 0) {
      this.syncOfflineReports();
    }
    // Fetch remote field reports from Supabase if available
    this.fetchRemoteReports();
  }

  async fetchRemoteReports() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('field_reports').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          const remoteNormalized = data.map(r => ({
            id: r.report_id || `FR-${r.id}`,
            incident_type: r.incident_type,
            description: r.description,
            severity: r.severity || 'Moderate',
            latitude: parseFloat(r.latitude) || 25.0,
            longitude: parseFloat(r.longitude) || 92.5,
            affected_route: r.affected_route || 'R001',
            reporter_role: r.reporter_id || 'Citizen Reporter',
            status: r.status || 'Pending Verification',
            photo_url: r.photo_url || null,
            created_at: r.created_at || r.timestamp || new Date().toISOString(),
            is_offline: false
          }));
          const existingIds = new Set(this.fieldReports.map(fr => fr.id));
          const newRemote = remoteNormalized.filter(r => !existingIds.has(r.id));
          if (newRemote.length > 0) {
            this.fieldReports = [...newRemote, ...this.fieldReports];
            this.saveState();
            this.notifySubscribers();
          }
        }
      } catch (err) {
        console.warn('Could not fetch remote field reports:', err);
      }
    }
  }

  loadStoredReports() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read cached field reports:', e);
    }
    return [...INITIAL_FIELD_REPORTS];
  }

  loadOfflineQueue() {
    try {
      const queue = localStorage.getItem(STORAGE_KEY_QUEUE);
      if (queue) {
        const parsed = JSON.parse(queue);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read offline queue:', e);
    }
    return [];
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(this.fieldReports));
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(this.offlineQueue));
    } catch (e) {
      console.warn('Could not persist field reports state:', e);
    }
  }

  isOnline() {
    const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    return browserOnline && !this.simulatedOffline;
  }

  setSimulatedOffline(val) {
    this.simulatedOffline = Boolean(val);
    if (!this.simulatedOffline && this.isOnline() && this.offlineQueue.length > 0) {
      this.syncOfflineReports();
    }
    this.notifySubscribers();
  }

  getSimulatedOffline() {
    return this.simulatedOffline;
  }

  getIncidents() {
    return this.incidents;
  }

  getFieldReports() {
    return this.fieldReports;
  }

  getOfflineQueueCount() {
    return this.offlineQueue.length;
  }

  async addFieldReport(reportData) {
    const isCurrentlyOnline = this.isOnline();
    const status = isCurrentlyOnline ? 'Pending Verification' : 'Pending Sync';

    const newReport = {
      id: `FR-${Date.now().toString().slice(-4)}`,
      incident_type: reportData.incident_type || 'Road Hazard',
      description: reportData.description || 'Observed route disruption.',
      severity: reportData.severity || 'Moderate',
      latitude: parseFloat(reportData.latitude) || 26.1445,
      longitude: parseFloat(reportData.longitude) || 91.7362,
      affected_route: reportData.affected_route || 'R001',
      reporter_role: reportData.reporter_role || 'Field Reporter / Volunteer',
      status: status,
      photo_url: reportData.photo_url || null,
      created_at: new Date().toISOString(),
      is_offline: !isCurrentlyOnline
    };

    if (!isCurrentlyOnline) {
      // OFFLINE MODE: Save to local offline queue and local store
      this.offlineQueue = [newReport, ...this.offlineQueue];
      this.fieldReports = [newReport, ...this.fieldReports];
      this.saveState();
      this.notifySubscribers();
      return { report: newReport, wasOffline: true };
    }

    // ONLINE MODE: Attempt Supabase sync directly
    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = {
          report_id: newReport.id,
          incident_type: newReport.incident_type,
          description: newReport.description,
          severity: newReport.severity,
          latitude: newReport.latitude,
          longitude: newReport.longitude,
          affected_route: newReport.affected_route,
          reporter_id: newReport.reporter_role || 'Volunteer',
          photo_url: newReport.photo_url || null,
          status: newReport.status
        };
        const { error } = await supabase.from('field_reports').insert([dbPayload]);
        if (error) {
          console.warn('Notice: Supabase field_reports table query returned:', error.message);
        }
      } catch (err) {
        console.warn('Supabase insert failed, preserved locally:', err);
      }
    }

    this.fieldReports = [newReport, ...this.fieldReports];
    this.saveState();
    this.notifySubscribers();
    return { report: newReport, wasOffline: false };
  }

  /**
   * Syncs queued offline reports to Supabase when connection is restored
   */
  async syncOfflineReports() {
    if (this.offlineQueue.length === 0 || !this.isOnline()) {
      return { syncedCount: 0 };
    }

    const toSync = [...this.offlineQueue];
    let syncedCount = 0;

    for (const report of toSync) {
      if (isSupabaseConfigured && supabase) {
        try {
          const dbPayload = {
            report_id: report.id,
            incident_type: report.incident_type,
            description: report.description,
            severity: report.severity,
            latitude: report.latitude,
            longitude: report.longitude,
            affected_route: report.affected_route,
            reporter_id: report.reporter_role || 'Volunteer',
            photo_url: report.photo_url || null,
            status: 'Pending Verification'
          };
          await supabase.from('field_reports').insert([dbPayload]);
        } catch (err) {
          console.warn('Supabase sync notice for report', report.id, err);
        }
      }

      // Transition status from "Pending Sync" to "Pending Verification"
      this.fieldReports = this.fieldReports.map(fr => 
        fr.id === report.id ? { ...fr, status: 'Pending Verification', is_offline: false } : fr
      );
      syncedCount++;
    }

    // Clear the offline queue
    this.offlineQueue = [];
    this.saveState();
    this.notifySubscribers();
    return { syncedCount };
  }

  handleNetworkOnline() {
    if (!this.simulatedOffline) {
      this.syncOfflineReports();
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback({ 
      incidents: this.incidents, 
      fieldReports: this.fieldReports,
      isOnline: this.isOnline(),
      offlineQueueCount: this.offlineQueue.length,
      simulatedOffline: this.simulatedOffline
    });
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    const payload = { 
      incidents: this.incidents, 
      fieldReports: this.fieldReports,
      isOnline: this.isOnline(),
      offlineQueueCount: this.offlineQueue.length,
      simulatedOffline: this.simulatedOffline
    };
    this.subscribers.forEach(cb => {
      try {
        cb(payload);
      } catch (err) {
        console.error('Subscriber error in incidentService:', err);
      }
    });
  }
}

export const incidentService = new IncidentServiceManager();
