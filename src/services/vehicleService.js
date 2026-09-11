/**
 * SIH NER Smart Logistics Platform - Vehicle Fleet & Simulated GPS Tracking Service
 * 
 * IMPORTANT:
 * Tracking uses SIMULATED GPS coordinates advancing along the corridor polyline.
 * Clearly displays: "GPS MODE: SIMULATED"
 */

import { DEMO_VEHICLES } from '../data/demoVehicles.js';
import { DEMO_ROUTES } from '../data/demoRoutes.js';

const STORAGE_KEY_VEHICLES = 'ner_vehicles_cache';

function loadStoredVehicles() {
  if (typeof window === 'undefined') return [...DEMO_VEHICLES];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VEHICLES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Migration: If cached fleet is smaller than DEMO_VEHICLES (e.g. legacy 2 items), merge with full demo fleet
        if (parsed.length < DEMO_VEHICLES.length) {
          const demoIds = new Set(DEMO_VEHICLES.map(d => d.id));
          const userAdded = parsed.filter(p => !demoIds.has(p.id));
          return [...DEMO_VEHICLES, ...userAdded];
        }
        return parsed.map(v => ({
          ...v,
          created_at: v.created_at || new Date().toISOString(),
          updated_at: v.updated_at || new Date().toISOString()
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to load stored vehicles cache, fallback to demo', e);
  }
  return [...DEMO_VEHICLES];
}

class VehicleTrackerManager {
  constructor() {
    this.vehicles = loadStoredVehicles();
    this.progressIndex = {
      V001: 4, // starting near Jiribam
      V002: 3  // near Sonapur
    };
    this.subscribers = new Set();
    this.timer = null;
    this.startSimulation();
  }

  saveState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(this.vehicles));
      } catch (e) {
        console.warn('Failed to save vehicles to localStorage', e);
      }
    }
  }

  startSimulation() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.advanceSimulatedPositions();
    }, 4000); // Step every 4 seconds
  }

  stopSimulation() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  advanceSimulatedPositions() {
    const r001 = DEMO_ROUTES.find(r => r.id === 'R001');
    const coordsR001 = r001 ? r001.coordinates : [];
    const nowIso = new Date().toISOString();

    this.vehicles = this.vehicles.map(v => {
      if (v.id === 'V001' && coordsR001.length > 0) {
        let idx = this.progressIndex['V001'] + 1;
        if (idx >= coordsR001.length) {
          idx = 1; // loop back to initial leg for demo continuity
        }
        this.progressIndex['V001'] = idx;
        const currentCoord = coordsR001[idx];
        const progressPct = Math.min(95, Math.round((idx / (coordsR001.length - 1)) * 100));
        const remainingKm = Math.round(360 * (1 - progressPct / 100));
        const speed = 40 + Math.floor(Math.random() * 8);

        return {
          ...v,
          current_lat: currentCoord[0],
          current_lng: currentCoord[1],
          progress_percent: progressPct,
          speed_kmh: speed,
          eta_hours: Math.round((remainingKm / speed) * 10) / 10,
          current_location: idx > 6 ? 'Manipur Mountain Approach (NH2)' : 'Jiribam Foothills Sector (NH37)',
          last_ping: new Date().toLocaleTimeString(),
          updated_at: nowIso,
          gps_mode: 'SIMULATED'
        };
      }
      return v;
    });

    this.saveState();
    this.notifySubscribers();
  }

  addVehicle(vehicleData) {
    const nowIso = new Date().toISOString();
    
    // Ensure unique ID
    let finalId = vehicleData.id || `V00${this.vehicles.length + 1}`;
    if (this.vehicles.some(v => v.id === finalId)) {
      finalId = `V00${this.vehicles.length + 1}-${Date.now().toString().slice(-4)}`;
    }

    const newVehicle = {
      ...vehicleData,
      id: finalId,
      vehicle_number: vehicleData.vehicle_number || `AS-01-TR-${Math.floor(1000 + Math.random() * 9000)}`,
      cargo: vehicleData.cargo || 'Relief Supplies',
      priority: vehicleData.priority || 'Normal',
      status: vehicleData.status || 'On Route',
      origin: vehicleData.origin || 'Guwahati',
      destination: vehicleData.destination || 'Imphal',
      current_location: vehicleData.current_location || `${vehicleData.origin || 'Guwahati'} Logistics Hub`,
      current_lat: vehicleData.current_lat !== undefined ? Number(vehicleData.current_lat) : 26.1445,
      current_lng: vehicleData.current_lng !== undefined ? Number(vehicleData.current_lng) : 91.7362,
      progress_percent: vehicleData.progress_percent !== undefined ? vehicleData.progress_percent : 5,
      speed_kmh: vehicleData.speed_kmh !== undefined ? vehicleData.speed_kmh : 45,
      eta_hours: vehicleData.eta_hours !== undefined ? vehicleData.eta_hours : 6.0,
      driver_name: vehicleData.driver_name || 'Assigned Driver',
      contact: vehicleData.contact || '+91 98640-XXXXX',
      temp_sensitive: !!vehicleData.temp_sensitive,
      storage_temp_c: vehicleData.storage_temp_c !== undefined ? vehicleData.storage_temp_c : null,
      created_at: vehicleData.created_at || nowIso,
      updated_at: nowIso,
      last_ping: new Date().toLocaleTimeString(),
      gps_mode: 'SIMULATED'
    };

    this.vehicles = [newVehicle, ...this.vehicles];
    this.saveState();
    this.notifySubscribers();
    return newVehicle;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.vehicles);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.vehicles);
      } catch (err) {
        console.error('Subscriber error in vehicleService:', err);
      }
    });
  }

  getVehicles() {
    return this.vehicles;
  }

  getVehicleById(id) {
    return this.vehicles.find(v => v.id === id) || this.vehicles[0];
  }
}

export const vehicleTracker = new VehicleTrackerManager();
