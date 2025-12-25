import React from 'react';
import { useSimulation } from '../App';
import { 
  IconSettings, 
  IconMapPin, 
  IconRadio, 
  IconRoute, 
  IconPlayerPlay, 
  IconPlayerPause,
  IconPlayerSkipForward,
  IconPlayerSkipBack,
  IconRefresh,
  IconTrash,
  IconRotate
} from '@tabler/icons-react';

const Sidebar = () => {
  const { 
    params, updateParam, 
    handleRecalculate, isLoading,
    isPlaying, setIsPlaying,
    currentStep, totalSteps, setStep,
    clearDrones, randomizeYaw
  } = useSimulation();

  return (
    <aside className="sidebar">
      <div className="sidebar-heading">Mission setup</div>

      {/* Base Station Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Base station</div>
          <IconMapPin size={16} color="#3b82f6" />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="field">
            <label>Base X</label>
            <input type="number" value={params.baseX} onChange={(e) => updateParam('baseX', e.target.value)} />
          </div>
          <div className="field">
            <label>Base Y</label>
            <input type="number" value={params.baseY} onChange={(e) => updateParam('baseY', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Base Z (Altitude)</label>
          <input type="number" value={params.baseZ} onChange={(e) => updateParam('baseZ', e.target.value)} />
        </div>
      </div>

      {/* User Position Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">User position</div>
          <IconMapPin size={16} color="#f97316" />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="field">
            <label>User X</label>
            <input type="number" value={params.userX} onChange={(e) => updateParam('userX', e.target.value)} />
          </div>
          <div className="field">
            <label>User Y</label>
            <input type="number" value={params.userY} onChange={(e) => updateParam('userY', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Signal Params Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Signal Params</div>
          <IconRadio size={16} color="#22c55e" />
        </div>
        <div className="field">
          <label>Range</label>
          <input type="number" value={params.signalRange} onChange={(e) => updateParam('signalRange', e.target.value)} />
        </div>
        <div className="field">
          <label>Angle (deg)</label>
          <input type="number" value={params.signalAngle} onChange={(e) => updateParam('signalAngle', e.target.value)} />
        </div>
        <div className="field">
          <label>Step Size</label>
          <input type="number" value={params.stepSize} onChange={(e) => updateParam('stepSize', e.target.value)} step="0.5" />
        </div>
      </div>

      {/* Control Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Control</div>
          <IconSettings size={16} color="#9ca3af" />
        </div>
        <button 
          className="primary" 
          style={{ width: '100%', marginBottom: '10px' }}
          onClick={handleRecalculate}
          disabled={isLoading}
        >
          <IconRefresh size={16} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Computing...' : 'Recalculate'}
        </button>
        
        <div className="button-row">
          <button onClick={() => setStep(Math.max(0, currentStep - 1))} title="Prev Step">
            <IconPlayerSkipBack size={16} />
          </button>
          <button onClick={() => setStep(Math.min(totalSteps - 1, currentStep + 1))} title="Next Step">
            <IconPlayerSkipForward size={16} />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className={isPlaying ? 'danger' : ''}>
            {isPlaying ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          <button onClick={randomizeYaw} title="Randomize Yaw">
            <IconRotate size={16} />
          </button>
          <button className="danger" onClick={clearDrones} title="Clear">
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      <div className="hint" style={{ padding: '0 4px', fontSize: '11px', opacity: 0.7 }}>
        Tip: Click on the canvas to add a UAV. Changes in params require recalculation.
      </div>
    </aside>
  );
};

export default Sidebar;
