import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import CanvasView from './components/CanvasView';
import InfoPanel from './components/InfoPanel';
import StatusBar from './components/StatusBar';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

const API_URL = 'http://localhost:8000/api/uav-service/uav/compute/';

// ---------------- AUTH HELPERS ----------------
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ---------------- SIMULATION CONTEXT ----------------
const SimulationContext = createContext();
export const useSimulation = () => useContext(SimulationContext);

// ====================================================
// ======================== MAIN =======================
// ====================================================
function MainApp() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ---------------- PARAMS ----------------
  const [params, setParams] = useState({
    baseX: 0,
    baseY: 0,
    baseZ: 10,
    userX: 60,
    userY: 45,
    signalRange: 40,
    signalAngle: 55,
    stepSize: 3.0,
  });

  // ---------------- STATE ----------------
  const [drones, setDrones] = useState([]);              // исходные дроны
  const [trajectories, setTrajectories] = useState([]); // [{label,x,y,z,yaw}, ...] по шагам
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ---------------- AUTH CHECK ----------------
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('uav_user');

    if (!token || !storedUser) {
      navigate('/login');
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('uav_user');
    setUser(null);
    navigate('/login');
  };

  // ---------------- COMPUTE ----------------
  const handleRecalculate = async () => {
    if (!drones.length) {
      alert('Add at least one drone first.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        user: { x: params.userX, y: params.userY },
        base: { x: params.baseX, y: params.baseY, z: params.baseZ },
        step_size: params.stepSize,
        initial_drone_positions: drones.map((d) => ({
          label: d.label,
          coordinates: {
            x: d.x,
            y: d.y,
            z: params.baseZ,
            yaw: d.yaw || 0,
          },
        })),
      };

      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (resp.status === 401) {
        handleLogout();
        return;
      }

      if (!resp.ok) {
        if (resp.status === 400) {
          const err = await resp.json();
          alert(err.detail || 'Invalid request');
          return;
        }
        throw new Error(`Server error: ${resp.status}`);
      }

      const data = await resp.json();

      if (data.drone_positions) {
        const labels = Object.keys(data.drone_positions);
        const maxLen = Math.max(
          ...Object.values(data.drone_positions).map((t) => t.length)
        );

        const steps = [];
        for (let s = 0; s < maxLen; s++) {
          steps.push(
            labels.map((label) => {
              const track = data.drone_positions[label];
              const p = track[Math.min(s, track.length - 1)];
              return {
                label,
                x: p.x,
                y: p.y,
                z: p.z,
                yaw: p.yaw,
              };
            })
          );
        }

        setTrajectories(steps);
        setCurrentStep(0);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- DRONES ----------------
  const handleAddDrone = (x, y) => {
    const colors = [
      '#ef4444', '#22c55e', '#3b82f6', '#eab308',
      '#a855f7', '#ec4899', '#14b8a6', '#f97316',
    ];

    const index = drones.length;
    const color = colors[index % colors.length];

    setDrones((prev) => [
      ...prev,
      {
        id: index,
        label: `UAV${index + 1}`,
        x,
        y,
        yaw: Math.random() * 360,
        color,
      },
    ]);
  };

  const clearDrones = () => {
    setDrones([]);
    setTrajectories([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const randomizeYaw = () => {
    setDrones((prev) =>
      prev.map((d) => ({ ...d, yaw: Math.random() * 360 }))
    );
    setTrajectories([]);
    setCurrentStep(0);
  };

  const updateParam = (key, val) =>
    setParams((p) => ({ ...p, [key]: parseFloat(val) || 0 }));

  // ---------------- DERIVED (ВАЖНО!) ----------------
  // Сопоставление ТОЛЬКО по label → цвета больше не прыгают
  const currentDronesState = useMemo(() => {
    if (!trajectories.length || currentStep >= trajectories.length) {
      return drones;
    }

    return trajectories[currentStep].map((stepDrone) => {
      const original = drones.find((d) => d.label === stepDrone.label);
      return {
        ...original,
        ...stepDrone,
      };
    });
  }, [drones, trajectories, currentStep]);

  // ---------------- ANIMATION ----------------
  useEffect(() => {
    if (!isPlaying || !trajectories.length) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < trajectories.length - 1) return prev + 1;
        setIsPlaying(false);
        return prev;
      });
    }, 500);

    return () => clearInterval(timer);
  }, [isPlaying, trajectories]);

  // ---------------- CONTEXT ----------------
  const contextValue = {
    params,
    updateParam,
    drones: currentDronesState,
    originalDrones: drones,
    currentStep,
    totalSteps: trajectories.length,
    isPlaying,
    setIsPlaying,
    isLoading,
    handleRecalculate,
    handleAddDrone,
    clearDrones,
    randomizeYaw,
    setStep: setCurrentStep,
  };

  if (!user) return null;

  return (
    <SimulationContext.Provider value={contextValue}>
      <div className="app">
        <TopBar username={user} onLogout={handleLogout} />
        <div className="layout">
          <Sidebar />
          <main className="main">
            <CanvasView />
            <StatusBar />
          </main>
          <InfoPanel />
        </div>
      </div>
    </SimulationContext.Provider>
  );
}

// ====================================================
// ======================== ROUTER =====================
// ====================================================
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<MainApp />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
