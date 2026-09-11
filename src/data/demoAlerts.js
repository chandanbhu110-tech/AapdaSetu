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
    description: 'Vehicle V001 transporting emergency medical cargo on Guwahati → Imphal is at risk due to Critical Route Risk and active Jiribam bridge impairment.',
    route_id: 'R001',
    vehicle_id: 'V001',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    is_acknowledged: false,
    action_required: 'Recommend immediate rerouting via Lumding-Silchar bypass corridor.'
  },
  {
    alert_id: 'ALT-ROUTE-R001-DISRUPT',
    title: 'Critical Route Disruption Risk',
    type: 'Critical Route Disruption Risk',
    severity: 'Critical',
    description: 'Guwahati – Imphal corridor Health Score dropped to 25/100 with Random Forest AI disruption risk elevated above safe threshold.',
    route_id: 'R001',
    vehicle_id: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    is_acknowledged: false,
    action_required: 'Deploy emergency BRO structural review team to Jiribam sector.'
  },
  {
    alert_id: 'ALT-WEATHER-SONAPUR-R002',
    title: 'Severe Weather Risk',
    type: 'Severe Weather Risk',
    severity: 'High',
    description: 'Intense precipitation detected along Shillong → Silchar corridor triggering landslide vulnerability alert at Sonapur.',
    route_id: 'R002',
    vehicle_id: 'V002',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    is_acknowledged: false,
    action_required: 'Hold heavy multi-axle freight at Lad Rymbai staging depot.'
  },
  {
    alert_id: 'ALT-VEH-V002-DELAY',
    title: 'Vehicle Delivery Delayed',
    type: 'Vehicle Delivery Delayed',
    severity: 'Moderate',
    description: 'Vehicle V002 (Food Grain) delayed by 2.4 hours due to queue near Sonapur landslide clearance.',
    route_id: 'R002',
    vehicle_id: 'V002',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    is_acknowledged: true,
    action_required: 'Monitor clearance progress and supply food-ration ETA to Silchar hub.'
  }
];
