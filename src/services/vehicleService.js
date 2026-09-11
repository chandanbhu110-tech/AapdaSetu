/**
 * SIH NER Smart Logistics Platform - Vehicle Fleet & Simulated GPS Tracking Service
 * 
 * IMPORTANT:
 * Tracking uses SIMULATED GPS coordinates advancing along the corridor polyline.
 * Clearly displays: "GPS MODE: SIMULATED"
 */

import { DEMO_VEHICLES } from '../data/demoVehicles';
import { DEMO_ROUTES } from '../data/demoRoutes';

class VehicleTrackerManager {
  constructor() {
    this.vehicles = [...DEMO_VEHICLES];
    this.progressIndex = {
      V001: 4, // starting near Jiribam
      V002: 3  // near Sonapur
    };
    this.subscribers = new Set();
    this.timer = null;
    this.startSimulation();
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
          gps_mode: 'SIMULATED'
        };
      }
      return v;
    });

    this.notifySubscribers();
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
