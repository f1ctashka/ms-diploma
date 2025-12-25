import React from 'react';
import { useSimulation } from '../App';
import { IconCpu, IconInfoCircle } from '@tabler/icons-react';

const InfoPanel = () => {
  const { drones } = useSimulation();

  return (
    <aside className="info-panel">
      <div className="sidebar-heading">Swarm telemetry</div>
      
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div className="card-header">
          <div className="card-title">Live Feed</div>
          <IconCpu size={16} color="#3b82f6" />
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {drones.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px', fontSize: '12px' }}>
              No drones in swarm. Click canvas to add.
            </div>
          ) : (
            drones.map((drone, idx) => (
              <div key={idx} className="drone-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: drone.color }}>UAV-{drone.id}</span>
                  <span style={{ fontSize: '10px', opacity: 0.6 }}>ACTIVE</span>
                </div>
                <div style={{ opacity: 0.7, fontSize: '10px', marginTop: '4px' }}>
                  Pos: {drone.x.toFixed(1)}, {drone.y.toFixed(1)} | Yaw: {drone.yaw.toFixed(1)}°
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '10px', borderTop: '1px solid #1f2937', paddingTop: '10px', fontSize: '10px', opacity: 0.5 }}>
          <IconInfoCircle size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          Data synchronized with server logic.
        </div>
      </div>
    </aside>
  );
};

export default InfoPanel;
