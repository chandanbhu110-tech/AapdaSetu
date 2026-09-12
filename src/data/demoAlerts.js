/**
 * SIH NER Smart Logistics Platform - Initial Demo Alerts
 * All alerts maintain unique alert_id.
 */

export const INITIAL_ALERTS = [
  {
    alert_id: 'ALT-MED-V001-JIRIBAM',
    title: 'Critical Medicine Delivery at Risk',
    type: 'Critical Medicine Delivery at Risk',
    severity: 'Critical',
    location: 'Jiribam, Manipur',
    description: 'Vehicle V001 transporting emergency medical cargo on Guwahati → Imphal is at risk due to Critical Route Risk and active Jiribam bridge impairment.',
    route_id: 'R001',
    vehicle_id: 'V001',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    is_acknowledged: false,
    action_required: 'Recommend immediate rerouting via Lumding-Silchar bypass corridor.'
  },
  {
    alert_id: 'ALT-ROUTE-R001-DISRUPT',
    title: 'Critical Route Disruption Risk',
    type: 'Critical Route Disruption Risk',
    severity: 'Critical',
    location: 'Jiribam Bridge Sector, NH37',
    description: 'Guwahati – Imphal corridor Health Score dropped to 25/100 with Random Forest AI disruption risk elevated above safe threshold.',
    route_id: 'R001',
    vehicle_id: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    is_acknowledged: false,
    action_required: 'Deploy emergency BRO structural review team to Jiribam sector.'
  },
  {
    alert_id: 'ALT-WEATHER-SONAPUR-R002',
    title: 'Severe Weather Risk',
    type: 'Severe Weather Risk',
    severity: 'High',
    location: 'Sonapur, Assam',
    description: 'Intense precipitation detected along Shillong → Silchar corridor triggering landslide vulnerability alert at Sonapur.',
    route_id: 'R002',
    vehicle_id: 'V002',
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    is_acknowledged: false,
    action_required: 'Hold heavy multi-axle freight at Lad Rymbai staging depot.'
  },
  {
    alert_id: 'ALT-SLOPE-SHILLONG-R002',
    title: 'Slope Saturation & Landslide Hazard',
    type: 'Landslide Risk',
    severity: 'High',
    location: 'Shillong, Meghalaya',
    description: 'Slope moisture saturation reached 82% threshold after 48h persistent monsoonal downpour.',
    route_id: 'R002',
    vehicle_id: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    is_acknowledged: false,
    action_required: 'Deploy NHAI earth-moving equipment; halt heavy fuel tankers at Nongpoh checkgate.'
  },
  {
    alert_id: 'ALT-VEH-V002-DELAY',
    title: 'Vehicle Delivery Delayed',
    type: 'Vehicle Delivery Delayed',
    severity: 'Warning',
    location: 'Sonapur Landslide Bypass, NH6',
    description: 'Vehicle V002 (Food Grain) delayed by 2.4 hours due to queue near Sonapur landslide clearance.',
    route_id: 'R002',
    vehicle_id: 'V002',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    is_acknowledged: true,
    action_required: 'Monitor clearance progress and supply food-ration ETA to Silchar hub.'
  },
  {
    alert_id: 'ALT-TRAFFIC-JALUKBARI',
    title: 'Freight Congestion Bottleneck',
    type: 'Traffic Congestion',
    severity: 'Warning',
    location: 'Guwahati, Assam',
    description: 'Heavy freight bottleneck at Jalukbari interchange due to emergency highway surface maintenance.',
    route_id: 'R001',
    vehicle_id: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    is_acknowledged: true,
    action_required: 'Divert outgoing non-emergency convoys via North Guwahati bypass.'
  },
  {
    alert_id: 'ALT-CLEAR-SILCHAR-R002',
    title: 'Corridor Clearance Completed',
    type: 'Route Clearance',
    severity: 'Resolved',
    location: 'Silchar, Assam',
    description: 'Fallen trees and rock fragments cleared by Highway Patrol. Pavement inspected and verified safe.',
    route_id: 'R002',
    vehicle_id: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    is_acknowledged: true,
    status: 'Resolved',
    action_required: 'All commercial freight lanes reopened. Normal transit protocol restored.'
  }
];
