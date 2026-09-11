import React from 'react';
import { Eye, Brain, Shuffle, Navigation, Bell, ArrowRight } from 'lucide-react';

export default function WorkflowBanner({ currentStep = 'PREDICT' }) {
  const steps = [
    { id: 'MONITOR', label: '1. MONITOR', desc: 'Real-Time OpenWeather & PWD Hazards', icon: Eye },
    { id: 'PREDICT', label: '2. PREDICT', desc: 'Random Forest Disruption Model', icon: Brain },
    { id: 'OPTIMIZE', label: '3. OPTIMIZE', desc: 'OSRM Alternate Corridor Scoring', icon: Shuffle },
    { id: 'TRACK', label: '4. TRACK', desc: 'Simulated GPS High-Precision Fleet', icon: Navigation },
    { id: 'ALERT', label: '5. ALERT', desc: 'Life-Saving Supply Threat Dispatch', icon: Bell }
  ];

  return (
    <div className="workflow-banner">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          INTELLIGENCE PIPELINE WORKFLOW
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Autonomous Resilient Logistics Loop for Northeast India
        </span>
      </div>

      <div className="workflow-steps">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          return (
            <React.Fragment key={step.id}>
              <div 
                className={`workflow-step ${isActive ? 'active' : ''}`}
                title={step.desc}
              >
                <Icon size={14} />
                <span>{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <span className="workflow-arrow">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
