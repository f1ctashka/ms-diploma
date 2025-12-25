import React from 'react';
import { useSimulation } from '../App';

const StatusBar = () => {
  const { currentStep, totalSteps, drones } = useSimulation();
  
  const progress = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="status-bar">
      <div className="status-items">
        <div>
          <div className="status-label">Step</div>
          <div className="status-value">{currentStep} / {totalSteps > 0 ? totalSteps - 1 : 0}</div>
        </div>
        <div>
          <div className="status-label">Active Drones</div>
          <div className="status-value">{drones.length}</div>
        </div>
        <div>
          <div className="status-label">System</div>
          <div className="status-value" style={{ color: '#22c55e' }}>ONLINE</div>
        </div>
      </div>
      <div className="step-progress">
        <div 
          className="step-progress-inner" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StatusBar;
