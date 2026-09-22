/**
 * SIH NER Smart Logistics Platform - Incident & Field Reports Service
 * 
 * Features:
 * - Full offline-first capability with localStorage persistence.
 * - Detects navigator.onLine and supports simulated offline mode for demonstration.
 * - Marks offline reports as "Pending Sync".
 * - Auto-synchronizes with Supabase when online connectivity is restored,
 *   updating status to "Pending Verification".
 * - Comprehensive error handling with non-silent recovery.
 */

import { DEMO_INCIDENTS } from '../data/demoIncidents.js';
import { BASE_FIELD_REPORTS } from '../data/baselineReports.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const STORAGE_KEY_REPORTS = 'ner_field_reports_cache';
const STORAGE_KEY_QUEUE = 'ner_offline_field_reports_queue';

class IncidentServiceManager {
  constructor() {
    this.incidents = [...DEMO_INCIDENTS];
    this.subscribers = new Set();
    this.simulatedOffline = false;

    // Load persisted reports and offline queue from localStorage
    this.fieldReports = this.loadStoredReports();
    this.offlineQueue = this.loadOfflineQueue();
    this.syncIncidentsFromFieldReports();

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

  /**
   * Synchronizes active incidents from fieldReports while preserving baseline demo incidents
   */
  syncIncidentsFromFieldReports() {
    const baseIncidents = [...DEMO_INCIDENTS];
    const baseIds = new Set(baseIncidents.map(i => i.id));
    const derived = [];

    for (const r of this.fieldReports) {
      const incId = `INC-${r.report_id || r.id}`;
      if (baseIds.has(incId) || baseIds.has(r.id) || derived.some(d => d.id === incId || d.id === r.id)) {
        continue;
      }

      derived.push({
        id: incId,
        report_id: r.report_id || r.id,
        type: r.incident_type || 'Road Hazard',
        incident_type: r.incident_type || 'Road Hazard',
        severity: r.severity || 'Moderate',
        latitude: parseFloat(r.latitude) || 25.0,
        longitude: parseFloat(r.longitude) || 92.5,
        description: r.description || 'Observed ground hazard.',
        affected_route: r.affected_route || 'R001',
        location_name: r.location || r.location_name || 'Corridor Sector',
        timestamp: r.created_at || r.timestamp || new Date().toISOString(),
        status: r.status === 'Verified' ? 'Verified Hazard' : 'Active Ground Report',
        verification_status: r.verification_status || r.status || 'Pending Verification',
        reported_by: r.reporter_name || r.reporter_role || r.reporter_id || 'Field Reporter',
        reporter_phone: r.reporter_phone || '',
        reporter_agency: r.reporter_agency || '',
        is_demo: false,
        is_field_report: true,
        estimated_clearance_hours: r.severity === 'Critical' ? 12.0 : r.severity === 'High' ? 6.0 : 3.0
      });
    }

    this.incidents = [...derived, ...baseIncidents];
  }

  async fetchRemoteReports() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('field_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          const remoteNormalized = data.map(r => ({
            id: r.report_id || `FR-${r.id}`,
            report_id: r.report_id || `FR-${r.id}`,
            incident_type: r.incident_type,
            description: r.description,
            severity: r.severity || 'Moderate',
            latitude: parseFloat(r.latitude) || 25.0,
            longitude: parseFloat(r.longitude) || 92.5,
            location: r.affected_route === 'R001' ? 'Guwahati → Imphal Corridor' : 'Northeast Corridor',
            affected_route: r.affected_route || 'R001',
            reporter_role: r.reporter_id || 'Citizen Reporter',
            reporter_id: r.reporter_id || 'Citizen Reporter',
            status: r.status || 'Pending Verification',
            sync_status: 'Synced',
            verification_status: r.status || 'Pending Verification',
            photo_url: r.photo_url || null,
            created_at: r.created_at || r.timestamp || new Date().toISOString(),
            timestamp: r.timestamp || r.created_at || new Date().toISOString(),
            is_offline: false
          }));

          const existingIds = new Set(this.fieldReports.map(fr => fr.id));
          const newRemote = remoteNormalized.filter(r => !existingIds.has(r.id) && !existingIds.has(r.report_id));
          if (newRemote.length > 0) {
            this.fieldReports = [...newRemote, ...this.fieldReports];
            this.syncIncidentsFromFieldReports();
            this.saveState();
            this.notifySubscribers();
          }
        }
      } catch (err) {
        console.warn('Could not fetch remote field reports:', err.message || err);
      }
    }
  }

  loadStoredReports() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= BASE_FIELD_REPORTS.length) {
          return parsed;
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          const baseIds = new Set(BASE_FIELD_REPORTS.map(b => b.id));
          const customReports = parsed.filter(p => !baseIds.has(p.id) && !baseIds.has(p.report_id));
          return [...customReports, ...BASE_FIELD_REPORTS];
        }
      }
    } catch (e) {
      console.warn('Could not read cached field reports:', e);
    }
    return [...BASE_FIELD_REPORTS];
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

  /**
   * Adds a field report. If online and Supabase is configured, attempts direct insert.
   * If insert fails or offline, saves locally and enqueues to offline queue for pending sync.
   */
  async addFieldReport(reportData) {
    const isCurrentlyOnline = this.isOnline();
    const canAttemptRemote = isCurrentlyOnline && isSupabaseConfigured && Boolean(supabase);

    const reportId = `FR-${Date.now().toString().slice(-4)}`;
    let status = canAttemptRemote ? 'Pending Verification' : 'Pending Sync';
    let isOffline = !canAttemptRemote;
    let synced = false;
    let feedbackMessage = '';

    const newReport = {
      id: reportId,
      report_id: reportId,
      incident_type: reportData.incident_type || 'Road Hazard',
      description: reportData.description || 'Observed route disruption.',
      severity: reportData.severity || 'Moderate',
      latitude: parseFloat(reportData.latitude) || 26.1445,
      longitude: parseFloat(reportData.longitude) || 91.7362,
      location: reportData.location_name || reportData.location || 'Assam Sector',
      affected_route: reportData.affected_route || 'R001',
      reporter_name: reportData.reporter_name || reportData.reporter_id || 'Field Reporter',
      reporter_phone: reportData.reporter_phone || '',
      reporter_role: reportData.reporter_role || 'Field Officer',
      reporter_agency: reportData.reporter_agency || '',
      reporter_id: reportData.reporter_id || reportData.reporter_name || 'Ground Unit',
      status: status,
      sync_status: canAttemptRemote ? 'Synced' : 'Pending Sync',
      verification_status: status,
      photo_url: reportData.photo_url || null,
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      is_offline: isOffline
    };

    if (canAttemptRemote) {
      // ONLINE MODE: Attempt Supabase sync directly
      try {
        const reporterFormatted = newReport.reporter_phone
          ? `${newReport.reporter_name} [Tel: ${newReport.reporter_phone}] (${newReport.reporter_role})`
          : `${newReport.reporter_name} (${newReport.reporter_role})`;

        const dbPayload = {
          report_id: newReport.report_id,
          incident_type: newReport.incident_type,
          description: newReport.description,
          severity: newReport.severity,
          latitude: newReport.latitude,
          longitude: newReport.longitude,
          affected_route: newReport.affected_route,
          reporter_id: reporterFormatted,
          photo_url: newReport.photo_url,
          status: 'Pending Verification',
          timestamp: newReport.created_at
        };

        const { error } = await supabase.from('field_reports').insert([dbPayload]);
        if (error) {
          // Log Supabase error message without exposing credentials
          console.error('Supabase insert failed:', error.message || error);
          // Fall back gracefully to offline queue
          newReport.status = 'Pending Sync';
          newReport.sync_status = 'Pending Sync';
          newReport.verification_status = 'Pending Sync';
          newReport.is_offline = true;
          this.offlineQueue = [newReport, ...this.offlineQueue];
          feedbackMessage = 'Unable to sync report. Saved locally and will sync when connection is restored.';
        } else {
          synced = true;
          feedbackMessage = 'Hazard report successfully broadcast to Operations Center!';
        }
      } catch (err) {
        console.error('Supabase connection exception during insert:', err.message || err);
        newReport.status = 'Pending Sync';
        newReport.sync_status = 'Pending Sync';
        newReport.verification_status = 'Pending Sync';
        newReport.is_offline = true;
        this.offlineQueue = [newReport, ...this.offlineQueue];
        feedbackMessage = 'Unable to sync report. Saved locally and will sync when connection is restored.';
      }
    } else {
      // OFFLINE MODE OR SUPABASE NOT CONFIGURED
      newReport.status = 'Pending Sync';
      newReport.sync_status = 'Pending Sync';
      newReport.verification_status = 'Pending Sync';
      newReport.is_offline = true;
      this.offlineQueue = [newReport, ...this.offlineQueue];
      feedbackMessage = 'Report saved locally. It will sync when connection is restored.';
    }

    // Prepend to fieldReports and update incident model
    this.fieldReports = [newReport, ...this.fieldReports];
    this.syncIncidentsFromFieldReports();
    this.saveState();
    this.notifySubscribers();

    return {
      success: true,
      report: newReport,
      synced,
      wasOffline: newReport.is_offline,
      message: feedbackMessage
    };
  }

  /**
   * Syncs queued offline reports to Supabase when connection is restored
   */
  async syncOfflineReports() {
    if (this.offlineQueue.length === 0 || !this.isOnline()) {
      return { syncedCount: 0 };
    }

    if (!isSupabaseConfigured || !supabase) {
      console.warn('Notice: Supabase is not configured yet. Offline reports remain queued locally.');
      return { syncedCount: 0 };
    }

    const remainingQueue = [];
    let syncedCount = 0;

    for (const report of this.offlineQueue) {
      try {
        const dbPayload = {
          report_id: report.report_id || report.id,
          incident_type: report.incident_type,
          description: report.description,
          severity: report.severity,
          latitude: report.latitude,
          longitude: report.longitude,
          affected_route: report.affected_route,
          reporter_id: report.reporter_id || report.reporter_role || 'Volunteer',
          photo_url: report.photo_url || null,
          status: 'Pending Verification',
          timestamp: report.created_at || report.timestamp || new Date().toISOString()
        };

        const { error } = await supabase.from('field_reports').upsert([dbPayload], { onConflict: 'report_id' });
        if (error && error.code !== '23505') {
          console.error(`Supabase sync notice for report ${report.id}:`, error.message || error);
          remainingQueue.push(report);
        } else {
          // Successfully synced to Supabase (or already synced)
          this.fieldReports = this.fieldReports.map(fr => 
            fr.id === report.id 
              ? { 
                  ...fr, 
                  status: 'Pending Verification', 
                  sync_status: 'Synced', 
                  verification_status: 'Pending Verification', 
                  is_offline: false 
                } 
              : fr
          );
          syncedCount++;
        }
      } catch (err) {
        console.error(`Supabase sync connection exception for report ${report.id}:`, err.message || err);
        remainingQueue.push(report);
      }
    }

    this.offlineQueue = remainingQueue;
    this.syncIncidentsFromFieldReports();
    this.saveState();
    this.notifySubscribers();
    return { syncedCount };
  }

  handleNetworkOnline() {
    if (!this.simulatedOffline) {
      this.syncOfflineReports();
    }
  }

  /**
   * Authority-only verification of a field hazard report
   */
  async verifyReport(reportId, verifiedBy = 'Disaster Authority Command') {
    let updatedReport = null;
    const nowIso = new Date().toISOString();

    // 1. Update in active fieldReports list
    this.fieldReports = this.fieldReports.map(fr => {
      if (fr.id === reportId || fr.report_id === reportId) {
        updatedReport = {
          ...fr,
          status: 'Verified',
          verification_status: 'Verified',
          verified_by: verifiedBy,
          verified_at: nowIso
        };
        return updatedReport;
      }
      return fr;
    });

    // 2. Also update in offline queue if it was queued
    this.offlineQueue = this.offlineQueue.map(q => {
      if (q.id === reportId || q.report_id === reportId) {
        return {
          ...q,
          status: 'Verified',
          verification_status: 'Verified',
          verified_by: verifiedBy,
          verified_at: nowIso
        };
      }
      return q;
    });

    // 3. Sync verification to remote Supabase database if configured
    if (isSupabaseConfigured && supabase && updatedReport) {
      try {
        const { error } = await supabase
          .from('field_reports')
          .update({ status: 'Verified' })
          .or(`id.eq.${reportId},report_id.eq.${reportId}`);

        if (error) {
          console.warn('Notice updating report status in Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Exception updating report status in Supabase:', err);
      }
    }

    // 4. Update incident status, save state & notify all subscribers (Dashboard, FieldReports, Map, etc.)
    this.syncIncidentsFromFieldReports();
    this.saveState();
    this.notifySubscribers();

    return {
      success: true,
      report: updatedReport
    };
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
